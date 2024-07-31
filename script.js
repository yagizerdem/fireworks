const CANVAS = document.getElementById("canvas");
const CONTEXT = CANVAS.getContext("2d");
CANVAS.width = window.innerWidth;
CANVAS.height = window.innerHeight;
CANVAS.style.background = "black";

var halfHeight = CANVAS.height / 2;
var deltaTime = 0;
var gravity = 10;
var prefCycle = Date.now();
var currentCycle = Date.now();
var cycleCount = 0;
var fps = "calculating ...";

window.addEventListener("resize", () => {
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;

  halfHeight = CANVAS.height / 2;
});

var fireWorks = [];
var particles = [];

// classes
class FireWork {
  static velocityY = -10;
  static radius = 4;
  constructor({ x, y, y_cap }) {
    this.x = x;
    this.y = y;
    this.sinWave = 0; // radians
    this.direaction = Math.random() < 0.5 ? 1 : -1;
    this.step = Math.PI * (Math.random() * (0.0006 - 0.0001) + 0.0001);
    this.y_cap = y_cap;
    this.velocity = { x: 10, y: FireWork.velocityY };
    this.prevPositions = [];
    this.radius = FireWork.radius;
    this.color = ["red", "blue", "green"][Math.floor(Math.random() * 3)];
    this.exploded = false;
  }
  move() {
    if (this.y <= this.y_cap) return;
    this.prevPositions.push({
      x: this.x,
      y: this.y,
      opacity: 1,
    });

    this.x +=
      (this.velocity.x * deltaTime * Math.sin(this.sinWave) * this.direaction) /
      20;
    this.y += (this.velocity.y * deltaTime) / 20;

    this.sinWave += this.step;
  }
  draw() {
    // Draw the circle
    CONTEXT.beginPath(); // Start a new path
    CONTEXT.arc(this.x, this.y, this.radius, 0, 2 * Math.PI); // Draw the circle
    CONTEXT.fillStyle = this.color; // Fill color
    CONTEXT.fill(); // Fill the circle with the color
  }
  drawTail() {
    for (var i = this.prevPositions.length - 1; i >= 0; i--) {
      const element = this.prevPositions[i];
      CONTEXT.globalAlpha = element.opacity; // Set opacity to 50%
      CONTEXT.beginPath(); // Start a new path
      CONTEXT.arc(element.x, element.y, this.radius, 0, 2 * Math.PI); // Draw the circle
      CONTEXT.fillStyle = this.color; // Fill color
      CONTEXT.fill(); // Fill the circle with the color
      element.opacity -= 0.012;
      if (element.opacity <= 0) {
        this.prevPositions.splice(i, 1);
      }
    }
    CONTEXT.globalAlpha = 1; // Set opacity to 50%
  }
  checkExplosion() {
    return this.y <= this.y_cap && !this.exploded;
  }
}
class Particle {
  static baseVelocity = 10;
  constructor({ x, y }) {
    this.color = ["red", "blue", "green"][Math.floor(Math.random() * 3)];
    this.x = x;
    this.y = y;
    this.angle = Math.PI * Math.random() * -1;
    this.velocity = {
      x: Math.cos(this.angle) * Particle.baseVelocity * Math.random(),
      y: Math.sin(this.angle) * Particle.baseVelocity * 1,
    };
    this.radius = 2;
  }
  draw() {
    CONTEXT.beginPath(); // Start a new path
    CONTEXT.arc(this.x, this.y, this.radius, 0, 2 * Math.PI); // Draw the circle
    CONTEXT.fillStyle = this.color; // Fill color
    CONTEXT.fill(); // Fill the circle with the color
  }
  move() {
    this.x += (this.velocity.x * deltaTime) / 20;

    this.velocity.y += (gravity * deltaTime) / 1000;

    this.y += (this.velocity.y * deltaTime) / 20;
  }
}
//

function animate() {
  currentCycle = Date.now();
  calcFps();
  update();
  draw();
  requestAnimationFrame(animate);
  prefCycle = currentCycle;
}

function update() {
  while (fireWorks.length < 5) {
    const newFirework = new FireWork({
      x: Math.floor(Math.random() * CANVAS.width - 100) + 100,
      y: halfHeight * 2,
      y_cap: halfHeight - Math.floor(Math.random() * halfHeight) + 100,
    });
    fireWorks.push(newFirework);
  }
  for (var i = fireWorks.length - 1; i >= 0; i--) {
    var fireWork = fireWorks[i];
    fireWork.move();
    // console.log(fireWork);
    if (fireWork.prevPositions.length == 0) {
      fireWorks.splice(i, 1);
    }
  }

  fireWorks.forEach((element) => {
    if (element.checkExplosion()) {
      for (var i = 0; i < 30; i++) {
        const newparticle = new Particle({
          x: element.x,
          y: element.y,
        });
        particles.push(newparticle);
      }
      element.exploded = true;
    }
  });

  for (var i = particles.length - 1; i >= 0; i--) {
    var particle = particles[i];
    particle.move();
    if (particle.y >= CANVAS.height) {
      particles.splice(i, 1);
    }
  }
  console.log(particles);
}
function draw() {
  CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
  printFps();

  fireWorks.forEach((element) => {
    element.draw();
    element.drawTail();
  });
  particles.forEach((element) => {
    element.draw();
  });
}

animate();

function calcFps() {
  deltaTime = currentCycle - prefCycle;
  cycleCount++;
  if (cycleCount == 60) {
    fps = 1000 / deltaTime;
    cycleCount = 0;
  }
}

function printFps() {
  // Set font style, size, and color
  CONTEXT.font = "30px Arial";
  CONTEXT.fillStyle = "blue";

  // Draw text on the canvas
  CONTEXT.fillText(
    `${!(fps * 1) ? fps : `fps rate : ${(fps * 1).toFixed(0)}`}`,
    50,
    100
  );
}
