document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas1");
    const fileInput = document.getElementById("fileupload");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");

    let audioContext;
    let audioSource;
    let analyser;
    let animationId;

    function removeAudioElement() {
        const existingAudio = document.getElementById("audio1");
        if (existingAudio) {
            existingAudio.pause();
            existingAudio.src = '';
            existingAudio.remove();
        }
    }

    function cleanupAudio() {
        if (audioSource) {
            audioSource.disconnect();
            audioSource = null;
        }
    }

    function onMetadataLoaded(audioElement) {
        audioElement.play().catch(error => {
            console.error("Playback error:", error);
        });
    }

    fileInput.addEventListener("change", async function() {
        const files = this.files;
        if (files.length === 0) return;

        removeAudioElement();
        cleanupAudio();

        const audio1 = document.createElement("audio");
        audio1.id = "audio1";
        audio1.controls = true;
        document.getElementById("content").appendChild(audio1);

        audio1.src = URL.createObjectURL(files[0]);

        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        audioSource = audioContext.createMediaElementSource(audio1);
        analyser = audioContext.createAnalyser();
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 512;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        if (animationId) {
            cancelAnimationFrame(animationId);
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            analyser.getByteFrequencyData(dataArray);
            drawVisualizer(bufferLength, dataArray);
            animationId = requestAnimationFrame(animate);
        }

        audio1.addEventListener('loadedmetadata', () => onMetadataLoaded(audio1));

        animate();
    });

    function drawVisualizer(bufferLength, dataArray) {
        let div = canvas.width / bufferLength;
        for (let i = 0; i < bufferLength; i++) {
            const y = dataArray[i] / 255 * canvas.height / 2;
            const height = Math.max(y, 0);

            ctx.fillStyle = "white";
            ctx.fillRect(i * div, canvas.height - height, div + 1, height); // Keep it div for consistent width
        }
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
});
