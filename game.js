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
  },
  isRoaming: true, // track if pet is roaming
  targetStat: null // store which stat is being interacted with
};

let globalHealth = 100;
let globalTraining = 0;
let trainingUnlocked = false;

let statCooldowns = {
  eat: 0,
  sleep: 0,
  wash: 0,
  play: 0
};

let lastStatInteraction = Date.now(); // track last interaction time

pet.sprite.src = "/RobotTeddyAi.png";
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
  // Decrease stats by 0.02 each frame
  for (let key in pet.stats) {
    pet.stats[key] = Math.max(0, pet.stats[key] - 0.02);
    if (pet.stats[key] === 0) {
      // Trigger pet to move to a stat-related button
      pet.isRoaming = false;
      pet.targetStat = key;
      movePetTo(`${key}StatButton`);
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
  if (pet.isRoaming) {
    pet.x += pet.vx * pet.speedMultiplier;
    pet.y += pet.vy * pet.speedMultiplier;

    if (pet.x <= 0 || pet.x + pet.width >= canvas.width) pet.vx *= -1;
    if (pet.y <= 0 || pet.y + pet.height >= canvas.height) pet.vy *= -1;
  }
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

function movePetTo(buttonId) {
  const btn = document.getElementById(buttonId);
  const rect = btn.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const targetX = rect.left - canvasRect.left + rect.width / 2 - pet.width / 2;
  const targetY = rect.top - canvasRect.top + rect.height / 2 - pet.height / 2;

  pet.x = targetX;
  pet.y = targetY;
}

function handleStatInteraction(stat) {
  if (statCooldowns[stat] > 0) {
    alert(`You must wait before interacting with ${stat}.`);
    return;
  }

  // Increase stat and apply cooldown
  pet.stats[stat] = Math.min(100, pet.stats[stat] + 25);
  statCooldowns[stat] = 10; // 10 seconds cooldown
  lastStatInteraction = Date.now();

  // Increase health if stat is full
  if (pet.stats[stat] === 100) {
    globalHealth = Math.min(100, globalHealth + 5);
  }

  // Reset to roaming state if all stats are above 1%
  if (Object.values(pet.stats).every(value => value > 0)) {
    pet.isRoaming = true;
    pet.targetStat = null;
  }
}

function updateCooldowns() {
  // Update cooldowns every second
  const now = Date.now();
  for (let stat in statCooldowns) {
    if (statCooldowns[stat] > 0) {
      statCooldowns[stat] = Math.max(0, statCooldowns[stat] - (now - lastStatInteraction) / 1000);
    }
  }

  // Health decrease logic for low stats
  for (let key in pet.stats) {
    if (pet.stats[key] === 0) {
      globalHealth = Math.max(0, globalHealth - 5);
    }
  }

  // Global health increase logic
  if (Object.values(pet.stats).every(value => value > 75)) {
    globalHealth = Math.min(100, globalHealth + 10);
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  movePet();
  updateStats();
  drawPet();
  drawHUD();
  checkGameConditions();
  updateCooldowns();

  const buttons = ["btnEat", "btnSleep", "btnWash", "btnPlay"];
  buttons.forEach(btn => {
    if (isCollidingWithButton(btn)) {
      const stat = btn.replace("btn", "").toLowerCase();
      handleStatInteraction(stat);
    }
  });

  requestAnimationFrame(gameLoop);
}

document.getElementById("btnEat").addEventListener("click", () => handleStatInteraction("eat"));
document.getElementById("btnSleep").addEventListener("click", () => handleStatInteraction("sleep"));
document.getElementById("btnWash").addEventListener("click", () => handleStatInteraction("wash"));
document.getElementById("btnPlay").addEventListener("click", () => handleStatInteraction("play"));

window.addEventListener("load", () => {
  resizeCanvas();
  console.log("Canvas:", canvas.width, canvas.height);
  console.log("Pet Position:", pet.x, pet.y);
  gameLoop();
});
