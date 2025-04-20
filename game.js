// game.js
import { mintPrize } from './walletconnect.js';

let canvas, ctx;

let pet = {
  x: 100,
  y: 100,
  vx: 1.5,
  vy: 1.5,
  width: 80,
  height: 80,
  speedMultiplier: 1,
  sprite: new Image(),
  stats: {
    eat: 100,
    sleep: 100,
    wash: 100,
    play: 100
  }
};

pet.sprite.src = "assets/RobotTeddy_Ai.png";

// Optional: Debug when image loads
pet.sprite.onload = () => {
  console.log("Pet image loaded!");
};

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function drawPet() {
  if (pet.sprite.complete) {
    ctx.drawImage(pet.sprite, pet.x, pet.y, pet.width, pet.height);
  } else {
    // fallback: red box
    ctx.fillStyle = "red";
    ctx.fillRect(pet.x, pet.y, pet.width, pet.height);
  }
}

function updateStats() {
  for (let key in pet.stats) {
    pet.stats[key] = Math.max(0, pet.stats[key] - 0.02);
  }
}

function drawHUD() {
  Object.keys(pet.stats).forEach((key) => {
    const bar = document.getElementById(`${key}Bar`);
    if (bar) {
      bar.style.width = `${pet.stats[key]}%`;

      if (pet.stats[key] >= 100) {
        bar.className = "status-bar blink-green";
      } else if (pet.stats[key] <= 25) {
        bar.className = "status-bar blink-red";
      } else if (pet.stats[key] < 50) {
        bar.className = "status-bar red";
      } else {
        bar.className = "status-bar green";
      }
    }
  });

  const totalHP = Object.values(pet.stats).reduce((a, b) => a + b, 0) / 4;
  const hpBar = document.getElementById("globalHealthBar");
  if (hpBar) {
    hpBar.style.width = `${totalHP}%`;
  }

  const critical = document.getElementById("criticalWarning");
  if (critical) {
    critical.style.display = totalHP < 10 ? "block" : "none";
  }
}

function checkGameConditions() {
  const values = Object.values(pet.stats);
  const allZero = values.every((v) => v <= 1);
  const totalHP = values.reduce((a, b) => a + b, 0) / 4;

  if (allZero) {
    alert("Game Over: Pet has Disappeared");
    window.location.reload();
  }

  if (totalHP >= 95 && !window.victoryAchieved) {
    window.victoryAchieved = true;
    pet.speedMultiplier = 2;
    alert("Victory!");
    mintPrize();
  }
}

function movePet() {
  pet.x += pet.vx * pet.speedMultiplier;
  pet.y += pet.vy * pet.speedMultiplier;

  if (pet.x <= 0 || pet.x + pet.width >= canvas.width) pet.vx *= -1;
  if (pet.y <= 0 || pet.y + pet.height >= canvas.height) pet.vy *= -1;
}

function isCollidingWithButton(btnId) {
  const btn = document.getElementById(btnId);
  const rect = btn.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const bx = rect.left - canvasRect.left;
  const by = rect.top - canvasRect.top;

  return (
    pet.x < bx + rect.width &&
    pet.x + pet.width > bx &&
    pet.y < by + rect.height &&
    pet.y + pet.height > by
  );
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  movePet();
  drawPet();
  updateStats();
  drawHUD();
  checkGameConditions();

  if (isCollidingWithButton("btnEat")) pet.stats.eat = Math.min(100, pet.stats.eat + 1);
  if (isCollidingWithButton("btnSleep")) pet.stats.sleep = Math.min(100, pet.stats.sleep + 1);
  if (isCollidingWithButton("btnWash")) pet.stats.wash = Math.min(100, pet.stats.wash + 1);
  if (isCollidingWithButton("btnPlay")) pet.stats.play = Math.min(100, pet.stats.play + 1);

  requestAnimationFrame(gameLoop);
}

function movePetTo(buttonId) {
  const btn = document.getElementById(buttonId);
  const rect = btn.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const targetX = rect.left - canvasRect.left + rect.width / 2 - pet.width / 2;
  const targetY = rect.top - canvasRect.top + rect.height / 2 - pet.height / 2;

  pet.x = targetX;
  pet.y = targetY;
}

window.addEventListener("load", () => {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  resizeCanvas();
  console.log("Canvas:", canvas.width, canvas.height);
  console.log("Pet Position:", pet.x, pet.y);
  gameLoop();

  // Bind buttons once canvas is ready
  document.getElementById("btnEat").addEventListener("click", () => movePetTo("btnEat"));
  document.getElementById("btnSleep").addEventListener("click", () => movePetTo("btnSleep"));
  document.getElementById("btnWash").addEventListener("click", () => movePetTo("btnWash"));
  document.getElementById("btnPlay").addEventListener("click", () => movePetTo("btnPlay"));
});
