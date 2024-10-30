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

    // Function to stop and remove current audio element
    function removeAudioElement() {
        const existingAudio = document.getElementById("audio1");
        if (existingAudio) {
            existingAudio.pause();
            existingAudio.src = ''; // Clear the source
            existingAudio.remove(); // Remove the audio element from the DOM
        }
    }

    // Cleanup function
    function cleanupAudio() {
        if (audioSource) {
            audioSource.disconnect(); // Disconnect previous audio source
            audioSource = null; // Set to null
        }
    }

    // Event listener for audio metadata loaded
    function onMetadataLoaded(audioElement) {
        audioElement.play().catch(error => {
            console.error("Playback error:", error);
        });
    }

    // File upload event
    fileInput.addEventListener("change", async function() {
        const files = this.files;
        if (files.length === 0) return; // Check if a file was selected

        // Remove existing audio element and cleanup
        removeAudioElement();
        cleanupAudio();

        // Create a new audio element
        const audio1 = document.createElement("audio");
        audio1.id = "audio1";
        audio1.controls = true; // Keep the controls
        document.getElementById("content").appendChild(audio1);

        // Load new audio file
        audio1.src = URL.createObjectURL(files[0]);

        // Create audio context if it doesn't exist
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        // Create a new MediaElementSource for the new audio element
        audioSource = audioContext.createMediaElementSource(audio1);
        analyser = audioContext.createAnalyser();
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 512;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const div = canvas.width / bufferLength;

        // Clear previous animation if exists
        if (animationId) {
            cancelAnimationFrame(animationId);
        }

        // Animation function
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            analyser.getByteFrequencyData(dataArray);
            drawVisualizer(bufferLength, div, dataArray);
            animationId = requestAnimationFrame(animate);
        }

        // Add event listeners for the new audio element
        audio1.addEventListener('loadedmetadata', () => onMetadataLoaded(audio1));

        // Start the animation
        animate();
    });

    // Draw visualizer function
    function drawVisualizer(bufferLength, div, dataArray) {
        for (let i = 0; i < bufferLength; i++) {
            const y = dataArray[i] * 2; // Scale for visibility
            const height = Math.max(y, 0); // Ensure non-negative height

            ctx.fillStyle = "white";
            ctx.fillRect(i * div, canvas.height - height, div + 1, height); // Keep it div for consistent width
        }
    }

    // Optional: Resize the canvas on window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
});
