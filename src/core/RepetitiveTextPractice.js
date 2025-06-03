// core/RepetitiveTextPractice.js

import KeyboardDisplay from '../ui/KeyboardDisplay.js';
import ScoreManager from './scoreManager.js';

/**
 * @file Clase para gestionar la práctica de mecanografía de texto repetitivo.
 * Controla el dibujo del texto, el cursor, la interacción del teclado y la puntuación.
 */

export default class RepetitiveTextPractice {
    /**
     * Crea una instancia de RepetitiveTextPractice.
     * @param {Phaser.Scene} scene La escena de Phaser donde se dibujará la práctica.
     * @param {string} textContent El texto completo a practicar, incluyendo caracteres especiales como '\n' (saltos de línea) y múltiples espacios.
     * @param {KeyboardDisplay} keyboardDisplay La instancia del teclado visual para resaltar teclas.
     * @param {ScoreManager} scoreManager La instancia del gestor de puntuación para registrar aciertos y errores.
     * @param {number} maxMisses El número máximo de errores permitidos antes de que la práctica termine.
     * @param {function(boolean):void} onCompleteCallback Callback que se invoca cuando la práctica termina (true para éxito, false para fallo).
     */
    constructor(scene, textContent, keyboardDisplay, scoreManager, maxMisses, onCompleteCallback) {
        /** @type {Phaser.Scene} */
        this.scene = scene;
        /** @type {string} */
        this.textContent = textContent;
        /** @type {KeyboardDisplay} */
        this.keyboardDisplay = keyboardDisplay;
        /** @type {ScoreManager} */
        this.scoreManager = scoreManager;
        /** @type {number} */
        this.maxMisses = maxMisses;
        /** @type {function(boolean):void} */
        this.onCompleteCallback = onCompleteCallback;

        /** @type {Phaser.GameObjects.Text[]} */
        this.letterObjects = []; // Objetos Phaser.Text para cada letra o espacio visible
        /** @type {Phaser.GameObjects.Rectangle|null} */
        this.cursor = null;
        /**
         * @type {number} Índice único.
         */
        this.currentIndex = 0;

        /** @type {string} */
        this.correctColor = "#00ff00";
        /** @type {string} */
        this.incorrectColor = "#ff4444";
        /** @type {string} */
        this.defaultColor = "#ffffff";

        this._setupTextDisplay();
        this._setupCursor();
        this._setupKeyboardInput();

        // Resaltar la primera tecla en el teclado visual
        this._highlightCurrentKey();
    }

    /**
     * Configura y dibuja el texto de la práctica en la escena.
     * Crea los objetos Phaser.GameObjects.Text para cada letra y espacio visible.
     * @private
     */
    _setupTextDisplay() {
        const keyboardWidth = 720;
        const textBoxWidth = keyboardWidth + 60;
        const startX = (this.scene.scale.width - textBoxWidth) / 2;
        const startY = this.scene.scale.height * 0.2;
        const lineSpacing = 40;

        const style = {
            fontSize: "24px",
            fontFamily: "monospace",
            color: this.defaultColor,
        };

        let currentX = startX;
        let currentY = startY;
        let lineStartTextIndex = 0; // Para rastrear el inicio de la línea en textContent

        // Iterar sobre el texto completo para crear objetos de letra
        for (let i = 0; i < this.textContent.length; i++) {
            const char = this.textContent[i];

            if (char === '\n') {
                // Si encontramos un salto de línea, avanzamos a la siguiente línea visualmente
                currentY += lineSpacing;
                currentX = startX; // Reiniciar X para la nueva línea
                lineStartTextIndex = i + 1; // La próxima línea de texto comienza después del '\n'
            } else {
                // Es un carácter visible (letra o espacio)
                const letterObj = this.scene.add.text(currentX, currentY, char, style);
                this.letterObjects.push(letterObj); // Solo agregamos objetos para caracteres visibles
                currentX += letterObj.width;
            }
        }
    }

