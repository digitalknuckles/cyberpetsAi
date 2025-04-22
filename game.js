import { mintPrize } from './walletconnect.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let pet = {
  x: 300,
  y: 300,
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
  isRoaming: true,
  targetStat: null,
  isPaused: false,
  pauseDuration: 0,
  collisionMsg: null,
  lastStatHandled: null
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

let lastStatInteraction = Date.now();

function moveTowardTarget(targetX, targetY, speed = 2) {
  const dx = targetX - pet.x;
  const dy = targetY - pet.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > 1) {
    pet.vx = (dx / dist) * speed;
    pet.vy = (dy / dist) * speed;
    pet.x += pet.vx;
    pet.y += pet.vy;
  } else {
    pet.vx = 0;
    pet.vy = 0;
    pet.isPaused = true;
    setTimeout(() => {
      pet.isPaused = false;
    }, 1000);
  }
}

pet.sprite.src = "./RobotTeddyAi.png";
pet.sprite.onload = () => console.log('Pet sprite loaded successfully');
pet.sprite.onerror = () => console.error('Failed to load pet sprite image');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function drawPet() {
  if (pet.sprite.complete && pet.sprite.naturalWidth > 0) {
    ctx.drawImage(pet.sprite, pet.x, pet.y, pet.width, pet.height);
    if (pet.collisionMsg) {
      ctx.font = "20px Arial";
      ctx.fillStyle = "black";
      ctx.fillText(pet.collisionMsg, pet.x + pet.width + 10, pet.y + 20);
    }
  } else {
    ctx.fillStyle = "red";
    ctx.fillRect(pet.x, pet.y, pet.width, pet.height);
  }
}

function updateStats() {
  for (let key in pet.stats) {
    pet.stats[key] = Math.max(0, pet.stats[key] - 0.02);
    if (pet.stats[key] === 0 && pet.lastStatHandled !== key) {
      pet.isRoaming = false;
      pet.targetStat = key;
      movePetTo(`${key}StatButton`);
      pet.lastStatHandled = key;
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

    const btn = document.getElementById(`btn${capitalize(key)}`);
    if (btn) {
      if (statCooldowns[key] > 0) {
        btn.disabled = true;
        btn.textContent = `${capitalize(key)} (${Math.ceil(statCooldowns[key])})`;
      } else {
        btn.disabled = false;
        btn.textContent = `${capitalize(key)}`;
      }
    }
  });

  const hpBar = document.getElementById("globalHealthBar");
  if (hpBar) hpBar.style.width = `${globalHealth}%`;

  const trainingBar = document.getElementById("globalTrainingBar");
  if (trainingBar) trainingBar.style.width = `${globalTraining}%`;

  const critical = document.getElementById("criticalWarning");
  if (critical) critical.style.display = globalHealth < 10 ? "block" : "none";
}

function showGameOverScreen() {
  const overlay = document.createElement('div');
  overlay.id = "gameOverOverlay";
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.color = "white";
  overlay.style.fontSize = "2rem";
  overlay.style.zIndex = 9999;

  const msg = document.createElement('div');
  msg.textContent = "💀 Game Over: Your pet has disappeared 💔";
  msg.style.marginBottom = "30px";

  const resetBtn = document.createElement('button');
  resetBtn.textContent = "Restart Game";
  resetBtn.style.padding = "10px 20px";
  resetBtn.style.fontSize = "1.5rem";
  resetBtn.style.cursor = "pointer";
  resetBtn.style.border = "none";
  resetBtn.style.borderRadius = "10px";
  resetBtn.style.backgroundColor = "#f44336";
  resetBtn.style.color = "#fff";
  resetBtn.addEventListener("click", () => {
    window.location.reload();
  });

  overlay.appendChild(msg);
  overlay.appendChild(resetBtn);
  document.body.appendChild(overlay);
}

