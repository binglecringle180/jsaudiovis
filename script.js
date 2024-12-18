document.addEventListener("DOMContentLoaded", () => {
    const full = document.getElementById("full");
    const canvas = document.getElementById("canvas1");
    const fileinput = document.getElementById("fileupload");
    const filelabel = document.getElementById("filename");
    const content = document.getElementById("content")
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    full.addEventListener('click', function() {
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    });

    document.addEventListener('fullscreenchange', function() {
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (full) full.src = 'data:image/svg+xml,%3Csvg width%3D"20" height%3D"20" xmlns%3D"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg"%3E%3Cg fill%3D"%23ffffff" fill-rule%3D"evenodd"%3E%3Cpath d%3D"M16.338 7.35l-.89-.891-3.133 2.374a.815.815 0 01-1.15-.165.819.819 0 010-.986l2.368-3.142-.867-.871a.387.387 0 01.269-.664L16.612 3a.397.397 0 01.388.389V7.08a.387.387 0 01-.662.27M3.662 12.65l.89.89 3.133-2.374a.817.817 0 011.15.166.819.819 0 010 .985l-2.37 3.143.87.871c.248.25.071.664-.27.664L3.388 17A.397.397 0 013 16.611V12.92c0-.342.418-.514.662-.27M3.662 7.35l.89-.891 3.133 2.374a.815.815 0 001.15-.165.819.819 0 000-.986L6.465 4.54l.87-.871a.387.387 0 00-.27-.664L3.388 3A.397.397 0 003 3.389V7.08c0 .341.418.514.662.27M16.338 12.65l-.89.89-3.133-2.374a.817.817 0 00-1.15.166.819.819 0 000 .985l2.368 3.143-.867.871a.387.387 0 00.269.664l3.677.005a.397.397 0 00.388-.389V12.92a.387.387 0 00-.662-.27"%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E'
        } else {
            if (full) full.src = 'data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M12.662%203.65l.89.891%203.133-2.374a.815.815%200%20011.15.165.819.819%200%20010%20.986L15.467%206.46l.867.871c.25.25.072.664-.269.664L12.388%208A.397.397%200%200112%207.611V3.92c0-.341.418-.514.662-.27M7.338%2016.35l-.89-.89-3.133%202.374a.817.817%200%2001-1.15-.166.819.819%200%20010-.985l2.37-3.143-.87-.871a.387.387%200%2001.27-.664L7.612%2012a.397.397%200%2001.388.389v3.692a.387.387%200%2001-.662.27M7.338%203.65l-.89.891-3.133-2.374a.815.815%200%2000-1.15.165.819.819%200%20000%20.986l2.37%203.142-.87.871a.387.387%200%2000.27.664L7.612%208A.397.397%200%20008%207.611V3.92a.387.387%200%2000-.662-.27M12.662%2016.35l.89-.89%203.133%202.374a.817.817%200%20001.15-.166.819.819%200%20000-.985l-2.368-3.143.867-.871a.387.387%200%2000-.269-.664L12.388%2012a.397.397%200%2000-.388.389v3.692c0%20.342.418.514.662.27%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E'
        }
    });

    let audioContext;
    let audioSource;
    let analyserVisualizer;
    let analyserWaveform;
    let gainVisualizer;
    let gainWaveform;
    let animationId;

    function onMetadataLoaded(audioElement) {
        audioElement.play().catch(error => {
            console.error("Playback error:", error);
        });
    }

    fileinput.addEventListener("change", async function() {
        const files = this.files;
        let filename = files[0] ? files[0].name : 'No file chosen';
        const extension = filename.substring(filename.lastIndexOf('.'), filename.length);
        filename = filename.substring(0, filename.lastIndexOf('.'));
        filelabel.textContent = `${filename} (${extension})`;

        if (files.length === 0) return;

        const existingAudio = document.getElementById("audio1");
        if (existingAudio) {
            existingAudio.pause();
            existingAudio.src = '';
            existingAudio.remove();
        }
        if (audioSource) {
            audioSource.disconnect();
            audioSource = null;
        }

        const audio1 = document.createElement("audio");
        audio1.id = "audio1";
        audio1.controls = true;
        content.appendChild(audio1);

        audio1.src = URL.createObjectURL(files[0]);

        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        audioSource = audioContext.createMediaElementSource(audio1);

        analyserVisualizer = audioContext.createAnalyser();
        analyserWaveform = audioContext.createAnalyser();
        analyserVisualizer.fftSize = 512;
        analyserWaveform.fftSize = 4096;
        gainVisualizer = audioContext.createGain();
        gainWaveform = audioContext.createGain();
        audioSource.connect(analyserVisualizer);
        audioSource.connect(analyserWaveform);
        analyserVisualizer.connect(gainVisualizer);
        analyserWaveform.connect(gainWaveform);
        gainVisualizer.connect(audioContext.destination);
        gainWaveform.connect(audioContext.destination);

        gainVisualizer.gain.value = 1;
        gainWaveform.gain.value = 0;

        const bufferLengthVisualizer = analyserVisualizer.frequencyBinCount;
        const bufferLengthWaveform = analyserWaveform.frequencyBinCount;
        const dataArrayVisualizer = new Uint8Array(bufferLengthVisualizer);
        const dataArrayWaveform = new Uint8Array(bufferLengthWaveform);

        if (animationId) {
            cancelAnimationFrame(animationId);
        }

        function drawVisualizer(bufferLengthFrequency, dataArrayFrequency, bufferLengthWaveform, dataArrayWaveform) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const divFrequency = canvas.width / bufferLengthFrequency;
            const scaleFrequency = canvas.height / 2;
        
            for (let i = 0; i < bufferLengthFrequency; i++) {
                const y = (dataArrayFrequency[i] / 255) * scaleFrequency;
                const height = Math.max(y, 0);
                
                const hue = (i / bufferLengthFrequency) * 360;
                const saturation = 50 + (height / scaleFrequency * 40);
                ctx.fillStyle = `hsl(${hue}, 100%, ${saturation}%)`;
                
                ctx.fillRect(i * divFrequency, canvas.height - height, divFrequency + 1, height);
            }
        
            const divWaveform = canvas.width / bufferLengthWaveform + 1;
            const scaleWaveform = canvas.height / 4;
            ctx.strokeStyle = "white";
            ctx.beginPath();
            
            for (let i = 0; i < bufferLengthWaveform; i++) {
                const y = (dataArrayWaveform[i * 2] / 255) * scaleWaveform + scaleWaveform;
                ctx[i === 0 ? 'moveTo' : 'lineTo'](i * divWaveform, y);
            }
            ctx.stroke();
        }
        
        function animate() {
            if (!audio1.paused) {
                analyserVisualizer.getByteFrequencyData(dataArrayVisualizer);
                analyserWaveform.getByteTimeDomainData(dataArrayWaveform);
                
                drawVisualizer(bufferLengthVisualizer, dataArrayVisualizer, bufferLengthWaveform, dataArrayWaveform);
            }
        
            animationId = requestAnimationFrame(animate);
        }

        audio1.addEventListener('loadedmetadata', () => onMetadataLoaded(audio1));

        animate();
    });

    
});