// game.js
import { mintPrize } from './walletconnect.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let pet = {
  x: 100,
  y: 100,
  sprite: null,
  animationFrames: [],
  currentFrame: 0,
  health: 100,
  happiness: 100
};

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
  const img = pet.sprite;
  if (img && img.complete) {
    ctx.drawImage(img, pet.x, pet.y, 150, 150);
  }
}

function updateHUD() {
  document.getElementById("healthDisplay").textContent = pet.health;
  document.getElementById("happinessDisplay").textContent = pet.happiness;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPet();
  updateHUD();

  // NFT mint trigger
  if (pet.happiness === 100 && !window.nftMinted) {
    mintPrize();
    window.nftMinted = true;
  }

  requestAnimationFrame(gameLoop);
}

function handleEat() {
  pet.health = Math.min(100, pet.health + 10);
}
function handleSleep() {
  pet.health = Math.min(100, pet.health + 5);
}
function handleWash() {
  pet.health = Math.min(100, pet.health + 3);
}
function handlePlay() {
  pet.happiness = Math.min(100, pet.happiness + 10);
}

document.getElementById("btnEat").addEventListener("click", handleEat);
document.getElementById("btnSleep").addEventListener("click", handleSleep);
document.getElementById("btnWash").addEventListener("click", handleWash);
document.getElementById("btnPlay").addEventListener("click", handlePlay);

// Touch controls
canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  pet.x = touch.clientX - 75;
  pet.y = touch.clientY - 75;
});

// Keyboard movement
window.addEventListener("keydown", (e) => {
  const step = 10;
  switch (e.key) {
    case "ArrowUp": pet.y -= step; break;
    case "ArrowDown": pet.y += step; break;
    case "ArrowLeft": pet.x -= step; break;
    case "ArrowRight": pet.x += step; break;
  }
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
loadSprites();
gameLoop();
