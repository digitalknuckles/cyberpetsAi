import { mintPrize } from './walletconnect.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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

let globalHealth = 100;
let globalTraining = 0;
let trainingUnlocked = false;

pet.sprite.src = "/RobotTeddy_Ai.png";
pet.sprite.onload = () => console.log('Pet sprite loaded successfully');
pet.sprite.onerror = () => console.error('Failed to load pet sprite image');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function drawPet() {
  if (pet.sprite.complete && pet.sprite.naturalWidth > 0) {
    ctx.drawImage(pet.sprite, pet.x, pet.y, pet.width, pet.height);
  } else {
    ctx.fillStyle = "red";
    ctx.fillRect(pet.x, pet.y, pet.width, pet.height);
  }
}

function updateStats() {
  for (let key in pet.stats) {
    pet.stats[key] = Math.max(0, pet.stats[key] - 0.02);
    if (pet.stats[key] === 0) {
      if (!trainingUnlocked) {
        globalHealth = Math.max(0, globalHealth - 0.05);
      } else {
        globalTraining = Math.max(0, globalTraining - 0.05);
      }
    }
  }
}

function drawHUD() {
  Object.keys(pet.stats).forEach((key) => {
    const bar = document.getElementById(`${key}Bar`);
    if (bar) {
      bar.style.width = `${pet.stats[key]}%`;
      if (pet.stats[key] >= 100) bar.className = "status-bar blink-green";
      else if (pet.stats[key] <= 25) bar.className = "status-bar blink-red";
      else if (pet.stats[key] < 50) bar.className = "status-bar red";
      else bar.className = "status-bar green";
    }
  });

  const hpBar = document.getElementById("globalHealthBar");
  if (hpBar) hpBar.style.width = `${globalHealth}%`;

  const trainingBar = document.getElementById("globalTrainingBar");
  if (trainingBar) trainingBar.style.width = `${globalTraining}%`;

  const critical = document.getElementById("criticalWarning");
  if (critical) critical.style.display = globalHealth < 10 ? "block" : "none";
}

function checkGameConditions() {
  const values = Object.values(pet.stats);
  const allZero = values.every((v) => v <= 1);

  if (allZero) {
    alert("Game Over: Pet has Disappeared");
    window.location.reload();
  }

  if (globalHealth >= 100 && !trainingUnlocked) {
    trainingUnlocked = true;
    console.log("Training Unlocked!");
  }

  if (globalHealth >= 100 && trainingUnlocked && globalTraining >= 100 && !window.victoryAchieved) {
    window.victoryAchieved = true;
    pet.speedMultiplier = 2;
    setTimeout(() => {
      alert("🎉 Super Star Pet Vibes! 🐾\nMint your prize!");
      mintPrize();
    }, 300);
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

  const buttons = ["btnEat", "btnSleep", "btnWash", "btnPlay"];
  buttons.forEach(btn => {
    if (isCollidingWithButton(btn)) {
      const stat = btn.replace("btn", "").toLowerCase();
      if (pet.stats[stat] < 100) {
        pet.stats[stat] = Math.min(100, pet.stats[stat] + 1);
        if (globalHealth < 100) {
          globalHealth = Math.min(100, globalHealth + 0.5);
        } else if (trainingUnlocked) {
          globalTraining = Math.min(100, globalTraining + 0.5);
        }
      }
    }
  });

  requestAnimationFrame(gameLoop);
}

document.getElementById("btnEat").addEventListener("click", () => movePetTo("btnEat"));
document.getElementById("btnSleep").addEventListener("click", () => movePetTo("btnSleep"));
document.getElementById("btnWash").addEventListener("click", () => movePetTo("btnWash"));
document.getElementById("btnPlay").addEventListener("click", () => movePetTo("btnPlay"));

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
  resizeCanvas();
  console.log("Canvas:", canvas.width, canvas.height);
  console.log("Pet Position:", pet.x, pet.y);
  gameLoop();
});
