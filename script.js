const container = document.getElementById("container");
const canvas = document.getElementById("canvas1");
const file = document.getElementById("fileupload");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
let audioContext;
audioContext = new AudioContext();
let audioSource;
let analyser;

file.addEventListener("change", function(){
    const files = this.files;
    const audio1 = document.getElementById("audio1");
    audio1.src = '';
    audio1.src = URL.createObjectURL(files[0]);
    audio1.load();
    audio1.play();
    audioSource = audioContext.createMediaElementSource(audio1);
    analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 512; //size
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const div = canvas.width/bufferLength;
    let x;
    let y;

    function animate(){
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
        drawVisualizer(bufferLength, x, div, y, dataArray);
        requestAnimationFrame(animate);
    }
    animate();
    
})

function drawVisualizer(bufferLength, x, div, y, dataArray){
    for (let i = 0; i < bufferLength; i++){
        y = dataArray[i] * 2;
        ctx.fillStyle = "white";
        ctx.fillRect(x, canvas.height - y, div, y);
        x += div;
    }
}