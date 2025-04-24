import { mintPrize } from './walletconnect.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const petSprites = [
  "./RobotTeddyAi.png",
  "./RobotTeddyAi0.png",
  "./RobotTeddyAi1.png"
  //"./RobotTeddyAi2.png",
 // "./RobotTeddyAi2.png", // You can keep duplicates for weighting
  //"./RobotTeddyAi3.png",
 // "./RobotTeddyAi4.png",
  //"./RobotTeddyAi5.png"
];

let pet = {
  x: 0,
  y: 50,
  vx: 1.5,
  vy: 1.5,
  width: 300,
  height: 300,
  speedMultiplier: 1,
  image: new Image(),
  stats: {
    train: 100,
    sleep: 100,
    wash: 100,
    play: 100
  },
  timers: {
    train: 10,
    sleep: 10,
    wash: 10,
    play: 10
  },
  zeroTimers: {
    train: null,
    sleep: null,
    wash: null,
    play: null
  },
  isRoaming: true,
  targetStat: null,
  isPaused: false,
  pauseDuration: 0,
  collisionMsg: null,
  lastStatHandled: null,
  roamSteps: 0,
  roamPauseCooldown: getRandomInt(7, 15)
};

let isRoamingPaused = false;
let roamingPauseTimer = 0;
let roamingPauseDuration = 0;
let globalHealth = 0;
let globalTraining = 0;
let trainingUnlocked = false;

let statCooldowns = {
  train: 0,
  sleep: 0,
  wash: 0,
  play: 0
};

let lastStatInteraction = Date.now();

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const backgroundImage = new Image();
backgroundImage.src = './background.png';

function getRandomPetSprite() {
  const index = Math.floor(Math.random() * petSprites.length);
  return petSprites[index];
}
// Call once at game start
const selectedPetSprite = getRandomPetSprite();
pet.image.src = selectedPetSprite;
//pet.sprite.src = "./RobotTeddyAi.png";
pet.image.onload = () => console.log('Pet sprite loaded successfully');
pet.image.onerror = () => console.error('Failed to load pet sprite image');

function drawBackground() {
  // background image:
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  // Or just a plain background color:
    //ctx.fillStyle = "#000"; // black background
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawScene() {
  if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  }
  drawPet();
}

let showStartMenu = true;
const startMenuImage = new Image();
startMenuImage.src = "./startMenu.png";

let gameStarted = false;
let allowInput = false;

let allowKeyPress = false;
setTimeout(() => {
  allowKeyPress = true;
}, 500);

function drawStartMenu() {
  if (startMenuImage.complete && startMenuImage.naturalWidth > 0) {
    ctx.drawImage(startMenuImage, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// Keyboard support
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && showStartMenu && allowInput) {
    showStartMenu = false;
  }
});

// Touch support
document.addEventListener("touchstart", (e) => {
  if (showStartMenu && allowInput) {
    showStartMenu = false;
  }
});

// Mouse click support
document.addEventListener("click", (e) => {
  if (showStartMenu && allowInput) {
    showStartMenu = false;
  }
});

