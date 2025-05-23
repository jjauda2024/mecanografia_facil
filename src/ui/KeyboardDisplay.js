// ui/KeyboardDisplay.js

import BasicKeyboard from "./BasicKeyboard.js";
import GuidesLayer from "./GuidesLayer.js";
import ExplosionLineLayer from "./ExplosionLineLayer.js";
import HandsLayer from "./HandsLayer.js";
import { getKeysForChar } from "./utils/keyMappings.js";

export default class KeyboardDisplay {
    constructor(scene, { x = 0, y = 0, initialSettings = {} } = {}) {
        if (!scene || !scene.add) throw new Error("Se requiere una escena Phaser válida");

        this.scene = scene;
        this.container = scene.add.container(x, y);
        this.lastKeys = [];
        this.settings = {
            guides: true,
            explosionLine: true,
            hands: true,
            ...initialSettings
        };

        try {
            this.keyboard = new BasicKeyboard(scene);
            this.keyboard.draw([]);

            this.guides = new GuidesLayer(scene, this);
            this.explosionLine = new ExplosionLineLayer(scene, this);
            this.hands = new HandsLayer(scene, this);

            this.guides.setVisible(this.settings.guides);
            this.explosionLine.setVisible(this.settings.explosionLine);
            this.hands.setVisible(this.settings.hands);

            const layers = [
                this.keyboard.getContainer(),
                this.guides.container,
                this.explosionLine.container,
                this.hands.container
            ].filter(Boolean);

            if (layers.length !== 4) {
                console.warn("Algunas capas no se inicializaron correctamente en KeyboardDisplay");
            }

            this.container.add(layers);

        } catch (error) {
            console.error("Error al inicializar capas en KeyboardDisplay:", error);
            throw error;
        }

        this.createControlsUI();
        this.updateControlsPosition();
    }

    // === Métodos Públicos ===
    draw(input, options = {}) {
        const processed = this.processInput(input, options);
        let allKeysForGuides = []; 
        let groupsForBasicKeyboard = []; // <-- NUEVO: Para pasar a BasicKeyboard

        if (Array.isArray(processed)) {
            // Caso de múltiples grupos (ej: nuevas y aprendidas)
            processed.forEach(group => {
                groupsForBasicKeyboard.push(group); // Añade el grupo completo
                allKeysForGuides = allKeysForGuides.concat(group.keys);
            });
        } else {
            // Caso simple (string, array simple, objeto configurable)
            groupsForBasicKeyboard.push(processed); // Añade el grupo simple
            allKeysForGuides = processed.keys;
        }

        // ¡CORRECCIÓN CLAVE! Llama a BasicKeyboard.draw UNA SOLA VEZ con todos los grupos
        this.keyboard.draw(groupsForBasicKeyboard); 

        // Actualizar capas adicionales
        if (this.settings.guides) this.guides.draw(allKeysForGuides);
        if (this.settings.hands) this.hands.draw();

        this.updateControlsPosition();
    }

    clear() {
        this.keyboard.clear();
        this.guides.clear();
        this.explosionLine.clear();
        this.hands.clear();
        this.lastKeys = [];
    }

    setPosition(x, y) {
        this.container.setPosition(x, y);
        this.updateControlsPosition();
    }

    createControlsUI() {
        const buttonStyle = {
            fontSize: "12px",
            fontFamily: "Arial",
            backgroundColor: "#222",
            color: "#fff",
            padding: { x: 8, y: 4 }
        };

        this.btnGuides = this.scene.add.text(0, 0, `👆 Guías ${this.settings.guides ? "ON" : "OFF"}`, buttonStyle)
            .setInteractive()
            .setOrigin(0, 0.5)
            .on("pointerdown", () => this.toggleSetting("guides"));

        this.btnExplosion = this.scene.add.text(0, 0, `💥 Línea ${this.settings.explosionLine ? "ON" : "OFF"}`, buttonStyle)
            .setInteractive()
            .setOrigin(0, 0.5)
            .on("pointerdown", () => this.toggleSetting("explosionLine"));

        this.btnHands = this.scene.add.text(0, 0, `✋ Manos ${this.settings.hands ? "ON" : "OFF"}`, buttonStyle)
            .setInteractive()
            .setOrigin(0, 0.5)
            .on("pointerdown", () => this.toggleSetting("hands"));
    }

    updateControlsPosition() {
        const kbBounds = this.container.getBounds(); 
        const posX = kbBounds.x + kbBounds.width + 50; 
        let offsetY = kbBounds.y;

        if (this.btnGuides) {
            this.btnGuides.setPosition(posX, offsetY);
            offsetY += 30; 
        }
        if (this.btnExplosion) {
            this.btnExplosion.setPosition(posX, offsetY);
            offsetY += 30;
        }
        if (this.btnHands) {
            this.btnHands.setPosition(posX, offsetY);
        }
    }

    toggleSetting(setting) {
        this.settings[setting] = !this.settings[setting];
        localStorage.setItem(`keyboard_${setting}`, this.settings[setting]);

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
        this.draw(this.lastKeys);
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
            primary: 0xFF9900,
            secondary: 0x00AAFF
        };
        const colors = { ...defaultColors, ...options.colors };

        if (typeof input === "string") {
            return { keys: getKeysForChar(input), color: colors.primary };
        }
        if (Array.isArray(input) && !input.some(Array.isArray)) {
            return { keys: input.flatMap(getKeysForChar), color: colors.primary };
        }
        if (Array.isArray(input) && input.length === 2 && Array.isArray(input[0]) && Array.isArray(input[1])) {
            return [
                { keys: input[0].flatMap(getKeysForChar), color: colors.primary },
                { keys: input[1].flatMap(getKeysForChar), color: colors.secondary },
            ];
        }
        if (typeof input === 'object' && !Array.isArray(input)) {
            return {
                keys: getKeysForChar(input.char),
                color: input.color || colors.primary,
                blink: input.blink || false
            };
        }
        return { keys: [], color: colors.primary };
    }

    getContainer() { return this.container; }

    getKeyPosition(key) {
      if (!this.keyboard || typeof this.keyboard.getKeyPosition !== 'function') {
          throw new Error('BasicKeyboard no está inicializado correctamente en KeyboardDisplay');
      }
      return this.keyboard.getKeyPosition(key); 
    }

    getKeyPositions() {
        return this.keyboard.getKeyPositions();
    }

    getExplosionLineY() {
        if (this.explosionLine && typeof this.explosionLine.getLineY === 'function') {
            return this.explosionLine.getLineY();
        }
        const kbBounds = this.container.getBounds();
        return kbBounds.y + kbBounds.height - 50;
    }
}