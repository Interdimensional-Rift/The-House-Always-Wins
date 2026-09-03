// --- LÓGICA DE INTERFAZ Y MENÚS ---
const btnOpenBlackjack = document.getElementById('open-blackjack');
const btnCloseBlackjack = document.getElementById('close-blackjack');
const blackjackGame = document.getElementById('blackjack-game');
const btnHelpBlackjack = document.getElementById('blackjack-help-button');
const helpBlackjack = document.getElementById('blackjack-help');

btnOpenBlackjack.addEventListener('click', () => {
    // Aquí puedes ocultar el grid si tu script principal no lo hace automáticamente
    document.querySelector('.games-grid').style.display = 'none';
    blackjackGame.style.display = 'block';
});

btnCloseBlackjack.addEventListener('click', () => {
    blackjackGame.style.display = 'none';
    document.querySelector('.games-grid').style.display = 'grid'; // o 'flex' según tu CSS
});

btnHelpBlackjack.addEventListener('click', () => {
    helpBlackjack.style.display = helpBlackjack.style.display === 'none' ? 'block' : 'none';
});

// --- LÓGICA DEL JUEGO BLACKJACK CON AUDIOS, IA Y VISIBILIDAD CORREGIDA ---
let baraja = [];
let puntosJugador = 0, puntosCrupier = 0;
let asesJugador = 0, asesCrupier = 0;
let apuestaActual = 0;
let cartaOcultaCrupier = null;

const palos = ["Corazones", "Diamantes", "Tréboles", "Picas"];
const valores = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const chipsCountEl = document.getElementById('chips-count');

const soundDeal = new Audio('sonidos/black-jack/nada.mp3');
const soundFlip = new Audio('sonidos/black-jack/give-card.mp3');
const soundWin = new Audio('sonidos/black-jack/ganar.mp3');

