const container = document.getElementById("game-container");
const chipsCountText = document.getElementById("chips-count");

if (!container) {
  console.error("No existe #game-container en el HTML.");
}

if (!chipsCountText) {
  console.error("No existe #chips-count en el HTML.");
}

/* ---------------------------------------
   CONTADOR DE FICHAS
--------------------------------------- */

let playerChips = Number(localStorage.getItem("playerChips")) || 0;
let chipMultiplier = 1;
let chipMultiplierTimeout = null;

function updateChipCounter() {
  if (!chipsCountText) return;

  chipsCountText.textContent = playerChips;
  localStorage.setItem("playerChips", playerChips);
}

function addPlayerChips(amount) {
  playerChips = Math.max(0, playerChips + amount);
  updateChipCounter();
}

window.casino = {
  getChips() {
    return playerChips;
  },

  addChips(amount) {
    addPlayerChips(amount);
  },

  spendChips(amount) {
    if (playerChips < amount) {
      return false;
    }

    addPlayerChips(-amount);
    return true;
  }
};

function activateChipMultiplier(multiplier, duration) {
  chipMultiplier = multiplier;

  if (chipMultiplierTimeout) {
    clearTimeout(chipMultiplierTimeout);
  }

  chipMultiplierTimeout = setTimeout(() => {
    chipMultiplier = 1;
  }, duration);
}

updateChipCounter();

/* ---------------------------------------
   CONFIGURACION GENERAL
--------------------------------------- */

const maxCards = 255;
const maxChips = 255;

let paused = false;

document.addEventListener("visibilitychange", () => {
  paused = document.hidden;
});

/* ---------------------------------------
   CARTAS
--------------------------------------- */

const cards = [
  "imagenes/Jocker_Cards/JockerCard.png",
  "imagenes/Diamond_Cards/DiamondCard-A.png",
  "imagenes/Diamond_Cards/DiamondCard-2.png",
  "imagenes/Diamond_Cards/DiamondCard-3.png",
  "imagenes/Diamond_Cards/DiamondCard-4.png",
  "imagenes/Diamond_Cards/DiamondCard-5.png",
  "imagenes/Diamond_Cards/DiamondCard-6.png",
  "imagenes/Diamond_Cards/DiamondCard-7.png",
  "imagenes/Diamond_Cards/DiamondCard-8.png",
  "imagenes/Diamond_Cards/DiamondCard-9.png",
  "imagenes/Diamond_Cards/DiamondCard-10.png",
  "imagenes/Diamond_Cards/DiamondCard-J.png",
  "imagenes/Diamond_Cards/DiamondCard-Q.png",
  "imagenes/Diamond_Cards/DiamondCard-K.png",
  "imagenes/Spade_Cards/SpadeCard-A.png",
  "imagenes/Spade_Cards/SpadeCard-2.png",
  "imagenes/Spade_Cards/SpadeCard-3.png",
  "imagenes/Spade_Cards/SpadeCard-4.png",
  "imagenes/Spade_Cards/SpadeCard-5.png",
  "imagenes/Spade_Cards/SpadeCard-6.png",
  "imagenes/Spade_Cards/SpadeCard-7.png",
  "imagenes/Spade_Cards/SpadeCard-8.png",
  "imagenes/Spade_Cards/SpadeCard-9.png",
  "imagenes/Spade_Cards/SpadeCard-10.png",
  "imagenes/Spade_Cards/SpadeCard-J.png",
  "imagenes/Spade_Cards/SpadeCard-Q.png",
  "imagenes/Spade_Cards/SpadeCard-K.png",
  "imagenes/Club_Cards/ClubCard-A.png",
  "imagenes/Club_Cards/ClubCard-2.png",
  "imagenes/Club_Cards/ClubCard-3.png",
  "imagenes/Club_Cards/ClubCard-4.png",
  "imagenes/Club_Cards/ClubCard-5.png",
  "imagenes/Club_Cards/ClubCard-6.png",
  "imagenes/Club_Cards/ClubCard-7.png",
  "imagenes/Club_Cards/ClubCard-8.png",
  "imagenes/Club_Cards/ClubCard-9.png",
  "imagenes/Club_Cards/ClubCard-10.png",
  "imagenes/Club_Cards/ClubCard-J.png",
  "imagenes/Club_Cards/ClubCard-Q.png",
  "imagenes/Club_Cards/ClubCard-K.png",
  "imagenes/Heart_Cards/HeartsCard-A.png",
  "imagenes/Heart_Cards/HeartsCard-2.png",
  "imagenes/Heart_Cards/HeartsCard-3.png",
  "imagenes/Heart_Cards/HeartsCard-4.png",
  "imagenes/Heart_Cards/HeartsCard-5.png",
  "imagenes/Heart_Cards/HeartsCard-6.png",
  "imagenes/Heart_Cards/HeartsCard-7.png",
  "imagenes/Heart_Cards/HeartsCard-8.png",
  "imagenes/Heart_Cards/HeartsCard-9.png",
  "imagenes/Heart_Cards/HeartsCard-10.png",
  "imagenes/Heart_Cards/HeartsCard-J.png",
  "imagenes/Heart_Cards/HeartsCard-Q.png",
  "imagenes/Heart_Cards/HeartsCard-K.png"
];

