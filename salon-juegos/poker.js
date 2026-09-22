(() => {
    "use strict";

    // ============================================================
    // PÓKER
    // ============================================================

    function initPoker() {
        // --------------------------------------------------------
        // ELEMENTOS DEL HTML
        // --------------------------------------------------------

        const pokerGame = document.getElementById("poker-game");
        const openPokerButton = document.getElementById("open-poker");
        const closePokerButton = document.getElementById("close-poker");

        const betInput = document.getElementById("poker-bet");
        const dealButton = document.getElementById("deal-poker");
        const drawButton = document.getElementById("draw-poker");
        const newButton = document.getElementById("new-poker");

        const handContainer = document.getElementById("poker-hand");
        const message = document.getElementById("poker-message");
        const chipsCount = document.getElementById("chips-count");

        const helpButton = document.getElementById("poker-help-button");
        const helpBox = document.getElementById("poker-help");

        // --------------------------------------------------------
        // COMPROBACIÓN
        // --------------------------------------------------------

        if (!pokerGame) {
            console.error("PÓKER: no existe #poker-game");
            return;
        }

        if (!openPokerButton) {
            console.error("PÓKER: no existe #open-poker");
            return;
        }

        // --------------------------------------------------------
        // ESTADO
        // --------------------------------------------------------

        let deck = [];
        let hand = [];
        let bet = 0;

        let roundActive = false;
        let drawAvailable = false;

        // Índices de las cartas seleccionadas.
        const selectedCards = new Set();

        // --------------------------------------------------------
        // CARTAS
        // --------------------------------------------------------

        const suits = ["♠", "♥", "♦", "♣"];

        const ranks = [
            { name: "2", value: 2 },
            { name: "3", value: 3 },
            { name: "4", value: 4 },
            { name: "5", value: 5 },
            { name: "6", value: 6 },
            { name: "7", value: 7 },
            { name: "8", value: 8 },
            { name: "9", value: 9 },
            { name: "10", value: 10 },
            { name: "J", value: 11 },
            { name: "Q", value: 12 },
            { name: "K", value: 13 },
            { name: "A", value: 14 }
        ];

        // ========================================================
        // UTILIDADES
        // ========================================================

        function setMessage(text) {
            if (message) {
                message.textContent = text;
            }
        }

        function setDisabled(element, disabled) {
            if (element) {
                element.disabled = disabled;
            }
        }

        // --------------------------------------------------------
        // FICHAS
        // --------------------------------------------------------

        function getChips() {
            if (!chipsCount) {
                return 0;
            }

            const text = chipsCount.textContent || "";

            const value = Number.parseInt(
                text.replace(/[^\d-]/g, ""),
                10
            );

            if (!Number.isFinite(value)) {
                return 0;
            }

            return Math.max(0, value);
        }

        function setChips(value) {
            if (!chipsCount) {
                return;
            }

            const finalValue = Math.max(
                0,
                Math.floor(value)
            );

            chipsCount.textContent = String(finalValue);
        }

        function changeChips(amount) {
            setChips(getChips() + amount);
        }

        // --------------------------------------------------------
        // APUESTA
        // --------------------------------------------------------

        function getBet() {
            if (!betInput) {
                return NaN;
            }

            const rawValue = String(
                betInput.value ?? ""
            ).trim();

            if (!rawValue) {
                return NaN;
            }

            const value = Number(rawValue);

            if (!Number.isFinite(value)) {
                return NaN;
            }

            return Math.floor(value);
        }

        // ========================================================
        // MAZO
        // ========================================================

        function createDeck() {
            const newDeck = [];

            for (const suit of suits) {
                for (const rank of ranks) {
                    newDeck.push({
                        suit: suit,
                        rank: rank.name,
                        value: rank.value
                    });
                }
            }

            return newDeck;
        }

        // Fisher-Yates.
        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(
                    Math.random() * (i + 1)
                );

                [array[i], array[j]] = [
                    array[j],
                    array[i]
                ];
            }

            return array;
        }

        // ========================================================
        // ABRIR PÓKER
        // ========================================================

        function openPoker() {
            console.log("PÓKER: abriendo...");

            const gamesGrid =
                document.querySelector(".games-grid");

            // Ocultar menú de juegos.
            if (gamesGrid) {
                gamesGrid.style.setProperty(
                    "display",
                    "none",
                    "important"
                );
            }

            // Ocultar los demás juegos.
            const otherGames = [
                "#slots-machine",
                "#dice-game",
                "#blackjack-game"
            ];

            otherGames.forEach(selector => {
                const game =
                    document.querySelector(selector);

                if (game) {
                    game.classList.remove("visible");
                    game.hidden = true;

                    game.style.setProperty(
                        "display",
                        "none",
                        "important"
                    );
                }
            });

            // Mostrar Póker.
            pokerGame.classList.add("visible");
            pokerGame.hidden = false;

            pokerGame.style.setProperty(
                "display",
                "block",
                "important"
            );

            // Reiniciar la partida sin tocar las fichas.
            resetPoker(false);

            console.log(
                "PÓKER: abierto correctamente"
            );
        }

        // ========================================================
        // CERRAR PÓKER
        // ========================================================

        function closePoker() {
            pokerGame.classList.remove("visible");
            pokerGame.hidden = true;

            pokerGame.style.setProperty(
                "display",
                "none",
                "important"
            );

            const gamesGrid =
                document.querySelector(".games-grid");

            if (gamesGrid) {
                gamesGrid.style.removeProperty(
                    "display"
                );
            }
        }

        // ========================================================
        // RESET
        // ========================================================

        function resetPoker(refundBet = true) {
            // Si hay una partida activa y todavía existe una apuesta,
            // devolverla antes de reiniciar.
            if (
                refundBet &&
                roundActive &&
                bet > 0
            ) {
                changeChips(bet);
            }

            deck = [];
            hand = [];
            bet = 0;

            roundActive = false;
            drawAvailable = false;

            selectedCards.clear();

            if (betInput) {
                betInput.value = 10;
                betInput.disabled = false;
            }

            setDisabled(
                dealButton,
                false
            );

            setDisabled(
                drawButton,
                true
            );

            setDisabled(
                newButton,
                false
            );

            if (handContainer) {
                handContainer.innerHTML = "";
            }

            pokerGame.classList.remove(
                "poker-win"
            );

            setMessage(
                "Haz tu apuesta y reparte 5 cartas."
            );
        }

        // ========================================================
        // REPARTIR CARTAS
        // ========================================================

        function dealPoker() {
            if (roundActive) {
                return;
            }

            const amount = getBet();
            const chips = getChips();

            // Apuesta incorrecta.
            if (
                !Number.isInteger(amount) ||
                amount <= 0
            ) {
                setMessage(
                    "Introduce una apuesta válida."
                );

                return;
            }

            // No hay suficientes fichas.
            if (amount > chips) {
                setMessage(
                    "No tienes suficientes fichas."
                );

                return;
            }

            // Crear mazo nuevo.
            deck = shuffle(
                createDeck()
            );

            // Repartir 5 cartas.
            hand = deck.splice(0, 5);

            // Seguridad.
            if (hand.length !== 5) {
                deck = [];
                hand = [];

                setMessage(
                    "Error al repartir las cartas."
                );

                return;
            }

            // Guardar apuesta.
            bet = amount;

            // Cobrar apuesta.
            changeChips(-bet);

            // Limpiar selección.
            selectedCards.clear();

            roundActive = true;
            drawAvailable = true;

            // Bloquear apuesta.
            if (betInput) {
                betInput.disabled = true;
            }

            setDisabled(
                dealButton,
                true
            );

            setDisabled(
                drawButton,
                false
            );

            setDisabled(
                newButton,
                false
            );

            setMessage(
                "Selecciona las cartas que quieras cambiar."
            );

            renderHand();
        }

        // ========================================================
        // RENDERIZAR MANO
        // ========================================================

        function renderHand() {
            if (!handContainer) {
                return;
            }

            handContainer.innerHTML = "";

            hand.forEach((card, index) => {
                const button =
                    document.createElement(
                        "button"
                    );

                button.type = "button";
                button.className = "poker-card";

                // Identificador de la carta.
                button.dataset.index =
                    String(index);

                const selected =
                    selectedCards.has(index);

                // Seleccionada.
                if (selected) {
                    button.classList.add(
                        "selected"
                    );
                }

                // Cartas rojas.
                if (
                    card.suit === "♥" ||
                    card.suit === "♦"
                ) {
                    button.classList.add(
                        "red"
                    );
                }

                // Accesibilidad.
                button.setAttribute(
                    "aria-pressed",
                    String(selected)
                );

                button.setAttribute(
                    "aria-label",
                    `${card.rank} de ${getSuitName(card.suit)}${
                        selected
                            ? ", seleccionada"
                            : ""
                    }`
                );

                // ----------------------------------------------
                // Estructura visual
                // ----------------------------------------------

                const inner =
                    document.createElement(
                        "span"
                    );

                inner.className =
                    "poker-card-inner";

                const face =
                    document.createElement(
                        "span"
                    );

                face.className =
                    "poker-card-face";

                const rankElement =
                    document.createElement(
                        "span"
                    );

                rankElement.className =
                    "poker-card-rank";

                rankElement.textContent =
                    card.rank;

                const suitElement =
                    document.createElement(
                        "span"
                    );

                suitElement.className =
                    "poker-card-suit";

                suitElement.textContent =
                    card.suit;

                face.append(
                    rankElement,
                    suitElement
                );

                inner.appendChild(
                    face
                );

                button.appendChild(
                    inner
                );

                // ----------------------------------------------
                // CLICK DE CARTA
                // ----------------------------------------------

                button.addEventListener(
                    "click",
                    () => {
                        toggleCardSelection(
                            index
                        );
                    }
                );

                handContainer.appendChild(
                    button
                );
            });
        }

        // ========================================================
        // NOMBRE DEL PALO
        // ========================================================

        function getSuitName(suit) {
            const names = {
                "♠": "picas",
                "♥": "corazones",
                "♦": "diamantes",
                "♣": "tréboles"
            };

            return (
                names[suit] ||
                "palo desconocido"
            );
        }

        // ========================================================
        // SELECCIONAR / DESELECCIONAR CARTA
        // ========================================================

        function toggleCardSelection(index) {
            // No se puede seleccionar fuera de la fase
            // de descarte.
            if (!drawAvailable) {
                return;
            }

            if (!Number.isInteger(index)) {
                return;
            }

            if (
                index < 0 ||
                index >= hand.length
            ) {
                return;
            }

            // ----------------------------------------------------
            // CAMBIAMOS SOLAMENTE LA CARTA EXISTENTE.
            //
            // NO llamamos a renderHand().
            //
            // Esto evita que las 5 cartas se destruyan y vuelvan
            // a crearse cada vez que haces click.
            // ----------------------------------------------------

            if (
                selectedCards.has(index)
            ) {
                selectedCards.delete(index);
            } else {
                selectedCards.add(index);
            }

            const cardElement =
                handContainer.querySelector(
                    `.poker-card[data-index="${index}"]`
                );

            if (!cardElement) {
                return;
            }

            const selected =
                selectedCards.has(index);

            cardElement.classList.toggle(
                "selected",
                selected
            );

            cardElement.setAttribute(
                "aria-pressed",
                String(selected)
            );

            cardElement.setAttribute(
                "aria-label",
                `${hand[index].rank} de ${getSuitName(
                    hand[index].suit
                )}${
                    selected
                        ? ", seleccionada"
                        : ""
                }`
            );
        }

        // ========================================================
        // CAMBIAR CARTAS
        // ========================================================

        function drawCards() {
            if (
                !roundActive ||
                !drawAvailable
            ) {
                return;
            }

            // Cambiar únicamente las cartas seleccionadas.
            for (
                const index of selectedCards
            ) {
                if (deck.length === 0) {
                    break;
                }

                if (
                    index >= 0 &&
                    index < hand.length
                ) {
                    hand[index] =
                        deck.shift();
                }
            }

            selectedCards.clear();

            // Ya no se puede volver a cambiar cartas.
            drawAvailable = false;

            setDisabled(
                drawButton,
                true
            );

            // Aquí SÍ renderizamos porque las cartas
            // realmente han cambiado.
            renderHand();

            finishRound();
        }

        // ========================================================
        // EVALUAR MANO
        // ========================================================

        function evaluateHand(cards) {
            if (
                !Array.isArray(cards) ||
                cards.length !== 5
            ) {
                return {
                    name: "Mano inválida",
                    multiplier: 0
                };
            }

            // Valores ordenados.
            const values = cards
                .map(card => card.value)
                .sort(
                    (a, b) => a - b
                );

            // Cuántas veces aparece cada valor.
            const counts = {};

            for (
                const value of values
            ) {
                counts[value] =
                    (counts[value] || 0) + 1;
            }

            const countValues =
                Object.values(counts)
                    .sort(
                        (a, b) => b - a
                    );

            // ----------------------------------------------------
            // COLOR
            // ----------------------------------------------------

            const flush =
                cards.every(
                    card =>
                        card.suit ===
                        cards[0].suit
                );

            // ----------------------------------------------------
            // ESCALERA
            // ----------------------------------------------------

            const uniqueValues =
                [...new Set(values)];

            let straight = false;

            if (
                uniqueValues.length === 5
            ) {
                // Escalera normal:
                // 2-3-4-5-6, 7-8-9-10-J, etc.
                const normalStraight =
                    uniqueValues.every(
                        (value, index) =>
                            index === 0 ||
                            value ===
                                uniqueValues[
                                    index - 1
                                ] + 1
                    );

                // Escalera A-2-3-4-5.
                const aceLow =
                    uniqueValues[0] === 2 &&
                    uniqueValues[1] === 3 &&
                    uniqueValues[2] === 4 &&
                    uniqueValues[3] === 5 &&
                    uniqueValues[4] === 14;

                straight =
                    normalStraight ||
                    aceLow;
            }

            // ----------------------------------------------------
            // ESCALERA REAL
            // ----------------------------------------------------

            const royal =
                flush &&
                values[0] === 10 &&
                values[1] === 11 &&
                values[2] === 12 &&
                values[3] === 13 &&
                values[4] === 14;

            if (royal) {
                return {
                    name: "Escalera real",
                    multiplier: 250
                };
            }

            // ----------------------------------------------------
            // ESCALERA DE COLOR
            // ----------------------------------------------------

            if (
                straight &&
                flush
            ) {
                return {
                    name: "Escalera de color",
                    multiplier: 50
                };
            }

            // ----------------------------------------------------
            // PÓKER
            // ----------------------------------------------------

            if (
                countValues[0] === 4
            ) {
                return {
                    name: "Póker",
                    multiplier: 25
                };
            }

            // ----------------------------------------------------
            // FULL
            // ----------------------------------------------------

            if (
                countValues[0] === 3 &&
                countValues[1] === 2
            ) {
                return {
                    name: "Full",
                    multiplier: 9
                };
            }

            // ----------------------------------------------------
            // COLOR
            // ----------------------------------------------------

            if (flush) {
                return {
                    name: "Color",
                    multiplier: 6
                };
            }

            // ----------------------------------------------------
            // ESCALERA
            // ----------------------------------------------------

            if (straight) {
                return {
                    name: "Escalera",
                    multiplier: 4
                };
            }

            // ----------------------------------------------------
            // TRÍO
            // ----------------------------------------------------

            if (
                countValues[0] === 3
            ) {
                return {
                    name: "Trío",
                    multiplier: 3
                };
            }

            // ----------------------------------------------------
            // DOBLE PAREJA
            // ----------------------------------------------------

            if (
                countValues[0] === 2 &&
                countValues[1] === 2
            ) {
                return {
                    name: "Doble pareja",
                    multiplier: 2
                };
            }

            // ----------------------------------------------------
            // PAREJA
            //
            // IMPORTANTE:
            // CUALQUIER pareja paga x1.
            //
            // 2-2  -> x1
            // 5-5  -> x1
            // 8-8  -> x1
            // 10-10 -> x1
            // J-J  -> x1
            // Q-Q  -> x1
            // K-K  -> x1
            // A-A  -> x1
            // ----------------------------------------------------

            if (
                countValues[0] === 2
            ) {
                return {
                    name: "Pareja",
                    multiplier: 1
                };
            }

            // ----------------------------------------------------
            // NADA
            // ----------------------------------------------------

            return {
                name: "Sin combinación",
                multiplier: 0
            };
        }

        // ========================================================
        // FINAL DE RONDA
        // ========================================================

        function finishRound() {
            if (!roundActive) {
                return;
            }

            const result =
                evaluateHand(hand);

            // ----------------------------------------------------
            // PREMIO
            // ----------------------------------------------------

            if (
                result.multiplier > 0
            ) {
                const winnings =
                    bet *
                    result.multiplier;

                // La apuesta ya fue retirada al repartir.
                // Aquí añadimos el premio.
                changeChips(
                    winnings
                );

                setMessage(
                    `${result.name} · Has ganado ${winnings} fichas.`
                );

                pokerGame.classList.add(
                    "poker-win"
                );
            } else {
                // Si no hay combinación,
                // la apuesta no vuelve.
                setMessage(
                    `${result.name} · Has perdido ${bet} fichas.`
                );

                pokerGame.classList.remove(
                    "poker-win"
                );
            }

            // La ronda termina.
            // Ponemos bet a 0 para que no se pueda
            // devolver otra vez por accidente.
            bet = 0;

            roundActive = false;
            drawAvailable = false;

            if (betInput) {
                betInput.disabled = false;
            }

            setDisabled(
                drawButton,
                true
            );

            setDisabled(
                dealButton,
                false
            );

            setDisabled(
                newButton,
                false
            );
        }

        // ========================================================
        // NUEVA PARTIDA
        // ========================================================

        function newPokerRound() {
            resetPoker(true);
        }

        // ========================================================
        // EVENTO ABRIR
        // ========================================================

        /*
         * Delegación de eventos:
         * aunque otro script manipule la cuadrícula,
         * este evento sigue funcionando.
         */
        document.addEventListener(
            "click",
            event => {
                const target =
                    event.target.closest(
                        "#open-poker"
                    );

                if (!target) {
                    return;
                }

                event.preventDefault();

                openPoker();
            }
        );

        // ========================================================
        // EVENTO CERRAR
        // ========================================================

        if (closePokerButton) {
            closePokerButton.addEventListener(
                "click",
                event => {
                    event.preventDefault();

                    closePoker();
                }
            );
        }

        // ========================================================
        // EVENTO REPARTIR
        // ========================================================

        if (dealButton) {
            dealButton.addEventListener(
                "click",
                dealPoker
            );
        }

        // ========================================================
        // EVENTO CAMBIAR
        // ========================================================

        if (drawButton) {
            drawButton.addEventListener(
                "click",
                drawCards
            );
        }

        // ========================================================
        // EVENTO NUEVA PARTIDA
        // ========================================================

        if (newButton) {
            newButton.addEventListener(
                "click",
                newPokerRound
            );
        }

        // ========================================================
        // AYUDA
        // ========================================================

        if (
            helpButton &&
            helpBox
        ) {
            helpButton.setAttribute(
                "aria-expanded",
                "false"
            );

            helpButton.addEventListener(
                "click",
                () => {
                    const visible =
                        helpBox.classList.toggle(
                            "visible"
                        );

                    helpButton.setAttribute(
                        "aria-expanded",
                        String(visible)
                    );
                }
            );
        }

        // ========================================================
        // INICIO
        // ========================================================

        resetPoker(false);

        console.log(
            "PÓKER: JavaScript cargado correctamente."
        );
    }

    // ============================================================
    // ARRANQUE SEGURO
    // ============================================================

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initPoker
        );
    } else {
        initPoker();
    }
})();