function resizeCanvas() {
  const parent = canvas.parentElement;

  if (parent) {
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  } else {
    // Fallback in case canvas has no parent (not recommended)
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function drawPet() {
  if (pet.image.complete && pet.image.naturalWidth > 0) {
    ctx.drawImage(pet.image, pet.x, pet.y, pet.width, pet.height);
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

for (let key in pet.stats) {
  if (pet.stats[key] <= 0) {
    if (pet.zeroTimers[key] === null) {
      pet.zeroTimers[key] = Date.now(); // Start timer
    } else {
      const elapsed = (Date.now() - pet.zeroTimers[key]) / 1000;
      if (elapsed >= pet.timers[key]) {
        showGameOverScreen(); // Trigger Game Over if too much time passed
      }
    }
  } else {
    pet.zeroTimers[key] = null; // Reset if stat is restored
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
  msg.textContent = "💀 Game Over: Your pet has Vanished 💔";
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
      alert("🎉 Your CyberPetAi Has Been Trained! 🐾\nMint your prize!");
      mintPrize();
    }, 300);
  }
}

function handleRoamingPause() {
  if (isRoamingPaused) {
    roamingPauseTimer++;

    if (roamingPauseTimer >= roamingPauseDuration) {
      isRoamingPaused = false;
      roamingPauseTimer = 0;
      roamSteps = 0;
      roamPauseCooldown = getRandomInt(7, 15); // Reset cooldown threshold
    }
  }
}

function movePet() {
  if (pet.isRoaming && !pet.isPaused) {
    pet.x += pet.vx * pet.speedMultiplier;
    pet.y += pet.vy * pet.speedMultiplier;

    // Edge bounce
    if (pet.x <= 0 || pet.x + pet.width >= canvas.width) pet.vx *= -1;
    if (pet.y <= 0 || pet.y + pet.height >= canvas.height) pet.vy *= -1;

    // Count this as a roaming step
    pet.roamSteps++;
    if (pet.roamSteps >= pet.roamPauseCooldown) {
      pet.isPaused = true;
      pet.pauseDuration = getRandomInt(120, 300); // Pause 2-5 seconds
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

function movePetTo(buttonId) {
  const btn = document.getElementById(buttonId);
  const rect = btn.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const targetX = rect.left - canvasRect.left + rect.width / 2 - pet.width / 2;
  const targetY = rect.top - canvasRect.top + rect.height / 2 - pet.height / 2;

  pet.x = targetX;
  pet.y = targetY;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function handleStatInteraction(stat) {
  if (statCooldowns[stat] > 0) {
    const btn = document.getElementById(`btn${capitalize(stat)}`);
    if (btn) {
      btn.textContent = `Wait...`;
      setTimeout(() => btn.textContent = capitalize(stat), 500);
    }
    return;
  }

  pet.stats[stat] = Math.min(100, pet.stats[stat] + 50);
  statCooldowns[stat] = 10;
  lastStatInteraction = Date.now();

  if (Object.values(pet.stats).every(value => value > 0)) {
    pet.isRoaming = true;
    pet.targetStat = null;
    pet.lastStatHandled = null;
  }

  const btn = document.getElementById(`btn${capitalize(stat)}`);
  if (btn) {
    btn.textContent = `+50!`;
    setTimeout(() => {
      btn.textContent = capitalize(stat);
    }, 5000);
  }
}

function updateCooldowns() {
  const now = Date.now();
  const delta = (now - lastStatInteraction) / 500;
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
    globalHealth = Math.min(100, globalHealth + 0.05);
  }
}

function petCollisionWithStatObject(stat) {
  const emojis = {
    train: "(^* _ *^)",
    sleep: "(^~ _ ~^)",
    wash: "(^x _ x^)",
    play: "(^O _ O^)"
  };

  if (pet.stats[stat] > 0 && !pet.isPaused) {
    pet.stats[stat] = Math.max(0, pet.stats[stat] - 5);
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
["train", "sleep", "wash", "play"].forEach(stat => {
  attachButtonHandlers(`btn${capitalize(stat)}`, stat);
});

//Global health update
function updateGlobalHealth() {
  const statsValues = Object.values(pet.stats);
  const allHigh = statsValues.every(value => value >= 50);
  const anyLow = statsValues.some(value => value <= 50);

  if (allHigh) {
    globalHealth = Math.min(100, globalHealth + 0.10);
  } else if (anyLow) {
    globalHealth = Math.max(0, globalHealth - 0.15); // <- More punishing
  }
}


// Main game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (showStartMenu) {
    drawStartMenu();
  } else {
    drawScene(); // Your function to render gameplay
  }

  drawBackground(); 
  
  updatePetRoaming();
  movePet(); // Only call once
  updateStats();
  updateGlobalHealth(); 
  updateCooldowns();
  drawPet();
  drawHUD();
  checkGameConditions();

  requestAnimationFrame(gameLoop);
}

// Define this OUTSIDE the loop
function updatePetRoaming() {
  if (pet.isPaused) {
    pet.pauseDuration--;

    if (pet.pauseDuration <= 0) {
      pet.isPaused = false;
      pet.pauseDuration = 0;
      pet.roamSteps = 0;
      pet.roamPauseCooldown = getRandomInt(120, 300); // You can adjust this range

      // ✅ Set new random direction after pause
      const angle = Math.random() * Math.PI * 2;
      pet.vx = Math.cos(angle);
      pet.vy = Math.sin(angle);
    }
  } else {
    // Move the pet if not paused
    pet.x += pet.vx * pet.speedMultiplier;
    pet.y += pet.vy * pet.speedMultiplier;

    // Bounce off edges
    if (pet.x <= 0 || pet.x + pet.width >= canvas.width) pet.vx *= -1;
    if (pet.y <= 0 || pet.y + pet.height >= canvas.height) pet.vy *= -1;

    // Track roaming steps
    pet.roamSteps++;
    if (pet.roamSteps >= pet.roamPauseCooldown) {
      pet.isPaused = true;
      pet.pauseDuration = getRandomInt(120, 300); // Pause 2–5 seconds
    }
  }
}
startMenuImage.onload = () => {
  console.log("Start menu image loaded");
  allowInput = true;
  gameLoop();
};
