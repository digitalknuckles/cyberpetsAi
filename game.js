const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let pet = {
  x: 200,
  y: 300,
  width: 80,
  height: 80,
  color: "#FFAA00",
  hunger: 100,
  happiness: 100,
  energy: 100,
  cleanliness: 100,
};

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function drawPet() {
  ctx.fillStyle = pet.color;
  ctx.fillRect(pet.x, pet.y, pet.width, pet.height);
}

function drawStatusBars() {
  const barWidth = 150;
  const barHeight = 10;
  const spacing = 15;
  const labels = ["Hunger", "Happiness", "Energy", "Cleanliness"];
  const values = [
    pet.hunger,
    pet.happiness,
    pet.energy,
    pet.cleanliness,
  ];

  ctx.font = "14px sans-serif";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#fff";

  for (let i = 0; i < labels.length; i++) {
    const x = 10;
    const y = 10 + i * (barHeight + spacing + 10);

    ctx.fillText(labels[i], x, y);
    ctx.fillStyle = "#555";
    ctx.fillRect(x, y + 18, barWidth, barHeight);
    ctx.fillStyle = "#0f0";
    ctx.fillRect(x, y + 18, (values[i] / 100) * barWidth, barHeight);
  }
}

function updateGame() {
  // Basic decay
  pet.hunger -= 0.02;
  pet.happiness -= 0.01;
  pet.energy -= 0.015;
  pet.cleanliness -= 0.01;

  // Clamp values
  pet.hunger = Math.max(0, pet.hunger);
  pet.happiness = Math.max(0, pet.happiness);
  pet.energy = Math.max(0, pet.energy);
  pet.cleanliness = Math.max(0, pet.cleanliness);
}

function drawGameOver() {
  ctx.fillStyle = "#000000cc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "32px sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText("Game Over", canvas.width / 2 / (window.devicePixelRatio || 1) - 80, canvas.height / 2 / (window.devicePixelRatio || 1));
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateGame();
  drawPet();
  drawStatusBars();

  if (
    pet.hunger <= 0 ||
    pet.happiness <= 0 ||
    pet.energy <= 0 ||
    pet.cleanliness <= 0
  ) {
    drawGameOver();
  } else {
    requestAnimationFrame(gameLoop);
  }
}

// Button event handlers
document.getElementById("btnEat").addEventListener("click", () => {
  pet.hunger = Math.min(pet.hunger + 20, 100);
});

document.getElementById("btnSleep").addEventListener("click", () => {
  pet.energy = Math.min(pet.energy + 20, 100);
});

document.getElementById("btnWash").addEventListener("click", () => {
  pet.cleanliness = Math.min(pet.cleanliness + 20, 100);
});

document.getElementById("btnPlay").addEventListener("click", () => {
  pet.happiness = Math.min(pet.happiness + 20, 100);
});

document.getElementById("btnConnect").addEventListener("click", () => {
  alert("Wallet connect feature coming soon!");
});

gameLoop();