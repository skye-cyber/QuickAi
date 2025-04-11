  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  let width, height, cx, cy;

  function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      cx = width / 2;
      cy = height / 2;
  }
  window.addEventListener("resize", resize);
  resize();

  // Create sphere points
  const dots = [];
  const radius = 200;
  const count = 400;

  // We'll assume our analyser provides about 128 frequency bins
  const numFreqBins = 80;

  for (let i = 0; i < count; i++) {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();
      dots.push({
          x: radius * Math.sin(theta) * Math.cos(phi),
                y: radius * Math.sin(theta) * Math.sin(phi),
                z: radius * Math.cos(theta),
                color: getRandomColor(),
                size: Math.random() * 3 + 1,
                // Assign a random frequency bin to this dot
                freqBin: Math.floor(Math.random() * numFreqBins)
      });
  }

  function getRandomColor() {
      const h = Math.floor(Math.random() * 360);
      return `hsl(${h}, 100%, 60%)`;
  }

  // Rotation and audio level variables
  let angle = 0;
  let audioLevel = 0.5;

export default async function SetAudioAnim(stream){
    try {
        // Setup Web Audio API
        console.log("Getting audio from the provided stream...");
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount; // ~128 bins
        const dataArray = new Uint8Array(bufferLength);

        function animate() {
            ctx.clearRect(0, 0, width, height);

            // Get current audio frequency data
            analyser.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
            audioLevel = avg / 256; // Normalize between 0 and 1

            // Adjust rotation speed based on overall audio level
            angle += 0.01 + audioLevel * 0.05;

            for (let dot of dots) {
                // Rotate dot around Y axis
                const x = dot.x * Math.cos(angle) - dot.z * Math.sin(angle);
                const z = dot.x * Math.sin(angle) + dot.z * Math.cos(angle);
                let y = dot.y;

                // Perspective projection
                const scale = 500 / (500 + z);
                let x2d = x * scale + cx;
                let y2d = y * scale + cy;

                // AI-ish dynamic clustering:
                // Get amplitude for this dot's frequency bin
                const amplitudeForDot = dataArray[dot.freqBin] / 256;
                // Map the frequency bin to a factor (lower bins get positive, higher negative)
                const freqFactor = dot.freqBin / bufferLength;
                // Calculate vertical offset (tweak the multiplier for stronger effect)
                const yOffset = (0.5 - freqFactor) * amplitudeForDot * 50;

                y2d += yOffset;

                ctx.beginPath();
                // Dot size can also pulse with the audio level
                ctx.arc(x2d, y2d, dot.size * (1 + audioLevel), 0, Math.PI * 2);
                ctx.fillStyle = dot.color;
                ctx.fill();
            }

            requestAnimationFrame(animate);
        }
        animate();
  }catch(err)  {
      console.error("Microphone access denied.", err);
  }
}

