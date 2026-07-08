/*function jugarSlots(apuesta) {
  if (!window.casino.spendChips(apuesta)) {
    alert("No tienes fichas suficientes.");
    return;
  }

  const ganar125 = Math.random() < 0.5;
  const ganar200 = Math.random() < 0.25;
  const ganar300 = Math.random() < 0.1;

  if (ganar125) {
    const premio = apuesta * 1.25;
    window.casino.addChips(premio);
    alert(`Ganaste ${premio} fichas.`);
  } else {
    alert("Perdiste la apuesta.");
  }
  
  if (ganar200) {
    const premio = apuesta * 2;
    window.casino.addChips(premio);
    alert(`Ganaste ${premio} fichas.`);
  } else {
    alert("Perdiste la apuesta.")
  }

  if (ganar300) {
    const premio = apuesta * 3;
    window.casino.addChips(premio);
    alert(`Ganaste ${premio} fichas.`);
  } else {
    alert("Perdiste la apuesta.")
  }
}*/

const openSlotsButton = document.getElementById("open-slots");
const slotsMachine = document.getElementById("slots-machine");
const closeSlotsButton = document.getElementById("close-slots");
const spinSlotsButton = document.getElementById("spin-slots");
const slotsBetInput = document.getElementById("slots-bet");
const slotsMessage = document.getElementById("slots-message");
const slotsLever = document.getElementById("slots-lever");

const slotReels = [
  document.getElementById("slot-1"),
  document.getElementById("slot-2"),
  document.getElementById("slot-3")
];

const slotSymbols = ["🍒", "🔔", "💎", "7️⃣", "🍋", "⭐"];

let slotsSpinning = false;
let slotSpinIntervals = [];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomSlotSymbol() {
  return slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
}

function startReelSpin(reel, index) {
  reel.classList.add("spinning");

  slotSpinIntervals[index] = setInterval(() => {
    reel.textContent = randomSlotSymbol();
  }, 80);
}

function stopReelSpin(reel, index, finalSymbol) {
  clearInterval(slotSpinIntervals[index]);
  reel.classList.remove("spinning");
  reel.textContent = finalSymbol;
}

function getSlotsPrize(bet, result) {
  const [a, b, c] = result;

  if (a === "7️⃣" && b === "7️⃣" && c === "7️⃣") {
    return bet * 10;
  }

  if (a === b && b === c) {
    return bet * 5;
  }

  if (a === b || a === c || b === c) {
    return bet * 2;
  }

  return 0;
}

function openSlots() {
  const gamesGrid = document.querySelector(".games-grid");

  gamesGrid.style.display = "none";
  slotsMachine.classList.add("visible");
  slotsMessage.textContent = "";
}

function closeSlots() {
  const gamesGrid = document.querySelector(".games-grid");

  gamesGrid.style.display = "grid";
  slotsMachine.classList.remove("visible");
  slotsMessage.textContent = "";
}

async function spinSlots() {
  if (slotsSpinning) return;

  const bet = Number(slotsBetInput.value);

  if (!Number.isInteger(bet) || bet <= 0) {
    slotsMessage.textContent = "Introduce una apuesta válida.";
    return;
  }

  if (!window.casino || !window.casino.spendChips) {
    slotsMessage.textContent = "No se encontró el sistema de fichas.";
    return;
  }

  if (!window.casino.spendChips(bet)) {
    slotsMessage.textContent = "No tienes fichas suficientes.";
    return;
  }

  slotsSpinning = true;
  spinSlotsButton.disabled = true;
  slotsMessage.textContent = "Girando...";

  slotsLever.classList.add("pulled");

  slotReels.forEach((reel, index) => {
    startReelSpin(reel, index);
  });

  await wait(350);
  slotsLever.classList.remove("pulled");

  const result = [
    randomSlotSymbol(),
    randomSlotSymbol(),
    randomSlotSymbol()
  ];

  await wait(700);
  stopReelSpin(slotReels[0], 0, result[0]);

  await wait(200);
  stopReelSpin(slotReels[1], 1, result[1]);

  await wait(200);
  stopReelSpin(slotReels[2], 2, result[2]);

  const prize = getSlotsPrize(bet, result);

  if (prize > 0) {
    window.casino.addChips(prize);
    slotsMessage.textContent = `Ganaste ${prize} fichas.`;
  } else {
    slotsMessage.textContent = "Nada esta vez...";
  }

  slotsSpinning = false;
  spinSlotsButton.disabled = false;
}

openSlotsButton.addEventListener("click", openSlots);
closeSlotsButton.addEventListener("click", closeSlots);
spinSlotsButton.addEventListener("click", spinSlots);