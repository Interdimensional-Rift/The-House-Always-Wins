const openSlotsButton = document.getElementById("open-slots");
const slotsMachine = document.getElementById("slots-machine");
const closeSlotsButton = document.getElementById("close-slots");
const spinSlotsButton = document.getElementById("spin-slots");
const slotsBetInput = document.getElementById("slots-bet");
const slotsMessage = document.getElementById("slots-message");
const slotsLever = document.getElementById("slots-lever");

const slotsHelpButton = document.getElementById("slots-help-button");
const slotsHelp = document.getElementById("slots-help");

const slotReels = [
  document.getElementById("slot-1"),
  document.getElementById("slot-2"),
  document.getElementById("slot-3")
];

const slotSymbolsWithWeights = [
  { symbol: "🍋", weight: 35 }, // Muy común (35% de opciones por rodillo)
  { symbol: "🍒", weight: 28 }, // Común
  { symbol: "🔔", weight: 18 }, // Poco común
  { symbol: "💎", weight: 12 }, // Raro
  { symbol: "⭐", weight: 5 },  // Muy raro
  { symbol: "7️⃣", weight: 2 }   // Casi imposible (2% de opciones por rodillo)
];

const totalWeight = slotSymbolsWithWeights.reduce((sum, item) => sum + item.weight, 0);

let slotsSpinning = false;
let slotSpinIntervals = [];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomSlotSymbol() {
  const randomNum = Math.floor(Math.random() * totalWeight); // Número entre 0 y 99
  let weightSum = 0;

  for (const item of slotSymbolsWithWeights) {
    weightSum += item.weight;
    if (randomNum < weightSum) {
      return item.symbol; // Devuelve el símbolo según su probabilidad
    }
  }
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
    return bet * 50;
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

  const result = createSlotResult();

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

function createSlotResult() {
  const roll = Math.random();

  // 1. Jackpot x50: 2% de probabilidad (0.00 a 0.02)
  if (roll < 0.02) {
    return ["7️⃣", "7️⃣", "7️⃣"];
  }

  // 2. Tres iguales x5: 15% de probabilidad (0.02 a 0.17)
  else if (roll < 0.17) {
    const symbols = ["🍋", "🍒", "🔔", "💎", "⭐"];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    return [symbol, symbol, symbol];
  }

  // 3. Dos iguales x2: 30% de probabilidad (0.17 a 0.47)
  else if (roll < 0.47) {
    const pairSymbols = ["🍋", "🍒", "🔔", "💎", "⭐"];
    const pairSymbol = pairSymbols[Math.floor(Math.random() * pairSymbols.length)];

    let differentSymbol = randomSlotSymbol();

    while (differentSymbol === pairSymbol) {
      differentSymbol = randomSlotSymbol();
    }

    const result = [pairSymbol, pairSymbol, differentSymbol];

    for (let i = result.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [result[i], result[randomIndex]] = [result[randomIndex], result[i]];
    }

    return result;
  }

  // 4. Perder: 53% de probabilidad restante (0.47 a 1.00)
  return createLosingResult();
}

function createLosingResult() {
  const result = [];

  while (result.length < 3) {
    const symbol = randomSlotSymbol();

    if (!result.includes(symbol)) {
      result.push(symbol);
    }
  }

  return result;
}

slotsHelpButton.addEventListener("click", () => {
  slotsHelp.classList.toggle("visible");
});
