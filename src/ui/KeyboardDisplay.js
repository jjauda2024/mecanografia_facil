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
        this.container = scene.add.container(x, y); // <-- x e y iniciales
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

        // ------------------ Crear los objetos de control una vez ------------------
        this.createControlsUI();

        // ------------------ IMPORTANTE: Posicionar los controles al inicio ------------------
        // Llama a updateControlsPosition para que los botones se ubiquen correctamente
        // después de que el contenedor se ha creado y el BasicKeyboard se ha dibujado
        this.updateControlsPosition(); // <--- ¡CORRECCIÓN AQUÍ! Llamando al método correcto
    }

    // === Métodos Públicos ===
    draw(input, options = {}) {
        const processed = this.processInput(input, options);
        
        if (Array.isArray(processed)) {
            processed.forEach(group => {
                this.keyboard.draw(group.keys, {
                    color: group.color,
                    blink: group.blink
                });
            });
        } else {
            this.keyboard.draw(processed.keys, {
                color: processed.color,
                blink: processed.blink
            });
        }

        if (this.settings.guides) this.guides.draw(processed.keys);
        if (this.settings.hands) this.hands.draw();
        
        // Cada vez que se redibuja, también actualizamos la posición de los controles
        this.updateControlsPosition();
    }

    clear() {
        this.keyboard.clear();
        this.guides.clear();
        this.explosionLine.clear();
        this.hands.clear();
        this.lastKeys = [];
    }

    // ------------------ NUEVO: Método para cambiar la posición global del KeyboardDisplay ------------------
    // Este método debe ser llamado desde la escena (InterlevelScene, GameManager)
    // para mover el teclado completo.
    setPosition(x, y) {
        this.container.setPosition(x, y);
        this.updateControlsPosition(); // Recalcula la posición de los controles
    }

    // ------------------ Método para crear los objetos de UI de los controles ------------------
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

    // ------------------ Método para actualizar la posición de los controles ------------------
    updateControlsPosition() {
        // Obtener los límites GLOBALES del contenedor principal de KeyboardDisplay
        const kbBounds = this.container.getBounds(); 
        
        // Calcular posX y offsetY para los botones
        const posX = kbBounds.x + kbBounds.width + 20; // Margen de 50px
        let offsetY = kbBounds.y;

        // Aplicar la posición a cada botón
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

    // === Métodos Privados === (o internos)
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
                { keys: input[1].flatMap(getKeysForChar), color: colors.secondary }
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
      // getKeyPosition de BasicKeyboard ya devuelve coordenadas globales
      return this.keyboard.getKeyPosition(key); 
    }

    getKeyPositions() {
        return this.keyboard.getKeyPositions();
    }

    getExplosionLineY() {
        // Asegúrate de que ExplosionLineLayer tiene un método getLineY() que devuelve la Y global
        if (this.explosionLine && typeof this.explosionLine.getLineY === 'function') {
            return this.explosionLine.getLineY();
        }
        // Fallback si no se puede obtener de la capa
        const kbBounds = this.container.getBounds();
        return kbBounds.y + kbBounds.height - 50; // Estimación: 50px sobre el borde inferior
    }
}