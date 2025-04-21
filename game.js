// New pet behavior state
let petState = "roaming"; // "roaming", "seeking", "interacting"
let targetStat = null;
const cooldowns = {
  eat: 0,
  sleep: 0,
  wash: 0,
  play: 0
};
// Define pet object
let pet = {
  x: 100, // starting x position
  y: 100, // starting y position
  width: 50, // for positioning on button centers
  height: 50,
  stats: {
    eat: 100,
    sleep: 100,
    wash: 100,
    play: 100
  }
};
// Helper to get button center
function getButtonCenter(buttonId) {
  const btn = document.getElementById(buttonId);
  const rect = btn.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  return {
    x: rect.left - canvasRect.left + rect.width / 2 - pet.width / 2,
    y: rect.top - canvasRect.top + rect.height / 2 - pet.height / 2,
  };
}

// Pet movement handler
function movePetBehavior() {
  const keys = Object.keys(pet.stats);
  const statToFix = keys.find(stat => pet.stats[stat] === 0);

  if (statToFix && petState !== "interacting") {
    petState = "seeking";
    targetStat = statToFix;
  } else if (!statToFix && petState !== "interacting") {
    petState = "roaming";
    targetStat = null;
  }

  if (petState === "seeking" && targetStat) {
    const { x, y } = getButtonCenter(`btn${capitalize(targetStat)}`);
    let dx = x - pet.x;
    let dy = y - pet.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 2) {
      pet.x += (dx / dist) * 1.2;
      pet.y += (dy / dist) * 1.2;
    } else {
      petState = "interacting";
    }
  } else if (petState === "roaming") {
    movePet(); // default bouncing motion
  }
}

// Utility for capitalization
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Cooldown logic
function handleCooldowns(deltaTime) {
  for (let stat in cooldowns) {
    if (cooldowns[stat] > 0) {
      cooldowns[stat] -= deltaTime;
    }
  }
}

// Interact function
function interactWithStat(stat) {
  if (cooldowns[stat] <= 0) {
    pet.stats[stat] = Math.min(100, pet.stats[stat] + 25);
    cooldowns[stat] = 10000; // 10 sec
    if (pet.stats[stat] === 100) {
      globalHealth = Math.min(100, globalHealth + 5);
      cooldowns[stat] = 0;
    }
    petState = "roaming";
    targetStat = null;
  }
}

// Global health dynamics
function handleGlobalHealth(deltaTime) {
  const zeroStats = Object.values(pet.stats).filter(v => v === 0).length;
  const highStats = Object.values(pet.stats).every(v => v >= 75);

  if (zeroStats > 0) {
    globalHealth = Math.max(0, globalHealth - (5 * zeroStats) * (deltaTime / 1000));
  } else if (highStats) {
    globalHealth = Math.min(100, globalHealth + 10 * (deltaTime / 1000));
  }
}

// Handle pet interaction state behavior
function handleInteractionBehavior() {
  if (petState === "interacting" && targetStat) {
    const { x, y } = getButtonCenter(`btn${capitalize(targetStat)}`);
    const dx = x - pet.x;
    const dy = y - pet.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= 2) {
      interactWithStat(targetStat);
    }
  }
}

// Modified game loop
let lastTime = performance.now();
function gameLoop(currentTime) {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  movePetBehavior();
  handleInteractionBehavior();
  drawPet();
  updateStats();
  drawHUD();
  checkGameConditions();
  handleCooldowns(deltaTime);
  handleGlobalHealth(deltaTime);

  requestAnimationFrame(gameLoop);
}

document.getElementById("btnEat").addEventListener("click", () => interactWithStat("eat"));
document.getElementById("btnSleep").addEventListener("click", () => interactWithStat("sleep"));
document.getElementById("btnWash").addEventListener("click", () => interactWithStat("wash"));
document.getElementById("btnPlay").addEventListener("click", () => interactWithStat("play"));
