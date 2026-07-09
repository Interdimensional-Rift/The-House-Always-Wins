(() => {
  const openDiceButton = document.getElementById("open-dice");
  const diceGame = document.getElementById("dice-game");
  const closeDiceButton = document.getElementById("close-dice");
  const diceArea = document.getElementById("dice-area");
  const diceMessage = document.getElementById("dice-message");
  const playerScoreText = document.getElementById("player-score");
  const aiScoreText = document.getElementById("ai-score");
  const turnScoreText = document.getElementById("turn-score");
  const diceTargetText = document.getElementById("dice-target");
  const takeDiceButton = document.getElementById("take-dice");
  const rollDiceButton = document.getElementById("roll-dice");
  const bankDiceButton = document.getElementById("bank-dice");
  const startDiceButton = document.getElementById("start-dice");
  const diceBetInput = document.getElementById("dice-bet");
  const diceHelpButton = document.getElementById("dice-help-button");
  const diceHelp = document.getElementById("dice-help");

  const requiredDiceElements = [
    openDiceButton, diceGame, closeDiceButton, diceArea, diceMessage,
    playerScoreText, aiScoreText, turnScoreText, diceTargetText,
    takeDiceButton, rollDiceButton, bankDiceButton,
    startDiceButton, diceBetInput, diceHelpButton, diceHelp
  ];

  // 1. Declaraciones de funciones (Hoisting permite su uso en cualquier parte del archivo)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createRandomTargetScore() {
  const roll = Math.random();
  if (roll < 0.85) return randomInt(1000, 3000);
  if (roll < 0.98) return randomInt(3001, 4000);
  return randomInt(4001, 5000);
}

// 2. Inicialización de estado (Ya no fallará al llamar a las funciones anteriores)
let targetScore = createRandomTargetScore();



  // Comprobación de seguridad en el DOM
  if (requiredDiceElements.some((element) => !element)) {
    console.error("Faltan elementos HTML para Dados. Revisa los IDs de tu archivo HTML.");
    return;
  }

  // --- MOTOR DE AUDIO SINTETIZADO ---
  const AudioEngine = {
    ctx: null,
    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    },
    playDiceRoll() {
      this.init();
      const pitchRate = 0.85 + Math.random() * 0.3; // Variación aleatoria de tono
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.playbackRate.value = pitchRate;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 800 * pitchRate;
      filter.Q.value = 3;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    },
    playChipSound() {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200 + Math.random() * 200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    }
  };

  const defaultPlayerProfile = {
    gamesPlayed: 0, wins: 0, losses: 0, totalBets: 0, totalBanks: 0,
    totalBankedPoints: 0, riskyRolls: 0, safeBanks: 0, aggressiveBanks: 0
  };

  // LECTURA BLINDADA DE LOCALSTORAGE
  function loadProfileSafe() {
    try {
      const saved = localStorage.getItem("dicePlayerProfile");
      if (!saved || saved === "undefined") return { ...defaultPlayerProfile };
      return { ...defaultPlayerProfile, ...JSON.parse(saved) };
    } catch (e) {
      console.warn("Datos de perfil corruptos en localStorage. Restaurando por defecto.", e);
      return { ...defaultPlayerProfile };
    }
  }

  let playerProfile = loadProfileSafe();
  const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  let diceBet = 0;
  let diceGameStarted = false;
  let playerScore = 0;
  let aiScore = 0;
  let turnScore = 0;
  let diceCount = 5;
  let currentRoll = [];
  let selectedDice = new Set();
  let dicePositions = [];
  let playerTurn = true;
  let busy = false;

  diceTargetText.textContent = targetScore;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function savePlayerProfile() {
    try {
      localStorage.setItem("dicePlayerProfile", JSON.stringify(playerProfile));
    } catch (e) {
      console.error("No se pudo guardar en localStorage", e);
    }
  }

  function learnFromBet(bet) {
    playerProfile.gamesPlayed++;
    playerProfile.totalBets += bet;
    savePlayerProfile();
  }

  function learnFromBank(scoreBanked) {
    playerProfile.totalBanks++;
    playerProfile.totalBankedPoints += scoreBanked;
    if (scoreBanked <= 250) playerProfile.safeBanks++;
    if (scoreBanked >= 650) playerProfile.aggressiveBanks++;
    savePlayerProfile();
  }

  function learnFromRiskyRoll() {
    if (playerTurn && diceCount <= 2) {
      playerProfile.riskyRolls++;
      savePlayerProfile();
    }
  }

  function learnFromGameResult(playerWon) {
    playerWon ? playerProfile.wins++ : playerProfile.losses++;
    savePlayerProfile();
  }

  const getAverageBet = () => playerProfile.totalBets / Math.max(1, playerProfile.gamesPlayed);
  const getAverageBankScore = () => playerProfile.totalBankedPoints / Math.max(1, playerProfile.totalBanks);

  function getPlayerStyle() {
    const averageBank = getAverageBankScore();
    const riskyRate = playerProfile.riskyRolls / Math.max(1, playerProfile.gamesPlayed);
    const aggressiveRate = playerProfile.aggressiveBanks / Math.max(1, playerProfile.totalBanks);

    if (averageBank >= 650 || riskyRate >= 2 || aggressiveRate >= 0.45) return "aggressive";
    if (averageBank > 0 && (averageBank <= 260 || (playerProfile.safeBanks / Math.max(1, playerProfile.totalBanks)) >= 0.55)) return "conservative";
    return "balanced";
  }

  function getBetDifficulty() {
    const averageBet = getAverageBet();
    if (diceBet >= 1000 || averageBet >= 700) return 1.45;
    if (diceBet >= 500 || averageBet >= 400) return 1.3;
    if (diceBet >= 250 || averageBet >= 200) return 1.18;
    if (diceBet >= 100 || averageBet >= 100) return 1.08;
    return 1;
  }

  function getAiStrategy() {
    const betDifficulty = getBetDifficulty();
    const playerStyle = getPlayerStyle();
    const aiPointsLeft = targetScore - aiScore;
    const playerPointsLeft = targetScore - playerScore;

    if (aiPointsLeft <= 650) return { bankAt: Math.max(160, 360 / betDifficulty), riskLimitDice: 3, takeFives: true };
    if (playerPointsLeft <= 650) return { bankAt: Math.max(420, 760 / betDifficulty), riskLimitDice: 2, takeFives: true };
    if (playerStyle === "aggressive") return { bankAt: Math.max(260, 520 / betDifficulty), riskLimitDice: 3, takeFives: true };
    if (playerStyle === "conservative") return { bankAt: Math.max(380, 720 / betDifficulty), riskLimitDice: 2, takeFives: true };
    if ((playerScore / targetScore) - (aiScore / targetScore) > 0.2) return { bankAt: Math.max(460, 820 / betDifficulty), riskLimitDice: 2, takeFives: true };
    return { bankAt: Math.max(320, 620 / betDifficulty), riskLimitDice: 2, takeFives: true };
  }

  const rollDice = (count) => Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);

  function renderScores() {
    playerScoreText.textContent = playerScore;
    aiScoreText.textContent = aiScore;
    turnScoreText.textContent = turnScore;
  }

  // Renderizado con físicas y posiciones absolutas
  function renderDice(disabled = false, animateDice = false) {
    diceArea.innerHTML = "";
    const areaWidth = diceArea.clientWidth - 70;
    const areaHeight = diceArea.clientHeight - 70;
    const placedCoordinates = [];
    const shouldReposition = animateDice || dicePositions.length !== currentRoll.length;

    if (shouldReposition) {
      dicePositions = [];
    }

    currentRoll.forEach((value, index) => {
      const die = document.createElement("button");
      die.type = "button";
      die.className = "die";
      die.textContent = diceFaces[value - 1];

      let x, y, attempts = 0;
      const storedPosition = !shouldReposition ? dicePositions[index] : null;

      if (storedPosition) {
        x = storedPosition.x;
        y = storedPosition.y;
      } else {
        do {
          x = randomInt(15, Math.max(15, areaWidth));
          y = randomInt(15, Math.max(15, areaHeight));
          attempts++;
        } while (
          placedCoordinates.some(coord => Math.hypot(coord.x - x, coord.y - y) < 60) && 
          attempts < 20
        );

        dicePositions[index] = { x, y };
        placedCoordinates.push({ x, y });
      }

      const rotation = randomInt(-35, 35);

      die.style.left = `${x}px`;
      die.style.top = `${y}px`;
      die.style.setProperty("--final-rot", `${rotation}deg`);

      if (selectedDice.has(index)) die.classList.add("selected");
      if (disabled || !playerTurn || busy) die.classList.add("disabled");
      if (animateDice) {
        die.classList.add("is-rolling");
        die.addEventListener("animationend", () => die.classList.remove("is-rolling"), { once: true });
      }

      die.addEventListener("click", () => {
        if (!playerTurn || busy) return;
        selectedDice.has(index) ? selectedDice.delete(index) : selectedDice.add(index);
        renderDice();
      });

      diceArea.appendChild(die);
    });
  }

  function getSelectionScore(values) {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    values.forEach((value) => counts[value]++);
    let score = 0, usedDice = 0;

    for (let value = 1; value <= 6; value++) {
      if (counts[value] >= 3) {
        score += value === 1 ? 1000 : value * 100;
        if (counts[value] >= 4) score += (counts[value] - 3) * 100;
        usedDice += counts[value];
        counts[value] = 0;
      }
    }
    if (counts[1] > 0) { score += counts[1] * 100; usedDice += counts[1]; }
    if (counts[5] > 0) { score += counts[5] * 5; usedDice += counts[5]; }

    return usedDice !== values.length ? 0 : score;
  }

  function hasAnyScoringDice(values) {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    values.forEach((value) => counts[value]++);
    return counts[1] > 0 || counts[5] > 0 || counts.some((amount) => amount >= 3);
  }

  const getSelectedValues = () => [...selectedDice].map((index) => currentRoll[index]);

  function setDiceButtons(take, roll, bank) {
    takeDiceButton.disabled = !take;
    rollDiceButton.disabled = !roll;
    bankDiceButton.disabled = !bank;
  }

  function startPlayerTurn() {
    playerTurn = true;
    busy = false;
    turnScore = 0;
    diceCount = 5;
    selectedDice.clear();
    diceMessage.textContent = "Tu turno. Elige dados puntuables.";
    rollCurrentDice();
  }

  function rollCurrentDice() {
    if (!diceGameStarted || busy) return;
    if (playerTurn) learnFromRiskyRoll();

    AudioEngine.playDiceRoll();
    currentRoll = rollDice(diceCount);
    selectedDice.clear();

    renderScores();
    renderDice(false, true);
    setDiceButtons(true, false, turnScore > 0);

    if (!hasAnyScoringDice(currentRoll)) {
      diceMessage.textContent = `No salió nada. Pierdes ${turnScore} puntos no guardados.`;
      turnScore = 0;
      renderScores();
      setDiceButtons(false, false, false);
      setTimeout(startAiTurn, 1400);
    }
  }

  function takeSelectedDice() {
    if (!diceGameStarted || !playerTurn || busy) return;
    const selectedValues = getSelectedValues();
    if (selectedValues.length === 0) return (diceMessage.textContent = "Selecciona al menos un dado.");

    const gainedScore = getSelectionScore(selectedValues);
    if (gainedScore <= 0) return (diceMessage.textContent = "Esa selección no puntúa.");

    turnScore += gainedScore;
    diceCount -= selectedValues.length;

    if (diceCount <= 0) {
      diceCount = 5;
      diceMessage.textContent = `Cogiste ${gainedScore}. Todos los dados vuelven a estar disponibles.`;
    } else {
      diceMessage.textContent = `Cogiste ${gainedScore}. Te quedan ${diceCount} dados.`;
    }

    selectedDice.clear();
    currentRoll = [];
    renderScores();
    renderDice(true);
    setDiceButtons(false, true, true);
  }

  function bankPlayerScore() {
    if (!diceGameStarted || !playerTurn || busy || turnScore <= 0) return;
    learnFromBank(turnScore);
    playerScore += turnScore;
    turnScore = 0;
    renderScores();

    if (playerScore >= targetScore) {
      endGame("Ganaste. La casa no está contenta...");
      return;
    }

    diceMessage.textContent = "Guardaste tus puntos. Turno del rival.";
    setDiceButtons(false, false, false);
    setTimeout(startAiTurn, 1000);
  }

  function chooseAiDice(values) {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const chosen = [];
    const strategy = getAiStrategy();
    values.forEach((value) => counts[value]++);

    for (let value = 1; value <= 6; value++) {
      if (counts[value] >= 3) {
        let taken = 0;
        const amountToTake = counts[value] >= 4 ? counts[value] : 3;
        values.forEach((dieValue, index) => {
          if (dieValue === value && taken < amountToTake) {
            chosen.push(index);
            taken++;
          }
        });
        return chosen;
      }
    }

    values.forEach((value, index) => { if (value === 1) chosen.push(index); });
    if (strategy.takeFives) {
      values.forEach((value, index) => { if (value === 5) chosen.push(index); });
    }
    return chosen;
  }

  async function startAiTurn() {
    playerTurn = false;
    busy = true;
    turnScore = 0;
    diceCount = 5;
    selectedDice.clear();
    setDiceButtons(false, false, false);
    diceMessage.textContent = "Turno del rival...";
    renderScores();
    await wait(900);

    while (diceGame.classList.contains("visible")) {
      AudioEngine.playDiceRoll();
      currentRoll = rollDice(diceCount);
      selectedDice.clear();
      renderDice(true);
      await wait(900);

      if (!hasAnyScoringDice(currentRoll)) {
        diceMessage.textContent = `El rival no sacó nada. Pierde ${turnScore} puntos no guardados.`;
        turnScore = 0;
        renderScores();
        await wait(1200);
        startPlayerTurn();
        return;
      }

      const chosenIndexes = chooseAiDice(currentRoll);
      const chosenValues = chosenIndexes.map((index) => currentRoll[index]);
      const gainedScore = getSelectionScore(chosenValues);

      chosenIndexes.forEach((index) => selectedDice.add(index));
      renderDice(true);

      turnScore += gainedScore;
      diceCount -= chosenIndexes.length;
      if (diceCount <= 0) diceCount = 5;

      diceMessage.textContent = `El rival coge ${gainedScore}. Tiene ${turnScore} sin guardar.`;
      renderScores();
      await wait(1100);

      const strategy = getAiStrategy();
      const shouldBank = aiScore + turnScore >= targetScore || turnScore >= strategy.bankAt || (turnScore >= strategy.bankAt * 0.55 && diceCount <= strategy.riskLimitDice);

      if (shouldBank) {
        aiScore += turnScore;
        turnScore = 0;
        renderScores();
        if (aiScore >= targetScore) {
          endGame("El rival llegó antes al objetivo. Has perdido.");
          return;
        }
        diceMessage.textContent = "El rival guarda sus puntos.";
        await wait(1200);
        startPlayerTurn();
        return;
      }

      selectedDice.clear();
      diceMessage.textContent = "El rival vuelve a tirar...";
      await wait(900);
    }
  }

  async function triggerWinAnimation(totalPrize) {
    const originRect = bankDiceButton.getBoundingClientRect();
    const chipsCount = Math.min(15, totalPrize);

    for (let i = 0; i < chipsCount; i++) {
      const chip = document.createElement("div");
      chip.className = "casino-chip";
      chip.style.left = `${originRect.left + 20}px`;
      chip.style.top = `${originRect.top - 20}px`;
      document.body.appendChild(chip);

      setTimeout(() => {
        chip.style.left = `${window.innerWidth - 60}px`;
        chip.style.top = `20px`;
        chip.style.opacity = "0.2";
      }, 50 * i);

      setTimeout(() => chip.remove(), 1000 + (50 * i));
    }

    if (window.casino && window.casino.addChips) {
      const step = totalPrize > 100 ? Math.ceil(totalPrize / 50) : 1;
      let added = 0;
      while (added < totalPrize) {
        const currentAddition = Math.min(step, totalPrize - added);
        window.casino.addChips(currentAddition);
        added += currentAddition;
        AudioEngine.playChipSound();
        await wait(40);
      }
    }
  }

  function endGame(message) {
    busy = true;
    playerTurn = false;
    diceGameStarted = false;
    setDiceButtons(false, false, false);

    if (message.includes("Ganaste")) {
      learnFromGameResult(true);
      const prize = diceBet * 2;
      diceMessage.textContent = `${message} Cobras ${prize} fichas.`;
      triggerWinAnimation(prize);
    } else {
      learnFromGameResult(false);
      diceMessage.textContent = `${message} Pierdes tu apuesta.`;
    }
  }

  // SOLUCIÓN AL APERTURA: Ocultar explícitamente la rejilla y el botón Volver general
  function openDiceGame() {
    const gamesGrid = document.querySelector(".games-grid");
    const slotsMachine = document.getElementById("slots-machine");
    const closeGamesButton = document.getElementById("close-games");

    if (gamesGrid) gamesGrid.style.display = "none";
    if (slotsMachine) slotsMachine.classList.remove("visible");
    if (closeGamesButton) closeGamesButton.style.display = "none"; // Evita colisión de botones

    targetScore = createRandomTargetScore();
    diceTargetText.textContent = targetScore;
    diceGame.classList.add("visible");
    
    playerScore = 0; aiScore = 0; turnScore = 0; diceCount = 5;
    diceGameStarted = false; busy = false; playerTurn = true;
    currentRoll = []; selectedDice.clear(); dicePositions = [];
    
    diceMessage.textContent = "Elige una apuesta para empezar.";
    diceArea.innerHTML = "";
    renderScores();
    setDiceButtons(false, false, false);
  }

  function closeDiceGame() {
    const gamesGrid = document.querySelector(".games-grid");
    const closeGamesButton = document.getElementById("close-games");

    if (gamesGrid) gamesGrid.style.display = "grid";
    if (closeGamesButton) closeGamesButton.style.display = "inline-block";

    diceGame.classList.remove("visible");
    diceHelp.classList.remove("visible");
    diceGameStarted = false;
    busy = false;
  }

  function startDiceGameWithBet() {
    const bet = Number(diceBetInput.value);
    if (!Number.isInteger(bet) || bet <= 0) return (diceMessage.textContent = "Introduce una apuesta válida.");
    if (!window.casino || !window.casino.spendChips) return (diceMessage.textContent = "No se encontró el sistema de fichas.");
    if (!window.casino.spendChips(bet)) return (diceMessage.textContent = "No tienes fichas suficientes.");

    diceBet = bet;
    learnFromBet(bet);
    diceGameStarted = true;
    playerScore = 0; aiScore = 0; turnScore = 0; diceCount = 5;
    busy = false; playerTurn = true; currentRoll = []; selectedDice.clear(); dicePositions = [];
    renderScores();
    startPlayerTurn();
  }

  // VINCULACIÓN FINAL DE EVENTOS
  openDiceButton.addEventListener("click", openDiceGame);
  closeDiceButton.addEventListener("click", closeDiceGame);
  takeDiceButton.addEventListener("click", takeSelectedDice);
  rollDiceButton.addEventListener("click", rollCurrentDice);
  bankDiceButton.addEventListener("click", bankPlayerScore);
  startDiceButton.addEventListener("click", startDiceGameWithBet);
  diceHelpButton.addEventListener("click", () => diceHelp.classList.toggle("visible"));
})();