const ChipSound = {
    ctx: null,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    play() {
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

async function triggerBlackjackWinAnimation(totalPrize) {
    const origin = document.getElementById("blackjack-message");
    const originRect = origin.getBoundingClientRect();
    const chipsCount = Math.min(15, totalPrize);

    for (let i = 0; i < chipsCount; i++) {
        const chip = document.createElement("div");
        chip.className = "casino-chip";
        chip.style.left = `${originRect.left + originRect.width / 2}px`;
        chip.style.top = `${originRect.top}px`;
        document.body.appendChild(chip);

        setTimeout(() => {
            chip.style.left = `${window.innerWidth - 60}px`;
            chip.style.top = "20px";
            chip.style.opacity = "0.2";
        }, 50 * i);

        setTimeout(() => chip.remove(), 1000 + 50 * i);
    }

    const step = totalPrize > 100 ? Math.ceil(totalPrize / 50) : 1;
    let added = 0;

    while (added < totalPrize) {
        const currentAddition = Math.min(step, totalPrize - added);
        setFichas(getFichas() + currentAddition);
        added += currentAddition;

        ChipSound.play();
        await delay(40);
    }
}

function playAudio(audioObj) {
    try {
        audioObj.currentTime = 0;
        audioObj.play().catch(() => {});
    } catch (e) {}
}

function getFichas() { return parseInt(chipsCountEl.innerText) || 0; }
function setFichas(cantidad) { chipsCountEl.innerText = cantidad; }
const delay = ms => new Promise(res => setTimeout(res, ms));

function crearBaraja() {
    baraja = [];
    for (let p of palos) {
        for (let v of valores) baraja.push({ valor: v, palo: p });
    }
    baraja = baraja.sort(() => Math.random() - 0.5);
}

function valorCarta(carta) {
    if (["J", "Q", "K"].includes(carta.valor)) return 10;
    if (carta.valor === "A") return 11;
    return parseInt(carta.valor);
}

function ajustarAses(puntos, ases) {
    while (puntos > 21 && ases > 0) {
        puntos -= 10;
        ases -= 1;
    }

    return { puntos, ases };
}

async function renderizarCartaAnimada(carta, contenedorId, oculta = false) {
    let contenedor = document.getElementById(contenedorId);

    let divObj = document.createElement("div");
    divObj.classList.add("carta-bj");
    
    let innerObj = document.createElement("div");
    innerObj.classList.add("carta-inner");

    let frontObj = document.createElement("div");
    frontObj.classList.add("carta-front");
    let simbolo = carta.palo === "Corazones" ? "♥" : carta.palo === "Diamantes" ? "♦" : carta.palo === "Tréboles" ? "♣" : "♠";
    if (carta.palo === "Corazones" || carta.palo === "Diamantes") frontObj.classList.add("roja");
    frontObj.innerText = `${carta.valor} ${simbolo}`;

    let backObj = document.createElement("div");
    backObj.classList.add("carta-back");

    innerObj.appendChild(backObj);
    innerObj.appendChild(frontObj);
    divObj.appendChild(innerObj);
    
    if (oculta) divObj.id = "carta-oculta-crupier";

    contenedor.appendChild(divObj);
    playAudio(soundDeal);
    await delay(300);

    if (!oculta) {
        playAudio(soundFlip);
        divObj.classList.add("revelada");
        await delay(400);
    }
}

document.getElementById("btn-repartir").addEventListener("click", async () => {
    let inputApuesta = parseInt(document.getElementById("blackjack-bet").value);
    
    if (inputApuesta > getFichas()) {
        document.getElementById("blackjack-message").innerText = "¡No tienes suficientes fichas!";
        return;
    }

    apuestaActual = inputApuesta;
    setFichas(getFichas() - apuestaActual);

    crearBaraja();
    document.getElementById("cartas-jugador").innerHTML = "";
    document.getElementById("cartas-crupier").innerHTML = "";
    document.getElementById("blackjack-message").innerText = "Repartiendo...";
    document.getElementById("puntos-crupier").innerText = "0";
    puntosJugador = 0; puntosCrupier = 0;
    asesJugador = 0; asesCrupier = 0;
    cartaOcultaCrupier = null;

    document.getElementById("btn-repartir").disabled = true;
    document.getElementById("btn-pedir").disabled = true;
    document.getElementById("btn-plantarse").disabled = true;
    document.getElementById("blackjack-bet").disabled = true;

    await pedirCartaJugadorAsync();
    await pedirCartaCrupierAsync(false); 
    await pedirCartaJugadorAsync();
    await pedirCartaCrupierAsync(true);  

    document.getElementById("blackjack-message").innerText = "¿Qué deseas hacer?";

    if (puntosJugador === 21) {
        await turnoCrupierAI();
    } else {
        document.getElementById("btn-pedir").disabled = false;
        document.getElementById("btn-plantarse").disabled = false;
    }
});

async function pedirCartaJugadorAsync() {
    let carta = baraja.pop();
    if (carta.valor === "A") asesJugador += 1;
    puntosJugador += valorCarta(carta);
    const ajusteJugador = ajustarAses(puntosJugador, asesJugador);
    puntosJugador = ajusteJugador.puntos;
    asesJugador = ajusteJugador.ases;
    
    await renderizarCartaAnimada(carta, "cartas-jugador", false);
    document.getElementById("puntos-jugador").innerText = puntosJugador;

    if (puntosJugador > 21) {
        document.getElementById("btn-pedir").disabled = true;
        document.getElementById("btn-plantarse").disabled = true;
        await revelarCartaCrupierAsync();
        resolverJuego();
    }
}

document.getElementById("btn-pedir").addEventListener("click", async () => {
    document.getElementById("btn-pedir").disabled = true;
    document.getElementById("btn-plantarse").disabled = true;
    
    await pedirCartaJugadorAsync();
    
    if (puntosJugador <= 21) {
        document.getElementById("btn-pedir").disabled = false;
        document.getElementById("btn-plantarse").disabled = false;
    }
});

async function pedirCartaCrupierAsync(oculta) {
    let carta = baraja.pop();
    await renderizarCartaAnimada(carta, "cartas-crupier", oculta);
    
    if (oculta) {
        cartaOcultaCrupier = carta;
    } else {
        if (carta.valor === "A") asesCrupier += 1;
        puntosCrupier += valorCarta(carta);
        const ajusteCrupier = ajustarAses(puntosCrupier, asesCrupier);
        puntosCrupier = ajusteCrupier.puntos;
        asesCrupier = ajusteCrupier.ases;
        document.getElementById("puntos-crupier").innerText = puntosCrupier;
    }
}

async function revelarCartaCrupierAsync() {
    if (cartaOcultaCrupier) {
        let cartaDiv = document.getElementById("carta-oculta-crupier");
        if (cartaDiv) {
            playAudio(soundFlip);
            cartaDiv.classList.add("revelada");
            await delay(400);
        }
        
        if (cartaOcultaCrupier.valor === "A") asesCrupier += 1;
        puntosCrupier += valorCarta(cartaOcultaCrupier);
        const ajusteCrupier = ajustarAses(puntosCrupier, asesCrupier);
        puntosCrupier = ajusteCrupier.puntos;
        asesCrupier = ajusteCrupier.ases;
        document.getElementById("puntos-crupier").innerText = puntosCrupier;
        
        cartaOcultaCrupier = null; 
    }
}

document.getElementById("btn-plantarse").addEventListener("click", async () => {
    document.getElementById("btn-pedir").disabled = true;
    document.getElementById("btn-plantarse").disabled = true;
    await turnoCrupierAI();
});

async function turnoCrupierAI() {
    await revelarCartaCrupierAsync();
    
    while (puntosCrupier < puntosJugador && puntosCrupier < 21) {
        await delay(400);
        await pedirCartaCrupierAsync(false);
    }
    
    resolverJuego();
}

function resolverJuego() {
    let mensaje = "";
    let gano = false;

    if (puntosJugador > 21) {
        mensaje = "¡Te has pasado! Pierdes " + apuestaActual + " fichas.";
    } else if (puntosCrupier > 21) {
        let ganancia = apuestaActual * 2;
        mensaje = "¡El crupier se pasa! Ganas " + ganancia + " fichas.";
        gano = true;
        triggerBlackjackWinAnimation(ganancia);
    } else if (puntosCrupier > puntosJugador) {
        mensaje = "El Crupier te supera. Pierdes " + apuestaActual + " fichas.";
    } else if (puntosJugador > puntosCrupier) {
        let multiplicador = (puntosJugador === 21 && document.getElementById("cartas-jugador").children.length === 2) ? 2.5 : 2;
        let ganancia = Math.floor(apuestaActual * multiplicador);
        mensaje = "¡Ganaste " + ganancia + " fichas!";
        gano = true;
        triggerBlackjackWinAnimation(ganancia);
    } else {
        setFichas(getFichas() + apuestaActual);
        mensaje = "Empate. Recuperas tus fichas.";
    }
    
    if (gano) {
        playAudio(soundWin);
    }

    document.getElementById("blackjack-message").innerText = mensaje;
    document.getElementById("btn-repartir").disabled = false;
    document.getElementById("blackjack-bet").disabled = false;
}