    /**
     * Configura y posiciona el cursor visual debajo de la primera letra.
     * @private
     */
    _setupCursor() {
        const firstLetter = this.letterObjects[0];
        if (firstLetter) {
            this.cursor = this.scene.add
                .rectangle(
                    firstLetter.x,
                    firstLetter.y + firstLetter.height - 2, // Ajusta la posición Y del cursor debajo de la letra
                    firstLetter.width,
                    2,
                    0xffffff
                )
                .setOrigin(0, 0);
            this.scene.tweens.add({
                targets: this.cursor,
                alpha: 0,
                duration: 500,
                yoyo: true,
                repeat: -1,
            });
        }
    }

    /**
     * Configura el listener para los eventos de teclado de la escena.
     * @private
     */
    _setupKeyboardInput() {
        this.scene.input.keyboard.on("keydown", this._handleKey, this);
    }

    /**
     * Resalta la tecla esperada en el teclado virtual (`KeyboardDisplay`).
     * Maneja caracteres normales, espacios y saltos de línea (Enter).
     * @private
     */
    _highlightCurrentKey() {
        if (this.currentIndex >= this.letterObjects.length) {
            this.keyboardDisplay.draw([]); // Limpiar resaltado si el texto ha terminado
            return;
        }
        const charToHighlight = this.letterObjects[this.currentIndex].text; // Obtenemos el texto del objeto visual

        if (charToHighlight === undefined) { // No debería pasar si el currentIndex está bien
            this.keyboardDisplay.draw([]);
            return;
        }

        if (charToHighlight === ' ') { // Si el carácter esperado es un espacio, resaltamos 'Espacio'
            this.keyboardDisplay.draw(' ');
        } else { // Para letras, números, símbolos...
            this.keyboardDisplay.draw(charToHighlight);
        }
        // Nota: La tecla 'Enter' se manejará cuando _setupTextDisplay no genere letterObjects para '\n',
        // y _handleKey detecte el final de la línea como un evento especial, si se desea esa interacción.
        // Si no, el Enter solo es para avanzar de párrafo/bloque si el texto de ContenidoNivel tiene \n\n.
        // Por ahora, con un solo índice, el Enter no es un caracter que se 'espera' en letterObjects.
        // Lo trataremos como un caracter de control para avance de bloque si es el final.
    }


    /**
     * Maneja el evento 'keydown' del teclado.
     * Valida la tecla presionada contra la esperada y actualiza el estado del juego.
     * @param {KeyboardEvent} event El evento de teclado.
     * @private
     */
    _handleKey(event) {
        if (["Shift", "Alt", "Dead", "Control", "Meta", "CapsLock"].includes(event.key)) return;

        const keyPressed = event.key;

        // Si hemos llegado al final del texto visible
        if (this.currentIndex >= this.letterObjects.length) {
            // Aquí podemos manejar Enter para avanzar de nivel/pantalla final
            if (keyPressed === "Enter") {
                this.onCompleteCallback(true); // Asumir éxito al presionar Enter al final
                this.destroy();
            }
            return;
        }

        const expectedLetterObj = this.letterObjects[this.currentIndex];
        const expectedChar = expectedLetterObj.text; // Obtenemos el carácter esperado del objeto visual

        let isCorrect = false;

        if (keyPressed === expectedChar) {
            isCorrect = true;
        }

        if (isCorrect) {
            this.scoreManager.addSuccess();
            expectedLetterObj.setColor(this.correctColor); // Coloreamos la letra
            this.currentIndex++; // Solo un índice para avanzar
            this._moveCursor();
            this._highlightCurrentKey();
        } else {
            this._handleIncorrectKey(expectedLetterObj); // Pasamos el objeto para colorear
        }

        this._checkCompletion();
    }

    /**
     * Avanza `currentTextIndex` y `currentLetterObjectIndex` tras un acierto.
     * Sincroniza la posición del cursor y el resaltado del teclado.
     * @private
     */
    // _advanceIndices() {
    //     const charJustProcessed = this.textContent[this.currentTextIndex];

    //     // 1. Avanzar el índice en el texto completo
    //     this.currentTextIndex++;

    //     // 2. Avanzar el índice en los objetos visuales (solo si el carácter que se acaba de procesar era visible)
    //     if (charJustProcessed !== '\n') { // Si NO era un salto de línea, significa que tenía un letterObject asociado
    //         this.currentLetterObjectIndex++;
    //     }