function checkGameConditions() {
  const values = Object.values(pet.stats);
  const allZero = values.every((v) => v <= 1);

  if (allZero) {
    if (!document.getElementById("gameOverOverlay")) {
      showGameOverScreen();
    }
    return;
  }

  if (globalHealth >= 100 && !trainingUnlocked) {
    trainingUnlocked = true;
    console.log("Training Unlocked!");
  }

  if (trainingUnlocked && globalHealth >= 100) {
    globalTraining = Math.min(100, globalTraining + 0.25);
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
  if (pet.isPaused) return;

  if (pet.isRoaming) {
    pet.x += pet.vx * pet.speedMultiplier;
    pet.y += pet.vy * pet.speedMultiplier;

    if (pet.x <= 0 || pet.x + pet.width >= canvas.width) pet.vx *= -1;
    if (pet.y <= 0 || pet.y + pet.height >= canvas.height) pet.vy *= -1;
  } else if (pet.targetStat) {
    const btn = document.getElementById(`${pet.targetStat}StatButton`);
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const targetX = rect.left - canvasRect.left + rect.width / 2 - pet.width / 2;
      const targetY = rect.top - canvasRect.top + rect.height / 2 - pet.height / 2;
      moveTowardTarget(targetX, targetY);
    }
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

function movePet() {
  if (!pet.isRoaming || pet.isPaused) return;

  // Pause if we're in a waiting state
  if (pet.roamPauseDuration > 0) {
    pet.roamPauseTimer -= 1;
    if (pet.roamPauseTimer <= 0) {
      pet.roamPauseDuration = 0;
      chooseNewRoamTarget();
    }
    return;
  }

  if (!pet.roamTarget) {
    chooseNewRoamTarget();
    return;
  }

  const dx = pet.roamTarget.x - pet.x;
  const dy = pet.roamTarget.y - pet.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 5) {
    pet.roamPauseDuration = Math.floor(Math.random() * 120) + 60; // 1-3 seconds at 60fps
    pet.roamPauseTimer = pet.roamPauseDuration;
    pet.roamTarget = null;
    return;
  }

  const angle = Math.atan2(dy, dx);
  const speed = 1.5 * pet.speedMultiplier;
  pet.x += Math.cos(angle) * speed;
  pet.y += Math.sin(angle) * speed;

  // Clamp inside canvas
  pet.x = Math.max(0, Math.min(canvas.width - pet.width, pet.x));
  pet.y = Math.max(0, Math.min(canvas.height - pet.height, pet.y));
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function handleStatInteraction(stat) {
  if (statCooldowns[stat] > 0) {
    const btn = document.getElementById(`btn${capitalize(stat)}`);
    if (btn) {
      btn.textContent = `Wait...`;
      setTimeout(() => btn.textContent = capitalize(stat), 1000);
    }
    return;
  }

  pet.stats[stat] = Math.min(100, pet.stats[stat] + 25);
  statCooldowns[stat] = 100;
  lastStatInteraction = Date.now();

  // Resume roaming if all stats are above 0 again
  if (Object.values(pet.stats).every(value => value > 0)) {
    pet.isRoaming = true;
    pet.targetStat = null;
    pet.lastStatHandled = null;
  }

  const btn = document.getElementById(`btn${capitalize(stat)}`);
  if (btn) {
    btn.textContent = `+25!`;
    setTimeout(() => {
      btn.textContent = capitalize(stat);
    }, 10000);
  }
}

  if (Object.values(pet.stats).every(value => value > 0)) {
    pet.isRoaming = true;
    pet.targetStat = null;
    pet.lastStatHandled = null;
  }

  const btn = document.getElementById(`btn${capitalize(stat)}`);
  if (btn) {
    btn.textContent = `+25!`;
    setTimeout(() => {
      btn.textContent = capitalize(stat);
    }, 10000);
  }
}

function updateCooldowns() {
  const now = Date.now();
  const delta = (now - lastStatInteraction) / 1000;
  lastStatInteraction = now;

  for (let stat in statCooldowns) {
    if (statCooldowns[stat] > 0) {
      statCooldowns[stat] = Math.max(0, statCooldowns[stat] - delta);
    }
  }

  for (let key in pet.stats) {
    if (pet.stats[key] === 0) {
      globalHealth = Math.max(0, globalHealth - 5);
    }
  }

  const statsValues = Object.values(pet.stats);
  const allHigh = statsValues.every(value => value >= 80);

  if (allHigh) {
    globalHealth = Math.min(100, globalHealth + 0.15);
  }
}

function petCollisionWithStatObject(stat) {
  const emojis = {
    eat: "(^* _ *^)",
    sleep: "(^~ _ ~^)",
    wash: "(^x _ x^)",
    play: "(^O _ O^)"
  };

  if (pet.stats[stat] > 0 && !pet.isPaused) {
    pet.stats[stat] = Math.max(0, pet.stats[stat] - 15);
    pet.isRoaming = false;
    pet.isPaused = true;
    pet.collisionMsg = emojis[stat];
    setTimeout(() => {
      pet.isPaused = false;
      pet.isRoaming = true;
      pet.collisionMsg = null;
      pet.vx *= -1;
      pet.vy *= -1;
    }, 500);
  }
}

function attachButtonHandlers(btnId, stat) {
  const button = document.getElementById(btnId);
  if (!button) return;

  const trigger = () => handleStatInteraction(stat);

  button.addEventListener("click", trigger);
  button.addEventListener("touchstart", (e) => {
    e.preventDefault();
    trigger();
  }, { passive: false });
}

// Attach handlers
["eat", "sleep", "wash", "play"].forEach(stat => {
  attachButtonHandlers(`btn${capitalize(stat)}`, stat);
});

// Main game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  movePet();
  updateStats();
  updateCooldowns();
  drawPet();
  drawHUD();
  checkGameConditions();
  requestAnimationFrame(gameLoop);
}
gameLoop();
