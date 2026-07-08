const dealText = document.getElementById("deal-text");
const dealButtons = document.getElementById("deal-buttons");
const acceptDeal = document.getElementById("accept-deal");
const denyDeal = document.getElementById("deny-deal");
const salirbutton = document.getElementById("salir");
const gamebuttons = document.getElementById("game-options");
const dealScene = document.getElementById("deal-scene");
const dealDialogue = document.querySelector(".deal-dialogue");

const jugarButton = document.getElementById("jugar");
const explorarButton = document.getElementById("explorar");
const explorePanel = document.getElementById("explore-panel");
const gamesPanel = document.getElementById("games-panel");
const characterName = document.getElementById("character-name");
const characterDialogue = document.getElementById("character-dialogue");
const nextCharacter = document.getElementById("next-character");
const closeExplore = document.getElementById("close-explore");
const closeGames = document.getElementById("close-games");

const previousPage = "https://interdimensional-rift.github.io/The-House-Always-Wins/";

const gameRoomMusic = new Audio("musica/oppening-odds.mp3");
gameRoomMusic.loop = true;
gameRoomMusic.volume = 0.7;

const characters = [
  {
    name: "Mario, el crupier",
    dialogue: "En el blackjack, perder la calma cuesta más que perder una ficha."
  },
  {
    name: "Ferran, el segurata",
    dialogue: "Para tener suerte tienes que buscar en tu propio bolsillo."
  },
  {
    name: "El hombre del dado rojo",
    dialogue: "Un buen lanzamiento empieza antes de tocar la mesa."
  },
  {
    name: "Aidan, el baterista",
    dialogue: "La vida es como la batería, no hace lo que quieres hasta que no te mueves."
  },
  {
    name: "Vega",
    dialogue: "Cuanto más cerca estoy de la victoria, más alejado de la salida me encuentro, por eso me mantengo al margen y calculo mi próximo movimiento."
  },
  {
    name: "Rosette",
    dialogue: "Las cartas no mienten, pero les encanta guardar secretos."
  },
  {
    name: "Uiso, el jugador",
    dialogue: "Quien teme a perder, ya renunció a ganar."
  },
  {
    name: "Pau, el barista",
    dialogue: "El secreto de ganar es perder si te sabes levantar."
  },
  {
    name: "Ibra, el vidente",
    dialogue: "He visto a gente ganar con mala suerte y perder con una sonrisa perfecta."
  },
  {
    name: "Miguel Ángel, el ludópata",
    dialogue: "¿Quieres apostar un rato?" 
    /*Añadir como mensaje especial y agregar que puedas jugar contra él con mensajes personalizados por si pierdes o ganas y que sea desbloqueado para siempre*/
  },
];

const specialMessages = [
  {
    name: "Susurro de Naevra",
    dialogue: "No pierdas el tiempo y recóge lo máximo que puedas. Las fichas ahora valen más... Por poco tiempo...",
    effect() {
      activateChipMultiplier(2, 30000);
    }
  },
  {
    name: "Regalo del salón",
    dialogue: "La casa sonríe. Has recibido 50 fichas.",
    effect() {
      addPlayerChips(50);
    }
  },
  {
    name: "La deuda invisible",
    dialogue: "Algo se cobra una pequeña parte de tus fichas.",
    effect() {
      addPlayerChips(-75);
    }
  },
  {
    name: "Parallax Ace",
    dialogue: "Vaya, has tenido suerte de toparte conmigo. Ten, te regalo esto. (+300)",
    effect() {
      addPlayerChips(300);
    }
  }
];

let characterBag = [];

