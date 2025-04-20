// game.js
import { mintPrize } from './walletconnect.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let pet = {
  x: 100,
  y: 100,
  vx: 2,
  vy: 2,
  width: 100,
  height: 100,
  speedMultiplier: 1,
  sprite: null,
  animationFrames: [],
  currentFrame: 0,
  stats: {
    eat: 100,
    sleep: 100,
    wash: 100,
    play: 100
  }
};

let target = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function loadSprites() {
  pet.sprite = new Image();
  pet.sprite.src = "assets/pet-idle.png";

  for (let i = 1; i <= 3; i++) {
    let frame = new Image();
    frame.src = `assets/pet-animation-${i}.png`;
    pet.animationFrames.push(frame);
  }
}

function drawPet() {
  const img = pet.animationFrames[pet.currentFrame] || pet.sprite;
  if (img && img.complete) {
    ctx.drawImage(img, pet.x, pet.y, pet.width, pet.height);
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
  });

  const totalHP = Object.values(pet.stats).reduce((a, b) => a + b, 0) / 4;
  const hpBar = document.getElementById("globalHealthBar");
  hpBar.style.width = `${totalHP}%`;

  if (totalHP < 10) {
    document.getElementById("criticalWarning").style.display = "block";
  } else {
    document.getElementById("criticalWarning").style.display = "none";
  }
}

function showVictoryScreen() {
  const overlay = document.createElement("div");
  overlay.id = "victoryScreen";
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = 999;

  const message = document.createElement("h1");
  message.innerText = "🎉 Victory! Your pet is thriving! 🎉";
  message.style.color = "#fff";
  message.style.marginBottom = "20px";

  const mintButton = document.createElement("button");
  mintButton.innerText = "Mint Your NFT Prize";
  mintButton.style.padding = "12px 20px";
  mintButton.style.fontSize = "18px";
  mintButton.style.cursor = "pointer";
  mintButton.onclick = async () => {
    mintButton.disabled = true;
    mintButton.innerText = "Minting...";
    await mintPrize();
    mintButton.innerText = "Minted!";
  };

  overlay.appendChild(message);
  overlay.appendChild(mintButton);
  document.body.appendChild(overlay);
}

function checkGameConditions() {
  const values = Object.values(pet.stats);
  const allZero = values.every((v) => v <= 1);
  const totalHP = values.reduce((a, b) => a + b, 0) / 4;

  if (allZero && !window.gameEnded) {
    window.gameEnded = true;
    setTimeout(() => {
      alert("Game Over: Pet has Disappeared");
      window.location.reload();
    }, 1000);
  }

  if (totalHP >= 95 && !window.victoryAchieved) {
    window.victoryAchieved = true;
    pet.speedMultiplier = 2;
    showVictoryScreen();
  }
}

function movePet() {
  if (target) {
    const dx = target.x - pet.x;
    const dy = target.y - pet.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      target = null;
    } else {
      pet.x += (dx / dist) * pet.vx * pet.speedMultiplier;
      pet.y += (dy / dist) * pet.vy * pet.speedMultiplier;
    }
  } else {
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

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  pet.currentFrame = (pet.currentFrame + 1) % pet.animationFrames.length;
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
  target = {
    x: rect.left - canvasRect.left,
    y: rect.top - canvasRect.top
  };
}

["btnEat", "btnSleep", "btnWash", "btnPlay"].forEach((id) => {
  const btn = document.getElementById(id);
  btn.addEventListener("click", () => movePetTo(id));
  btn.addEventListener("touchstart", () => movePetTo(id));
});

document.addEventListener("keydown", (e) => {
  if (e.key === "e") movePetTo("btnEat");
  if (e.key === "s") movePetTo("btnSleep");
  if (e.key === "w") movePetTo("btnWash");
  if (e.key === "p") movePetTo("btnPlay");
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
loadSprites();
gameLoop();
