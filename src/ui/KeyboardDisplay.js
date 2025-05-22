// ui/KeyboardDisplay.js
// en el teclado visual, e integra guías, línea de explosión y manos

import BasicKeyboard from "./BasicKeyboard.js";
import GuidesLayer from "./GuidesLayer.js";
import ExplosionLineLayer from "./ExplosionLineLayer.js";
import HandsLayer from "./HandsLayer.js";
import { getKeysForChar } from "./utils/keyMappings.js";

export default class KeyboardDisplay {
    constructor(scene, { x = 0, y = 0 } = {}) {
        // 1. Validación inicial
        if (!scene || !scene.add) throw new Error("Se requiere una escena Phaser válida");

        // 2. Configuración básica
        this.scene = scene;
        this.container = scene.add.container(x, y);
        // this.keyboard = new BasicKeyboard(scene);
        this.lastKeys = [];
        this.settings = {
            guides: true,
            explosionLine: true,
            hands: true
        };

        // 3. Inicialización de capas (con validación)
        try {
            this.keyboard = new BasicKeyboard(scene);
            this.keyboard.draw([]);

            this.guides = new GuidesLayer(scene, this);
            this.explosionLine = new ExplosionLineLayer(scene, this);
            this.hands = new HandsLayer(scene, this);

            // 4. Verificación de contenedores
            const layers = [
                this.keyboard.getContainer(),
                this.guides.container,
                this.explosionLine.container,
                this.hands.container
            ].filter(Boolean);

            if (layers.length !== 4) {
                console.warn("Algunas capas no se inicializaron correctamente");
            }

            this.container.add(layers);
        } catch (error) {
            console.error("Error al inicializar capas:", error);
            throw error;
        }

        // 5. Configuración de controles UI
        this.setupControls();
    }

    // === Métodos Públicos ===
    draw(input, options = {}) {
        const processed = this.processInput(input, options);
        
        if (Array.isArray(processed)) {
            // Caso de múltiples grupos
            processed.forEach(group => {
                this.keyboard.draw(group.keys, {
                    color: group.color,
                    blink: group.blink
                });
            });
        } else {
            // Caso simple
            this.keyboard.draw(processed.keys, {
                color: processed.color,
                blink: processed.blink
            });
        }

        // Actualizar capas adicionales
        if (this.settings.guides) this.guides.draw(processed.keys);
        if (this.settings.hands) this.hands.draw();
    }

    clear() {
        this.keyboard.clear();
        this.guides.clear();
        this.explosionLine.clear();
        this.hands.clear();
        this.lastKeys = [];
    }

    // === Métodos Privados ===
    setupControls() {
        const kbBounds = this.keyboard.getContainer().getBounds();
        const posX = kbBounds.x + kbBounds.width / 2 + 10;
        let offsetY = kbBounds.y;
        const buttonStyle = {
            fontSize: "12px",
            fontFamily: "Arial",
            backgroundColor: "#222",
            color: "#fff",
            padding: { x: 8, y: 4 }
        };

        // Botón Guías
        this.btnGuides = this.scene.add.text(
            posX,
            offsetY,
            `👆 Guías ${this.settings.guides ? "ON" : "OFF"}`,
            buttonStyle
        )
        .setInteractive()
        .on("pointerdown", () => this.toggleSetting("guides"));

        offsetY += 30;

        // Botón Línea Explosión
        this.btnExplosion = this.scene.add.text(
            posX,
            offsetY,
            `💥 Línea ${this.settings.explosionLine ? "ON" : "OFF"}`,
            buttonStyle
        )
        .setInteractive()
        .on("pointerdown", () => this.toggleSetting("explosionLine"));

        offsetY += 30;

        // Botón Manos
        this.btnHands = this.scene.add.text(
            posX,
            offsetY,
            `✋ Manos ${this.settings.hands ? "ON" : "OFF"}`,
            buttonStyle
        )
        .setInteractive()
        .on("pointerdown", () => this.toggleSetting("hands"));
    }

    toggleSetting(setting) {
        this.settings[setting] = !this.settings[setting];
        localStorage.setItem(`keyboard_${setting}`, this.settings[setting]);

            // Actualizar la capa correspondiente directamente
    switch(setting) {
        case 'guides':
            this.guides.setVisible(this.settings.guides);
            break;
        case 'explosionLine':
            this.explosionLine.setVisible(this.settings.explosionLine);
            break;
        case 'hands':
            this.hands.setVisible(this.settings.hands);
            break;
    }

        this.updateButton(setting);
        this.draw(this.lastKeys); // Redibuja con la nueva configuración
    }

    updateButton(setting) {
        const button = {
            guides: this.btnGuides,
            explosionLine: this.btnExplosion,
            hands: this.btnHands
        }[setting];

        const icon = {
            guides: "👆",
            explosionLine: "💥",
            hands: "✋"
        }[setting];

        if (button) {
            button.setText(`${icon} ${setting} ${this.settings[setting] ? "ON" : "OFF"}`);
            button.setBackgroundColor(this.settings[setting] ? "#333" : "#555");
        }
    }

    processInput(input, options = {}) {
        const defaultColors = {
            primary: 0xFF9900,  // Naranja
            secondary: 0x00AAFF  // Azul
        };
        
        // Merge con opciones personalizadas
        const colors = { ...defaultColors, ...options.colors };

        // Caso 1: String individual
        if (typeof input === "string") {
            return {
                keys: getKeysForChar(input),
                color: colors.primary
            };
        }
        
        // Caso 2: Array simple
        if (Array.isArray(input) && !input.some(Array.isArray)) {
            return {
                keys: input.flatMap(getKeysForChar),
                color: colors.primary
            };
        }
        
        // Caso 3: Array de grupos (para colores distintos)
        if (Array.isArray(input) && input.length === 2 && 
            Array.isArray(input[0]) && Array.isArray(input[1])) {
            return [
                {
                    keys: input[0].flatMap(getKeysForChar),
                    color: colors.primary
                },
                {
                    keys: input[1].flatMap(getKeysForChar),
                    color: colors.secondary
                }
            ];
        }
        
        // Caso 4: Objeto configurable
        if (typeof input === 'object' && !Array.isArray(input)) {
            return {
                keys: getKeysForChar(input.char),
                color: input.color || colors.primary,
                blink: input.blink || false
            };
        }

        return {
            keys: [],
            color: colors.primary
        };
    }

    getContainer() {
        return this.container; // Añade este método si no existe
    }

    getKeyPosition(key) {
      if (!this.keyboard || typeof this.keyboard.getKeyPosition !== 'function') {
          throw new Error('BasicKeyboard no está inicializado correctamente');
      }
      return this.keyboard.getKeyPosition(key);
    }

    // Asegúrate de exponer TODOS los métodos necesarios
    getKeyPositions() {
        return this.keyboard.getKeyPositions();
    }

}