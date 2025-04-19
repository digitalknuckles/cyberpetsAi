const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const pet = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 40,
  hunger: 100,
  happiness: 100,
  cleanliness: 100,
  energy: 100,
  state: "roaming", // 'roaming' | 'movingToTouch' | 'movingToAction'
  targetX: null,
  targetY: null,
  _roamTimer: 0,
};

let isTouching = false;
let gameOver = false;

// Draw the pet
function drawPet() {
  ctx.beginPath();
  ctx.arc(pet.x, pet.y, pet.size, 0, Math.PI * 2);
  ctx.fillStyle = "#0f0";
  ctx.fill();
  ctx.closePath();
}

// Move pet toward target
function movePetTowardTarget() {
  const speed = 2;
  if (pet.targetX === null || pet.targetY === null) return;

  const dx = pet.targetX - pet.x;
  const dy = pet.targetY - pet.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 1) {
    if (pet.state === "movingToAction") {
      performActionAtTarget();
    }
    pet.state = isTouching ? "movingToTouch" : "roaming";
    return;
  }

  pet.x += (dx / dist) * speed;
  pet.y += (dy / dist) * speed;
}

// Roaming behavior
function roam() {
  if (!pet._roamTimer || Date.now() - pet._roamTimer > 3000) {
    pet.targetX = Math.random() * canvas.width;
    pet.targetY = Math.random() * canvas.height;
    pet._roamTimer = Date.now();
  }
  movePetTowardTarget();
}

// Main update
function updatePetBehavior() {
  if (pet.state === "movingToTouch" || pet.state === "movingToAction") {
    movePetTowardTarget();
  } else if (pet.state === "roaming") {
    roam();
  }
}

// Draw loop
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameOver) {
    updatePetBehavior();
    drawPet();
  }

  requestAnimationFrame(update);
}
update();

// Touch controls
canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  pet.targetX = x;
  pet.targetY = y;
  pet.state = "movingToTouch";
  isTouching = true;
});

canvas.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  pet.targetX = x;
  pet.targetY = y;
});

canvas.addEventListener("touchend", () => {
  isTouching = false;
  pet.state = "roaming";
});

// Action buttons
function moveToActionObject(action) {
  if (isTouching) return; // skip if player is touching

  pet.state = "movingToAction";
  pet._roamTimer = 0;

  switch (action) {
    case "eat":
      pet.targetX = canvas.width * 0.2;
      pet.targetY = canvas.height * 0.8;
      break;
    case "sleep":
      pet.targetX = canvas.width * 0.8;
      pet.targetY = canvas.height * 0.2;
      break;
    case "wash":
      pet.targetX = canvas.width * 0.5;
      pet.targetY = canvas.height * 0.9;
      break;
    case "play":
      pet.targetX = canvas.width * 0.5;
      pet.targetY = canvas.height * 0.1;
      break;
  }
}

// Action result (placeholder)
function performActionAtTarget() {
  if (pet.state !== "movingToAction") return;
  console.log("Pet reached action target.");

  // Simulate stat increases
  pet.hunger = Math.min(pet.hunger + 10, 100);
  pet.energy = Math.min(pet.energy + 10, 100);
  pet.cleanliness = Math.min(pet.cleanliness + 10, 100);
  pet.happiness = Math.min(pet.happiness + 10, 100);

  pet.targetX = null;
  pet.targetY = null;
  pet.state = "roaming";
}

// Button listeners
document.getElementById("btnEat").addEventListener("click", () => moveToActionObject("eat"));
document.getElementById("btnSleep").addEventListener("click", () => moveToActionObject("sleep"));
document.getElementById("btnWash").addEventListener("click", () => moveToActionObject("wash"));
document.getElementById("btnPlay").addEventListener("click", () => moveToActionObject("play"));
document.getElementById("btnConnect").addEventListener("click", () => {
  console.log("Connect wallet feature coming soon...");
});