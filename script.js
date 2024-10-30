const container = document.getElementById("container");
const canvas = document.getElementById("canvas1");
const file = document.getElementById("fileupload");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

let audioContext;
let audioSource;
let analyser;
let audio1 = document.getElementById("audio1");
let animationId; // Variable to track the animation frame request

// Function to stop current audio
function stopAudio() {
    if (audio1.src) {
        audio1.pause();
        audio1.src = ''; // Clear the source
        audio1.load(); // Load to reset state
    }
}

// File upload event
file.addEventListener("change", async function() {
    const files = this.files;
    if (files.length === 0) return; // Check if a file was selected

    stopAudio(); // Stop any currently playing audio

    // Load new audio file
    audio1.src = URL.createObjectURL(files[0]);
    audio1.load();

    // Create audio context if it doesn't exist
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    // Disconnect previous audio source if it exists
    if (audioSource) {
        audioSource.disconnect();
    }
    
    // Create a new MediaElementSource and Analyser
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
        animationId = requestAnimationFrame(animate); // Store the animation frame ID
    }
    animate();

    // Start playback after the audio element is ready
    audio1.play().catch(error => {
        console.error("Playback error:", error);
    });
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