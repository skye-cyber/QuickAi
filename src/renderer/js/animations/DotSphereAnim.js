 const canvas = document.getElementById('body-canvas');
 const ctx = canvas.getContext('2d');
 let width, height, cx, cy;
 function resize() {
   width = canvas.width = window.innerWidth;
   height = canvas.height = window.innerHeight-100;
   cx = width / 2;
   cy = height / 2;
 }
 window.addEventListener('resize', resize);
 resize();

 // Settings for the sphere
 const numPoints = 800;
 const sphereRadius = 500;
 const points = [];
 const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // for even distribution

 // Create points distributed evenly on the sphere (Fibonacci Sphere)
 for (let i = 0; i < numPoints; i++) {
   const y = 1 - (i / (numPoints - 1)) * 2; // y goes from 1 to -1
   const radiusAtY = Math.sqrt(1 - y * y);
   const theta = goldenAngle * i;
   const x = Math.cos(theta) * radiusAtY;
   const z = Math.sin(theta) * radiusAtY;
   points.push({
     x: x,
     y: y,
     z: z,
     // Random starting color
     color: getRandomColor(),
               // Assign a random time offset for color change
               changeTimer: Math.random() * 2000
   });
 }

 // Function to get a random color in HSL format for vibrant colors
 function getRandomColor() {
   const hue = Math.floor(Math.random() * 720);
   return `hsl(${hue}, 80%, 60%)`;
 }

 let lastTime = performance.now();
 let angleX = 0;
 let angleY = 0;

 function animate(now) {
   const deltaTime = now - lastTime;
   lastTime = now;
   // Update rotation angles
   angleX += deltaTime * 0.0003; // rotation speed around X
   angleY += deltaTime * 0.0002; // rotation speed around Y

   // Clear canvas with slight transparency for trail effect
   ctx.clearRect(0, 0, width, height);

   // Update and draw each point
   for (let p of points) {
     // Update timer and change color if timer elapsed
     p.changeTimer -= deltaTime;
     if (p.changeTimer <= 0) {
       p.color = getRandomColor();
       p.changeTimer = 2000 + Math.random() * 2000; // change every 2-4 seconds
     }

     // 3D Rotation around the X-axis
     let y1 = p.y * Math.cos(angleX) - p.z * Math.sin(angleX);
     let z1 = p.y * Math.sin(angleX) + p.z * Math.cos(angleX);

     // 3D Rotation around the Y-axis
     let x1 = p.x * Math.cos(angleY) + z1 * Math.sin(angleY);
     let z2 = -p.x * Math.sin(angleY) + z1 * Math.cos(angleY);

     // === DEPTH CULLING ===
     // Only keep points in front of the camera (i.e. positive z2)
     if (z2 >= 0.99) {
       continue;
     }

     // Perspective projection
     const perspective = 510; // distance from viewer to screen
     const z3D = z2 * sphereRadius;
     const scale = perspective / (perspective - z3D);
     const x2d = cx + x1 * sphereRadius * scale;
     const y2d = cy + y1 * sphereRadius * scale;

     // Adjust dot size based on depth
     const dotSize = 3 * scale;

     // Draw the dot
     ctx.beginPath();
     ctx.arc(x2d, y2d, dotSize, 0, 2 * Math.PI);
     ctx.fillStyle = p.color;
     ctx.fill();
   }

   requestAnimationFrame(animate);
 }
 requestAnimationFrame(animate);