function playMusicSafely() {
  gameRoomMusic.play().catch(() => {
    console.log("El navegador bloqueó la música hasta que el usuario haga click.");
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function typeText(text = "", speed = 45) {
  dealText.textContent = "";
  dealText.classList.add("visible");

  for (const letter of text) {
    dealText.textContent += letter;
    await wait(speed);
  }
}

async function playDenyDeal() {
  dealButtons.classList.remove("visible");

  const dialogue = [
    {
      text: "Vaya...",
      speed: 50,
      after: 1000
    },
    {
      text: "Qué pena...",
      speed: 50,
      after: 1500
    }
  ];

  for (const line of dialogue) {
    dealText.classList.remove("visible");
    await wait(500);

    await typeText(line.text, line.speed);
    await wait(line.after);
  }

  window.location.href = previousPage;
}

async function startDealIntro() {
  await wait(400);
  dealText.classList.add("visible");

  await wait(1300);
  dealButtons.classList.add("visible");
}

async function playAcceptedDialogue() {
  localStorage.setItem("acceptedDeal", "true");
  dealButtons.classList.remove("visible");

  const dialogue = [
    {
      text: "Bien...",
      speed: 55,
      after: 900
    },
    {
      text: "Ahora que tu alma me pertenece...",
      speed: 60,
      after: 2200
    },
    {
      text: "¡Bienvenido al Salón de Juegos!",
      speed: 38,
      after: 900,
      openVignette: true,
      playMusic: true
    },
    {
      text: "¡Espero que te diviertas!",
      speed: 38,
      after: 900
    },
    {
      text: "Y recuerda...",
      speed: 60,
      after: 1100
    },
    {
      text: "Aquí...",
      speed: 85,
      after: 1800
    },
    {
      text: "Tu destino...",
      speed: 95,
      after: 1800
    },
    {
      text: "Ya ha sido decidido...",
      speed: 105,
      after: 2500
    }
  ];

  for (const line of dialogue) {
    dealText.classList.remove("visible");
    await wait(500);

    if (line.openVignette) {
      revealVignette();
    }

    if (line.playMusic) {
      gameRoomMusic.play();
    }

    await typeText(line.text, line.speed);
    await wait(line.after);
  }

  showMainOptions();
}

function showMainOptions() {
  hidePanels();

  dealDialogue.classList.add("hidden-dialogue");
  dealScene.classList.add("revealing");

  gamebuttons.classList.remove("hidden");
  gamebuttons.classList.add("visible");
}

function hidePanels() {
  explorePanel.classList.remove("visible");
  gamesPanel.classList.remove("visible");
}

function skipIntroAfterAcceptedDeal() {
  const alreadyAcceptedDeal = localStorage.getItem("acceptedDeal") === "true";

  if (!alreadyAcceptedDeal) return false;

  dealButtons.classList.remove("visible");
  dealText.classList.remove("visible");

  document.body.classList.add("vignette-open");
  showMainOptions();

  playMusicSafely();

  return true;
}

async function revealVignette() {
  document.body.classList.add("vignette-tight");

  await wait(300);

  document.body.classList.remove("vignette-tight");
  document.body.classList.add("vignette-open");
}

async function salir() {
  hidePanels();

  gamebuttons.classList.remove("visible");
  gamebuttons.classList.add("hidden");

  dealScene.classList.remove("revealing");
  dealDialogue.classList.remove("hidden-dialogue");
  dealButtons.classList.remove("visible");

  const dialogue = [
    {
      text: "Muy bien...",
      speed: 60,
      after: 1000
    },
    {
      text: "Nos volveremos a ver...",
      speed: 50,
      after: 1500
    }
  ];

  for (const line of dialogue) {
    dealText.classList.remove("visible");
    await wait(500);

    await typeText(line.text, line.speed);
    await wait(line.after);
  }

  window.location.href = previousPage;
}

function refillCharacterBag() {
  characterBag = characters.map((_, index) => index);
}

function getRandomCharacter() {
  if (characterBag.length === 0) {
    refillCharacterBag();
  }

  const bagPosition = Math.floor(Math.random() * characterBag.length);
  const characterIndex = characterBag.splice(bagPosition, 1)[0];

  return characters[characterIndex];
}

function showRandomCharacter() {
  const specialChance = 0.12;
  const isSpecial = Math.random() < specialChance;

  if (isSpecial) {
    const special = specialMessages[Math.floor(Math.random() * specialMessages.length)];

    characterName.textContent = special.name;
    characterDialogue.textContent = special.dialogue;
    special.effect();

    return;
  }

  const character = getRandomCharacter();

  characterName.textContent = character.name;
  characterDialogue.textContent = character.dialogue;
}

function abrirExplorar() {
  gamebuttons.classList.add("hidden");
  showRandomCharacter();
  explorePanel.classList.add("visible");
}

function abrirJuegos() {
  gamebuttons.classList.add("hidden");
  gamesPanel.classList.add("visible");
}

acceptDeal.addEventListener("click", () => {
  playAcceptedDialogue();
});

denyDeal.addEventListener("click", () => {
  playDenyDeal();
});

salirbutton.addEventListener("click", () => {
  salir();
});

jugarButton.addEventListener("click", () => {
  abrirJuegos();
});

explorarButton.addEventListener("click", () => {
  abrirExplorar();
});

nextCharacter.addEventListener("click", () => {
  showRandomCharacter();
});

closeExplore.addEventListener("click", () => {
  showMainOptions();
});

closeGames.addEventListener("click", () => {
  showMainOptions();
});

if (!skipIntroAfterAcceptedDeal()) {
  startDealIntro();
}