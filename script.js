const container = document.getElementById('game-container');

/* ---------------------------------------
   CONFIGURACIÓN GENERAL
--------------------------------------- */
const maxCards = 255;
const maxChips = 255;

let paused = false;
document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
});

/* ---------------------------------------
   CARTAS
--------------------------------------- */

const cards = [
  'imagenes/Jocker_Cards/JockerCard.png',
  'imagenes/Diamond_Cards/DiamondCard-A.png',
  'imagenes/Diamond_Cards/DiamondCard-2.png',
  'imagenes/Diamond_Cards/DiamondCard-3.png',
  'imagenes/Diamond_Cards/DiamondCard-4.png',
  'imagenes/Diamond_Cards/DiamondCard-5.png',
  'imagenes/Diamond_Cards/DiamondCard-6.png',
  'imagenes/Diamond_Cards/DiamondCard-7.png',
  'imagenes/Diamond_Cards/DiamondCard-8.png',
  'imagenes/Diamond_Cards/DiamondCard-9.png',
  'imagenes/Diamond_Cards/DiamondCard-10.png',
  'imagenes/Diamond_Cards/DiamondCard-J.png',
  'imagenes/Diamond_Cards/DiamondCard-Q.png',
  'imagenes/Diamond_Cards/DiamondCard-K.png',
  'imagenes/Spade_Cards/SpadeCard-A.png',
  'imagenes/Spade_Cards/SpadeCard-2.png',
  'imagenes/Spade_Cards/SpadeCard-3.png',
  'imagenes/Spade_Cards/SpadeCard-4.png',
  'imagenes/Spade_Cards/SpadeCard-5.png',
  'imagenes/Spade_Cards/SpadeCard-6.png',
  'imagenes/Spade_Cards/SpadeCard-7.png',
  'imagenes/Spade_Cards/SpadeCard-8.png',
  'imagenes/Spade_Cards/SpadeCard-9.png',
  'imagenes/Spade_Cards/SpadeCard-10.png',
  'imagenes/Spade_Cards/SpadeCard-J.png',
  'imagenes/Spade_Cards/SpadeCard-Q.png',
  'imagenes/Spade_Cards/SpadeCard-K.png',
  'imagenes/Club_Cards/ClubCard-A.png',
  'imagenes/Club_Cards/ClubCard-2.png',
  'imagenes/Club_Cards/ClubCard-3.png',
  'imagenes/Club_Cards/ClubCard-4.png',
  'imagenes/Club_Cards/ClubCard-5.png',
  'imagenes/Club_Cards/ClubCard-6.png',
  'imagenes/Club_Cards/ClubCard-7.png',
  'imagenes/Club_Cards/ClubCard-8.png',
  'imagenes/Club_Cards/ClubCard-9.png',
  'imagenes/Club_Cards/ClubCard-10.png',
  'imagenes/Club_Cards/ClubCard-J.png',
  'imagenes/Club_Cards/ClubCard-Q.png',
  'imagenes/Club_Cards/ClubCard-K.png',
  'imagenes/Heart_Cards/HeartCard-A.png',
  'imagenes/Heart_Cards/HeartCard-2.png',
  'imagenes/Heart_Cards/HeartCard-3.png',
  'imagenes/Heart_Cards/HeartCard-4.png',
  'imagenes/Heart_Cards/HeartCard-5.png',
  'imagenes/Heart_Cards/HeartCard-6.png',
  'imagenes/Heart_Cards/HeartCard-7.png',
  'imagenes/Heart_Cards/HeartCard-8.png',
  'imagenes/Heart_Cards/HeartCard-9.png',
  'imagenes/Heart_Cards/HeartCard-10.png',
  'imagenes/Heart_Cards/HeartCard-J.png',
  'imagenes/Heart_Cards/HeartCard-Q.png',
  'imagenes/Heart_Cards/HeartCard-K.png'
];

function createCard() {
    if (paused) return;
    if (container.children.length >= maxCards + maxChips) return;

    const card = document.createElement('div');
    card.classList.add('card');

    const img = cards[Math.floor(Math.random() * cards.length)];
    card.style.backgroundImage = `url("${img}")`;

    const scale = 0.5 + Math.random() * 1.2;
    const width = 60 * scale;
    const height = 90 * scale;

    card.style.width = width + 'px';
    card.style.height = height + 'px';

    let startX = Math.random() * (window.innerWidth - width);
    card.style.left = startX + 'px';
    card.style.top = '-150px';
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

        card.style.top = top + 'px';
        card.style.left = startX + sway + 'px';
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
    "imagenes/chips/Chip-Negro.png",
];

function createChip() {
    if (paused) return;
    if (chips.length >= maxChips) return;

    const chip = document.createElement('div');
    chip.classList.add('card');

    const size = 15 + Math.random() * 30;
    chip.style.width = size + 'px';
    chip.style.height = size + 'px';

    const img = chipImages[Math.floor(Math.random() * chipImages.length)];
    chip.style.backgroundImage = `url("${img}")`;

    chip.style.left = `${Math.random() * (window.innerWidth - size)}px`;
    chip.style.top = '-80px';

    chip.speed = 4 - (size / 15);
    if (chip.speed < 0.8) chip.speed = 0.8;

    chip.rotation = Math.random() * 360;
    chip.rotationSpeed = (Math.random() * 4 + 2) * (Math.random() < 0.5 ? -1 : 1);

    container.appendChild(chip);
    chips.push(chip);
}

function animateChips() {
    if (!paused) {
        for (let i = chips.length - 1; i >= 0; i--) {
            const chip = chips[i];

            let top = parseFloat(chip.style.top);
            top += chip.speed;

            chip.rotation += chip.rotationSpeed;

            chip.style.top = top + 'px';
            chip.style.transform = `rotate(${chip.rotation}deg)`;

            if (top > window.innerHeight + 80) {
                chip.remove();
                chips.splice(i, 1);
            }
        }
    }
    requestAnimationFrame(animateChips);
}

animateChips();

/* ---------------------------------------
   CONTROLES (SLIDER + INPUT)
--------------------------------------- */

const cardsSlider = document.getElementById("cardsRate");
const chipsSlider = document.getElementById("chipsRate");

const cardsInput = document.getElementById("cardsInput");
const chipsInput = document.getElementById("chipsInput");

let cardsInterval = null;
let chipsInterval = null;

function updateCardsRate() {
  if (cardsInterval) clearInterval(cardsInterval);

  let value = parseInt(cardsSlider.value);
  cardsInput.value = value;

  if (value > 0) {
    const delay = 500 - value * 1.8;
    cardsInterval = setInterval(createCard, Math.max(10, delay));
  }
}

function updateChipsRate() {
  if (chipsInterval) clearInterval(chipsInterval);

  let value = parseInt(chipsSlider.value);
  chipsInput.value = value;

  if (value > 0) {
    const delay = 500 - value * 1.8;
    chipsInterval = setInterval(createChip, Math.max(10, delay));
  }
}

cardsSlider.addEventListener("input", updateCardsRate);
chipsSlider.addEventListener("input", updateChipsRate);

cardsInput.addEventListener("input", () => {
  let value = parseInt(cardsInput.value) || 0;
  value = Math.max(0, Math.min(255, value));
  cardsInput.value = value;
  cardsSlider.value = value;
  updateCardsRate();
});

chipsInput.addEventListener("input", () => {
  let value = parseInt(chipsInput.value) || 0;
  value = Math.max(0, Math.min(255, value));
  chipsInput.value = value;
  chipsSlider.value = value;
  updateChipsRate();
});

// iniciar valores por defecto
updateCardsRate();
updateChipsRate();