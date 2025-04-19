// game.js
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
let statusDecayRate = 0.05;
let frameCounter = 0;
let gameOver = false;
let victory = false;

const statusElements = ['eat', 'sleep', 'wash', 'play'];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function randomRoam() {
  if (!target || Math.random() < 0.01) {
    target = {
      x: Math.random() * (canvas.width - 100),
      y: Math.random() * (canvas.height - 100)
    };
  }

  let dx = target.x - pet.x;
  let dy = target.y - pet.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > 1) {
    pet.x += (dx / distance) * pet.speed;
    pet.y += (dy / distance) * pet.speed;
  }
}

function drawPet() {
  ctx.fillStyle = pet.color;
  ctx.fillRect(pet.x, pet.y, pet.width, pet.height);
}

function drawStatusBars() {
  let y = 10;
  statusElements.forEach(stat => {
    const val = pet.status[stat];
    ctx.fillStyle = val <= 25 ? (frameCounter % 30 < 15 ? "red" : "darkred") :
                     val >= 100 ? (frameCounter % 30 < 15 ? "lime" : "green") :
                     val >= 50 ? "green" : "red";
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
  if (hp <= 10) ctx.fillText("Condition Critical", pet.x + 60, pet.y);
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
    console.log("Victory achieved! Placeholder for mint logic");
    // mintPrize(); ← UNCOMMENT to enable NFT mint
  }
}

function checkGameOver() {
  if (statusElements.every(stat => pet.status[stat] <= 1)) {
    gameOver = true;
    ctx.fillStyle = "white";
    ctx.font = "32px sans-serif";
    ctx.fillText("Game Over: Pet has Disappeared", canvas.width / 2 - 150, canvas.height / 2);
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

function gameLoop() {
  if (gameOver) return;
  frameCounter++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  randomRoam();
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

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
gameLoop();