    //     // 3. Saltar automáticamente los caracteres NO VISIBLES que vienen a continuación
    //     //    (Es decir, saltos de línea que no requieren 'Enter' y espacios extra entre grupos de palabras)
    //     while (this.currentTextIndex < this.textContent.length) {
    //         const nextChar = this.textContent[this.currentTextIndex];
    //         if (nextChar === '\n') { // Saltar saltos de línea
    //             this.currentTextIndex++;
    //         } else if (nextChar === ' ' && this.textContent[this.currentTextIndex - 1] === ' ') {
    //             // Saltar espacios extra si el anterior también fue un espacio (doble espacio entre grupos)
    //             this.currentTextIndex++;
    //             this.currentLetterObjectIndex++; // Avanzar el índice visual para el espacio extra
    //         } else {
    //             break; // El próximo carácter es visible y no un espacio extra
    //         }
    //     }

    //     // 4. Actualizar la posición del cursor visual y el resaltado del teclado
    //     this._moveCursor();
    //     this._highlightCurrentKey();
    // }

    /**
     * Mueve el cursor visual (`this.cursor`) a la posición de la próxima letra esperada.
     * @private
     */
    _moveCursor() {
        if (this.currentIndex >= this.letterObjects.length) {
            this.cursor?.setVisible(false);
            return;
        }

        const nextLetterObj = this.letterObjects[this.currentIndex];
        if (nextLetterObj && this.cursor) {
            this.cursor.setVisible(true);
            this.cursor.setPosition(nextLetterObj.x, nextLetterObj.y + nextLetterObj.height - 2);
            this.cursor.width = nextLetterObj.width;
        } else {
            this.cursor?.setVisible(false);
        }
    }

    /**
     * Maneja la pulsación de una tecla incorrecta.
     * Reproduce un sonido de error, registra el fallo y colorea la letra de rojo temporalmente.
     * @private
     */
    _handleIncorrectKey(letterObjToColor) { // Recibe el objeto a colorear
        const isSoundEnabled = JSON.parse(localStorage.getItem("soundEnabled") ?? "true");
        if (isSoundEnabled && this.scene.sound?.get("error")) {
            this.scene.sound.play("error");
        }

        if (letterObjToColor && letterObjToColor.text !== ' ') {
            letterObjToColor.setColor(this.incorrectColor);
            this.scene.tweens.add({
                targets: letterObjToColor,
                color: this.defaultColor,
                duration: 300,
                delay: 200,
                ease: 'Power1',
                onComplete: () => {
                    if (letterObjToColor.color !== this.correctColor) {
                        letterObjToColor.setColor(this.defaultColor);
                    }
                }
            });
        }
        this._highlightCurrentKey();
        this.scoreManager.addMiss();
    }

    /**
     * Comprueba si la práctica ha terminado, ya sea por completar el texto
     * o por exceder el número máximo de errores.
     * Notifica a la escena a través del callback `onCompleteCallback`.
     * @param {boolean} [hadError=false] Indica si la comprobación se disparó por un error.
     * @private
     */
    _checkCompletion(hadError = false) {
        if (this.scoreManager.misses >= this.maxMisses) {
            console.log("💀 Práctica terminada: Demasiados errores.");
            this.onCompleteCallback(false);
            this.destroy();
            return;
        }

        // Si el índice ha llegado al final de los objetos visuales, la práctica está completa.
        if (this.currentIndex >= this.letterObjects.length) {
            console.log("✅ Práctica de texto completada con éxito.");
            this.onCompleteCallback(true);
            this.destroy();
        }
    }

    /**
     * Destruye todos los objetos de display y limpia los listeners de la clase.
     * Esto debe ser llamado cuando la práctica ya no es necesaria.
     */
    destroy() {
        this.letterObjects.forEach(obj => obj.destroy());
        this.letterObjects = [];
        this.cursor?.destroy();
        this.cursor = null;

        // Es crucial remover el listener de teclado con los mismos argumentos que se añadió
        this.scene.input.keyboard.off("keydown", this._handleKey, this);

        // Limpiar resaltado del teclado (solo las teclas, los botones de UI se mantienen)
        this.keyboardDisplay.draw([]);
    }
}