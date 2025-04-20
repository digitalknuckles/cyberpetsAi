// game.js
import { connectWallet, mintPrize } from './walletconnect.js';

let game;
let petStats = { eat: 100, sleep: 100, wash: 100, play: 100 };
let statCooldowns = { eat: 0, sleep: 0, wash: 0, play: 0 };
let globalHealth = 100;
let globalTraining = 0;
let trainingUnlocked = false;
let victoryAchieved = false;

window.onload = function () {
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };

  game = new Phaser.Game(config);
};

function preload() {
  this.load.image('background', 'https://gateway.pinata.cloud/ipfs/QmVc4cfE9...');
  this.load.image('claw', 'https://gateway.pinata.cloud/ipfs/QmbhSzvn...');
  this.load.image('victory', 'https://gateway.pinata.cloud/ipfs/QmfZkTD...');
  // Load pet stat buttons/icons here
}

function create() {
  this.add.image(400, 300, 'background');

  // Setup stat buttons with input
  this.input.keyboard.on('keydown-E', () => modifyStat('eat', 10));
  this.input.keyboard.on('keydown-S', () => modifyStat('sleep', 10));
  this.input.keyboard.on('keydown-W', () => modifyStat('wash', 10));
  this.input.keyboard.on('keydown-P', () => modifyStat('play', 10));

  this.victoryText = this.add.text(200, 250, '', { fontSize: '32px', fill: '#fff' });
  this.mintButton = this.add.text(250, 320, '', { fontSize: '28px', fill: '#0f0' })
    .setInteractive()
    .on('pointerdown', () => {
      connectWallet().then(mintPrize);
    });
  this.mintButton.setVisible(false);

  // Optional: add visual bars for stats/global bars later
}

function update(time, delta) {
  // Cooldown reduction
  Object.keys(statCooldowns).forEach(stat => {
    if (statCooldowns[stat] > 0) statCooldowns[stat] -= delta / 1000;
  });

  // Stat decay
  Object.keys(petStats).forEach(stat => {
    petStats[stat] -= 0.01;
    if (petStats[stat] <= 0) {
      if (!trainingUnlocked) {
        globalHealth -= 0.1;
      } else {
        globalTraining -= 0.1;
      }
    }
    petStats[stat] = Phaser.Math.Clamp(petStats[stat], 0, 100);
  });

  // Global health fill logic
  if (!trainingUnlocked) {
    if (globalHealth < 100) {
      globalHealth += 0.05 * statBoostAmount();
    } else {
      trainingUnlocked = true;
    }
  } else {
    if (globalTraining < 100) {
      globalTraining += 0.05 * statBoostAmount();
    }
  }

  globalHealth = Phaser.Math.Clamp(globalHealth, 0, 100);
  globalTraining = Phaser.Math.Clamp(globalTraining, 0, 100);

  // Victory condition
  if (globalHealth === 100 && globalTraining === 100 && !victoryAchieved) {
    this.victoryText.setText('Super Star Pet Vibes');
    this.mintButton.setText('Mint your prize');
    this.mintButton.setVisible(true);
    victoryAchieved = true;
  }
}

function modifyStat(stat, amount) {
  if (statCooldowns[stat] <= 0) {
    petStats[stat] += amount;
    petStats[stat] = Phaser.Math.Clamp(petStats[stat], 0, 100);
    statCooldowns[stat] = 3; // 3 second cooldown
  }
}

function statBoostAmount() {
  // Determines how much stat level contributes to global fill
  return (petStats.eat + petStats.sleep + petStats.wash + petStats.play) / 400;
}
