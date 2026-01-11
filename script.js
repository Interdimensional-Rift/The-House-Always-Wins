const curtain = document.getElementById("curtain-container");
const rope = document.getElementById("rope");
const stage = document.getElementById("stage");
const music = document.getElementById("music");
const disc = document.getElementById("music-disc");

let showStarted = false;
let muted = false;

// Variables para rotación manual
let discAngle = 0;         // ángulo actual
let spinning = false;
let lastTimestamp = null;

// Tirar de la cuerda
rope.addEventListener("click", () => {
  if (showStarted) return;
  showStarted = true;

  // Estirón
  rope.classList.add("pull");

  // Telón empieza a abrirse
  setTimeout(() => {
    curtain.classList.add("open");
  }, 200);

  // La cuerda sube y desaparece
  setTimeout(() => {
    rope.classList.remove("pull");
    rope.classList.add("hide");
  }, 600);

  // Aparece el escenario y la música
  setTimeout(() => {
    stage.classList.add("visible");
    music.play();
    startDiscSpin();
  }, 1200);
});

// Disco = mute / play
disc.addEventListener("click", () => {
  if (!showStarted) return;

  if (muted) {
    music.play();
    startDiscSpin();
  } else {
    music.pause();
    stopDiscSpin();
  }

  muted = !muted;
});

// ---------------------
// FUNCIONES DE DISC
// ---------------------

function startDiscSpin() {
  if (!spinning) {
    spinning = true;
    lastTimestamp = null;
    requestAnimationFrame(rotateDisc);
  }
}

function stopDiscSpin() {
  spinning = false; // solo para detener la animación, no resetea ángulo
}

function rotateDisc(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  // Velocidad: 360 grados en 6 segundos = 0.06 deg/ms
  discAngle += 0.06 * delta;
  discAngle %= 360;

  disc.style.transform = `rotate(${discAngle}deg)`;

  if (spinning) {
    requestAnimationFrame(rotateDisc);
  }
}
