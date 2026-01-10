const container = document.getElementById('game-container');

const maxCards = 150; // límite de cartas en pantalla

// Lista de cartas (todas en PNG)
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

// Pausa automática cuando la pestaña no está activa
let paused = false;
document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
});

function createCard() {
    if (paused) return;
    if (container.children.length >= maxCards) return;

    const card = document.createElement('div');
    card.classList.add('card');

    const cardImage = cards[Math.floor(Math.random() * cards.length)];
    card.style.backgroundImage = `url("${cardImage}")`;

    const scale = 0.5 + Math.random() * 1.2;
    const width = 60 * scale;
    const height = 90 * scale;

    card.style.width = width + 'px';
    card.style.height = height + 'px';

    let startX = Math.random() * (window.innerWidth - width);
    card.style.left = startX + 'px';
    card.style.opacity = 0.5 + Math.random() * 0.5;

    container.appendChild(card);

    let top = -150;
    const speed = 1 + (2 - scale); // grande = más lento, pequeño = más rápido

    let rotation = Math.random() * 360;
    const rotationSpeed = Math.random() * 3 - 1.5;

    // Movimiento horizontal tipo bamboleo
    const swayAmplitude = 20 + Math.random() * 15; // px de lado a lado
    const swayFrequency = 0.01 + Math.random() * 0.02; // velocidad de oscilación
    const phase = Math.random() * Math.PI * 2;

    function fall() {
        top += speed;
        rotation += rotationSpeed;

        const sway = Math.sin(top * swayFrequency + phase) * swayAmplitude;

        card.style.top = top + 'px';
        card.style.left = startX + sway + 'px';
        card.style.transform = `rotate(${rotation}deg)`;

        if (top < window.innerHeight + 50) {
            requestAnimationFrame(fall);
        } else {
            card.remove();
        }
    }

    fall();
}

// Crear cartas continuamente
setInterval(createCard, 150);

// Limpiar todas las cartas cada 3 minutos
setInterval(() => {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => card.remove());
}, 180000);

// Música de fondo
const backgroundMusic = new Audio('musica/taberna.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;
backgroundMusic.play().catch(e => {
    console.log("Autoplay bloqueado:", e);
});
