const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let pet = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 40,
  color: 'lime',
  speed: 2,
  target: null,
  state: 'roaming', // roaming, movingToTouch, movingToAction
  roamTimer: 0
};

let touchPos = null;
let stats = {
  hunger: 50,
  energy: 50,
  cleanliness: 50,
  happiness: 50,
};

// Action target positions
const actionTargets = {
  Eat: { x: 100, y: 100 },
  Sleep: { x: 700, y: 100 },
  Wash: { x: 100, y: 500 },
  Play: { x: 700, y: 500 }
};

// UI Event Listeners
document.getElementById('btnEat').addEventListener('click', () => triggerAction('Eat'));
document.getElementById('btnSleep').addEventListener('click', () => triggerAction('Sleep'));
document.getElementById('btnWash').addEventListener('click', () => triggerAction('Wash'));
document.getElementById('btnPlay').addEventListener('click', () => triggerAction('Play'));
document.getElementById('btnConnect').addEventListener('click', () => alert('Wallet connect coming soon!'));

// Touch Input
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  touchPos = {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  };
  pet.state = 'movingToTouch';
});

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  touchPos = {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  };
});

canvas.addEventListener('touchend', () => {
  touchPos = null;
  pet.state = 'roaming';
});

function triggerAction(action) {
  if (pet.state === 'movingToTouch') return; // skip if player is touching
  pet.target = actionTargets[action];
  pet.state = 'movingToAction';
  pet.currentAction = action;
}

// Roaming logic
function updateRoaming() {
  pet.roamTimer--;
  if (pet.roamTimer <= 0) {
    pet.target = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height
    };
    pet.roamTimer = 200 + Math.random() * 200;
  }
  movePetToward(pet.target);
}

// Movement helper
function movePetToward(target) {
  const dx = target.x - pet.x;
  const dy = target.y - pet.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > 1) {
    pet.x += (dx / dist) * pet.speed;
    pet.y += (dy / dist) * pet.speed;
  } else {
    if (pet.state === 'movingToAction') {
      applyStatBoost(pet.currentAction);
    }
    pet.state = 'roaming';
    pet.roamTimer = 0;
    pet.target = null;
  }
}

function applyStatBoost(action) {
  switch (action) {
    case 'Eat': stats.hunger = Math.min(100, stats.hunger + 10); break;
    case 'Sleep': stats.energy = Math.min(100, stats.energy + 10); break;
    case 'Wash': stats.cleanliness = Math.min(100, stats.cleanliness + 10); break;
    case 'Play': stats.happiness = Math.min(100, stats.happiness + 10); break;
  }
}

// Game loop
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (pet.state === 'movingToTouch' && touchPos) {
    movePetToward(touchPos);
  } else if (pet.state === 'movingToAction') {
    movePetToward(pet.target);
  } else {
    updateRoaming();
  }

  // Draw pet
  ctx.fillStyle = pet.color;
  ctx.beginPath();
  ctx.arc(pet.x, pet.y, pet.size, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(update);
}

update();