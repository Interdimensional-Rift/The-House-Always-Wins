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

// ==========================================
// CONFIGURACIÓN DE AUDIO PARA SLOTS (FILE:// COMPATIBLE)
// ==========================================
const SOUND_PATHS = {
  girar: "sonidos/Tirada.mp3",       
  slot: "sonidos/Slot.mp3",      
  premiox2: "sonidos/slot-mashine-cashout2(completo).mp3", 
  premiox5: "sonidos/slots-ganarX5.mp3", 
  premiox50: "sonidos/Jackpot-Ganar(completo).mp3", 
  perder: "sonidos/slots-perder.mp3"      
};

function playSlotSound(soundKey) {
  try {
    const soundPath = SOUND_PATHS[soundKey];
    if (!soundPath) return;
    
    const audio = new Audio(soundPath);
    audio.preload = "auto";
    
    // MODIFICADO: Aseguramos el volumen máximo nativo (1.0 es el 100%)
    audio.volume = 1.0; 
    
    audio.play().catch(err => {
      console.log(`El navegador requería interacción previa para reproducir: ${soundKey}`, err);
    });
  } catch (e) {
    console.error(`Error al reproducir audio de slots (${soundKey}):`, e);
  }
}

function animateChipsCounter(startValue, targetValue, durationSeconds, onUpdate, onComplete) {
  const startTime = performance.now();
  const durationMs = durationSeconds * 1000;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / durationMs, 1);

    const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
    
    onUpdate(currentValue);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      if (onComplete) onComplete();
    }
  }
  requestAnimationFrame(update);
}
// ==========================================

const slotSymbolsWithWeights = [
  { symbol: "🍋", weight: 35 }, 
  { symbol: "🍒", weight: 28 }, 
  { symbol: "🔔", weight: 18 }, 
  { symbol: "💎", weight: 12 }, 
  { symbol: "⭐", weight: 5 },  
  { symbol: "7️⃣", weight: 2 }   
];

const totalWeight = slotSymbolsWithWeights.reduce((sum, item) => sum + item.weight, 0);

let slotsSpinning = false;
let slotSpinIntervals = [];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomSlotSymbol() {
  const randomNum = Math.floor(Math.random() * totalWeight); 
  let weightSum = 0;

  for (const item of slotSymbolsWithWeights) {
    weightSum += item.weight;
    if (randomNum < weightSum) {
      return item.symbol; 
    }
  }
}

function startReelSpin(reel, index) {
  // Limpiamos flashes anteriores por seguridad
  reel.classList.remove("jackpot-flash");
  reel.classList.add("spinning");

  slotSpinIntervals[index] = setInterval(() => {
    reel.textContent = randomSlotSymbol();
  }, 80);
}

function stopReelSpin(reel, index, finalSymbol) {
  clearInterval(slotSpinIntervals[index]);
  reel.classList.remove("spinning");
  reel.textContent = finalSymbol;
  
  playSlotSound("slot");
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
  
  // Limpiar luces si se cierra el juego abruptamente
  slotReels.forEach(reel => reel.classList.remove("jackpot-flash"));
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

  playSlotSound("grid"); // Nota: Si tu clave en el objeto es "girar", cámbialo a playSlotSound("girar")
  playSlotSound("girar");

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
    const currentChips = window.casino.getChips ? window.casino.getChips() : 0;
    const finalChips = currentChips + prize;
    
    let soundDuration = 2.0; 
    const multiplier = prize / bet;

    if (multiplier === 50) {
      soundDuration = 5.5; 
      playSlotSound("premiox50");
      
      // NUEVO: Activamos el efecto de destellos en los 3 rodillos al sacar el Jackpot
      slotReels.forEach(reel => reel.classList.add("jackpot-flash"));
      
    } else if (multiplier === 5) {
      soundDuration = 3.0; 
      playSlotSound("premiox5"); 
    } else if (multiplier === 2) {
      soundDuration = 1.8; 
      playSlotSound("premiox2");
    }

    animateChipsCounter(
      currentChips,
      finalChips,
      soundDuration,
      (animatedValue) => {
        slotsMessage.textContent = `¡Premio! Sumando fichas: ${animatedValue - currentChips}`;
      },
      () => {
        window.casino.addChips(prize);
        slotsMessage.textContent = `Ganaste ${prize} fichas.`;
        
        // NUEVO: Apagamos los destellos cuando el premio termina de sumarse
        slotReels.forEach(reel => reel.classList.remove("jackpot-flash"));
        
        slotsSpinning = false;
        spinSlotsButton.disabled = false;
      }
    );

  } else {
    slotsMessage.textContent = "Nada esta vez...";
    playSlotSound("perder");
    
    slotsSpinning = false;
    spinSlotsButton.disabled = false;
  }
}

openSlotsButton.addEventListener("click", openSlots);
closeSlotsButton.addEventListener("click", closeSlots);
spinSlotsButton.addEventListener("click", spinSlots);

function createSlotResult() {
  const roll = Math.random();

  if (roll < 0.02) {
    return ["7️⃣", "7️⃣", "7️⃣"];
  }
  else if (roll < 0.12) {
    const symbols = ["🍋", "🍒", "🔔", "💎", "⭐"];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    return [symbol, symbol, symbol];
  }
  else if (roll < 0.35) {
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