function createCard() {
  if (!container) return;
  if (paused) return;
  if (container.children.length >= maxCards + maxChips) return;

  const card = document.createElement("div");
  card.classList.add("card");

  const img = cards[Math.floor(Math.random() * cards.length)];
  card.style.backgroundImage = `url("${img}")`;

  const scale = 0.5 + Math.random() * 1.2;
  const width = 60 * scale;
  const height = 90 * scale;

  card.style.width = width + "px";
  card.style.height = height + "px";

  const startX = Math.random() * (window.innerWidth - width);
  card.style.left = startX + "px";
  card.style.top = "-150px";
  card.style.opacity = 0.5 + Math.random() * 0.5;

  container.appendChild(card);

  let top = -150;
  const speed = 1 + (2 - scale);

  let rotation = Math.random() * 360;
  const rotationSpeed = Math.random() * 3 - 1.5;

  const swayAmplitude = 20 + Math.random() * 15;
  const swayFrequency = 0.01 + Math.random() * 0.02;
  const phase = Math.random() * Math.PI * 2;

  function fall() {
    if (paused) {
      requestAnimationFrame(fall);
      return;
    }

    top += speed;
    rotation += rotationSpeed;

    const sway = Math.sin(top * swayFrequency + phase) * swayAmplitude;

    card.style.top = top + "px";
    card.style.left = startX + sway + "px";
    card.style.transform = `rotate(${rotation}deg)`;

    if (top < window.innerHeight + 100) {
      requestAnimationFrame(fall);
    } else {
      card.remove();
    }
  }

  fall();
}

/* ---------------------------------------
   FICHAS
--------------------------------------- */

const chips = [];

const chipImages = [
  "imagenes/chips/Chip-Rojo.png",
  "imagenes/chips/Chip-Azul.png",
  "imagenes/chips/Chip-Amarillo.png",
  "imagenes/chips/Chip-Verde.png",
  "imagenes/chips/Chip-Negro.png"
];

function createChip() {
  if (!container) return;
  if (paused) return;
  if (chips.length >= maxChips) return;

  const chip = document.createElement("div");
  chip.classList.add("chip");

  const size = 15 + Math.random() * 45;

  chip.style.width = size + "px";
  chip.style.height = size + "px";

  const img = chipImages[Math.floor(Math.random() * chipImages.length)];
  chip.style.backgroundImage = `url("${img}")`;

  chip.style.left = `${Math.random() * (window.innerWidth - size)}px`;
  chip.style.top = "-80px";

  chip.value = Math.max(1, Math.round(size / 10));
  chip.speed = 4 - size / 18;

  if (chip.speed < 0.8) {
    chip.speed = 0.8;
  }

  chip.rotation = Math.random() * 360;
  chip.rotationSpeed = (Math.random() * 4 + 2) * (Math.random() < 0.5 ? -1 : 1);

  chip.addEventListener("click", () => {
    collectChip(chip);
  });

  container.appendChild(chip);
  chips.push(chip);
}

function collectChip(chip) {
  const rect = chip.getBoundingClientRect();
  const gainedChips = chip.value * chipMultiplier;

  addPlayerChips(gainedChips);
  createChipExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2);
  showChipGainText(`+${gainedChips}`, rect.left, rect.top);

  const chipIndex = chips.indexOf(chip);

  if (chipIndex !== -1) {
    chips.splice(chipIndex, 1);
  }

  chip.remove();
}

function createChipExplosion(x, y) {
  for (let i = 0; i < 12; i++) {
    const miniChip = document.createElement("div");
    miniChip.classList.add("chip-pop");

    const angle = Math.random() * Math.PI * 2;
    const distance = 25 + Math.random() * 45;

    miniChip.style.left = `${x}px`;
    miniChip.style.top = `${y}px`;
    miniChip.style.setProperty("--pop-x", `${Math.cos(angle) * distance}px`);
    miniChip.style.setProperty("--pop-y", `${Math.sin(angle) * distance}px`);

    document.body.appendChild(miniChip);

    setTimeout(() => {
      miniChip.remove();
    }, 700);
  }
}

function showChipGainText(text, x, y) {
  const gainText = document.createElement("div");
  gainText.classList.add("chip-gain-text");
  gainText.textContent = text;
  gainText.style.left = `${x}px`;
  gainText.style.top = `${y}px`;

  document.body.appendChild(gainText);

  setTimeout(() => {
    gainText.remove();
  }, 850);
}

function animateChips() {
  if (!paused) {
    for (let i = chips.length - 1; i >= 0; i--) {
      const chip = chips[i];

      let top = parseFloat(chip.style.top);
      top += chip.speed;

      chip.rotation += chip.rotationSpeed;

      chip.style.top = top + "px";
      chip.style.transform = `rotate(${chip.rotation}deg)`;

      if (top > window.innerHeight + 80) {
        chip.remove();
        chips.splice(i, 1);
      }
    }
  }

  requestAnimationFrame(animateChips);
}

/* ---------------------------------------
   VALORES FIJOS
--------------------------------------- */

const fixedCardsRate = 35;
const fixedChipsRate = 22;

const cardsDelay = 500 - fixedCardsRate * 1.8;
const chipsDelay = 500 - fixedChipsRate * 1.8;

animateChips();

let backgroundStarted = false;
let cardsInterval = null;
let chipsInterval = null;

function startBackgroundFall() {
  if (backgroundStarted) return;

  backgroundStarted = true;

  cardsInterval = setInterval(createCard, Math.max(10, cardsDelay));
  chipsInterval = setInterval(createChip, Math.max(10, chipsDelay));
}

window.addEventListener("casinoMusicStarted", () => {
  startBackgroundFall();
});