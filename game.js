import { mintPrize } from './walletconnect.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let pet = {
  x: 100,
  y: 100,
  width: 50,
  height: 50,
  color: "green",
  speed: 2,
  status: {
    eat: 100,
    sleep: 100,
    wash: 100,
    play: 100
  }
};

let target = null;
let touchTarget = null;
let tapTarget = null;
let statusDecayRate = 0.05;
let frameCounter = 0;
let gameOver = false;
let victory = false;

const statusElements = ['eat', 'sleep', 'wash', 'play'];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function moveTowards(dest) {
  const dx = dest.x - pet.x;
  const dy = dest.y - pet.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > 1) {
    pet.x += (dx / distance) * pet.speed;
    pet.y += (dy / distance) * pet.speed;
  }
}

function randomRoam() {
  if (!target || Math.random() < 0.01) {
    target = {
      x: Math.random() * (canvas.width - 100),
      y: Math.random() * (canvas.height - 100)
    };
  }
  moveTowards(target);
}

function drawPet() {
  ctx.fillStyle = pet.color;
  ctx.fillRect(pet.x, pet.y, pet.width, pet.height);
}

function drawStatusBars() {
  let y = 10;
  ctx.font = "16px sans-serif";
  statusElements.forEach(stat => {
    const val = pet.status[stat];
    ctx.fillStyle = val <= 25 ? (frameCounter % 30 < 15 ? "red" : "darkred") :
                     val >= 100 ? (frameCounter % 30 < 15 ? "lime" : "green") :
                     val >= 50 ? "green" : "orange";
    ctx.fillRect(10, y, val * 2, 20);

    ctx.strokeStyle = "#fff";
    ctx.strokeRect(10, y, 200, 20);

    ctx.fillStyle = "#fff";
    ctx.fillText(`${stat.toUpperCase()}: ${Math.floor(val)}`, 220, y + 15);
    y += 30;
  });
}

function drawGlobalHealthBar() {
  const hp = getGlobalHP();
  ctx.fillStyle = hp <= 10 ? (frameCounter % 30 < 15 ? "red" : "darkred") :
                   hp >= 95 ? (frameCounter % 30 < 15 ? "lime" : "green") :
                   hp >= 50 ? "green" : "orange";
  ctx.fillRect(10, canvas.height - 40, hp * 2, 20);
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(10, canvas.height - 40, 200, 20);
  ctx.fillStyle = "#fff";
  ctx.fillText(`GLOBAL HP: ${Math.floor(hp)}`, 220, canvas.height - 25);
  if (hp <= 10) {
    ctx.fillText("Condition Critical", pet.x + 60, pet.y);
  }
}

function getGlobalHP() {
  let sum = 0;
  statusElements.forEach(stat => sum += pet.status[stat]);
  return sum / 4;
}

function updateStatusDecay() {
  statusElements.forEach(stat => {
    pet.status[stat] = Math.max(0, pet.status[stat] - statusDecayRate);
  });
}

function checkVictoryCondition() {
  const hp = getGlobalHP();
  if (hp >= 95 && !victory) {
    pet.speed *= 2;
    victory = true;
    console.log("Victory achieved! Minting NFT...");
    mintPrize();
  }
}

function checkGameOver() {
  if (statusElements.every(stat => pet.status[stat] <= 1)) {
    gameOver = true;
    ctx.fillStyle = "white";
    ctx.font = "32px sans-serif";
    ctx.fillText("Game Over: Pet has Disappeared", canvas.width / 2 - 200, canvas.height / 2);
  }
}

function checkCollision(buttonId, statName, amount = 20) {
  const btn = document.getElementById(buttonId);
  const rect = btn.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const btnX = rect.left - canvasRect.left;
  const btnY = rect.top - canvasRect.top;

  if (
    pet.x < btnX + rect.width &&
    pet.x + pet.width > btnX &&
    pet.y < btnY + rect.height &&
    pet.y + pet.height > btnY
  ) {
    pet.status[statName] = Math.min(100, pet.status[statName] + amount);
  }
}

function triggerMiniGame(x, y) {
  if (x < canvas.width / 2 && y < canvas.height / 2) {
    pet.status.play = Math.min(100, pet.status.play + 10);
  } else if (x > canvas.width / 2 && y < canvas.height / 2) {
    pet.status.eat = Math.min(100, pet.status.eat + 10);
  } else if (x < canvas.width / 2 && y > canvas.height / 2) {
    pet.status.sleep = Math.min(100, pet.status.sleep + 10);
  } else {
    pet.status.wash = Math.min(100, pet.status.wash + 10);
  }
}

function gameLoop() {
  if (gameOver) return;

  frameCounter++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (touchTarget) {
    moveTowards(touchTarget);
  } else if (tapTarget) {
    moveTowards(tapTarget);
    if (Math.abs(pet.x - tapTarget.x) < 5 && Math.abs(pet.y - tapTarget.y) < 5) {
      triggerMiniGame(tapTarget.x, tapTarget.y);
      tapTarget = null;
    }
  } else {
    randomRoam();
  }

  drawPet();
  drawStatusBars();
  drawGlobalHealthBar();
  updateStatusDecay();

  checkCollision("btnEat", "eat");
  checkCollision("btnSleep", "sleep");
  checkCollision("btnWash", "wash");
  checkCollision("btnPlay", "play");

  checkVictoryCondition();
  checkGameOver();

  requestAnimationFrame(gameLoop);
}

// Touch & Click Listeners
canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  touchTarget = {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  };
});
canvas.addEventListener("touchend", () => touchTarget = null);

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  tapTarget = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
});

gameLoop();
