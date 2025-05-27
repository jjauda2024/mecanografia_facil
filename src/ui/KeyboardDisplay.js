// ui/KeyboardDisplay.js
// en el teclado visual, e integra guías, línea de explosión y manos

import BasicKeyboard from "./BasicKeyboard.js";
import GuidesLayer from "./GuidesLayer.js";
import ExplosionLineLayer from "./ExplosionLineLayer.js";
import HandsLayer from "./HandsLayer.js";
import { getKeysForChar } from "../utils/keyMappings.js"; // Ruta corregida a utils/keyMappings.js
import COLORS from "../config/colors.js"; // Importar colores centralizados

export default class KeyboardDisplay {
    constructor(scene, { x = 0, y = 0, initialSettings = {} } = {}) { // Agregado initialSettings
        // 1. Validación inicial
        if (!scene || !scene.add) throw new Error("Se requiere una escena Phaser válida");

        // 2. Configuración básica
        this.scene = scene;
        this.container = scene.add.container(x, y); // El contenedor principal del KeyboardDisplay
        this.lastKeys = []; // Aquí se guardarán las últimas teclas resaltadas
        this.settings = {
            guides: true,
            explosionLine: true,
            hands: true,
            ...initialSettings // Aplicar settings iniciales
        };

        // Cargar configuraciones de localStorage al inicio
        // Usar JSON.parse para convertir el string de localStorage a booleano
        this.settings.guides = JSON.parse(localStorage.getItem('keyboard_guides') ?? 'true');
        this.settings.explosionLine = JSON.parse(localStorage.getItem('keyboard_explosionLine') ?? 'true');
        this.settings.hands = JSON.parse(localStorage.getItem('keyboard_hands') ?? 'true');

        // 3. Inicialización de capas
        try {

            this.keyboard = new BasicKeyboard(scene, { // Pasar opciones de color a BasicKeyboard
                highlightColor: 0xff9900,
                keyColor: 0x333333
            });

            this.keyboard.draw([]); // Dibuja el teclado base

            // Forzar el tamaño inicial del contenedor de KeyboardDisplay
            // Esto asegura que getBounds() no devuelva 0 en sus primeras llamadas
            const initialKbBounds = this.keyboard.getContainer().getBounds();
            this.container.setSize(initialKbBounds.width, initialKbBounds.height);
            
            this.guides = new GuidesLayer(scene, this);
            this.explosionLine = new ExplosionLineLayer(scene, this);
            this.hands = new HandsLayer(scene, this);

            // 4. Verificación y adición de contenedores de capas
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

        // 5. Configuración de controles UI (solo se crean los objetos)
        this.createControlsUI();

        // 6. Sincronización inicial: Llamar a syncLayersAndControls para que todo se dibuje y posicione
        // Esto se ejecutará después de que KeyboardDisplay se haya creado
        // y su contenedor principal tenga un tamaño inicial.
        // La escena que lo instancia (InterlevelScene) luego llamará a setPosition() para el centrado
        // y eso disparará syncLayersAndControls() de nuevo con las bounds finales.
        this.syncLayersAndControls(); // Llamada inicial para establecer estado de botones y capas
    }

    // === Métodos Públicos ===
    draw(input, options = {}) {
        this.lastKeys = input; // Guardar la última entrada para redibujar
        
        const processed = this.processInput(input, options);
        let allKeysForGuides = []; 
        let groupsForBasicKeyboard = [];

        if (Array.isArray(processed)) {
            processed.forEach(group => {
                groupsForBasicKeyboard.push(group);
                allKeysForGuides = allKeysForGuides.concat(group.keys);
            });
        } else {
            groupsForBasicKeyboard.push(processed);
            allKeysForGuides = processed.keys;
        }

        // Llama a BasicKeyboard.draw UNA SOLA VEZ con todos los grupos
        this.keyboard.draw(groupsForBasicKeyboard); 

        // Actualizar capas adicionales (solo si están visibles)
        if (this.settings.guides) this.guides.draw(allKeysForGuides);
        // ExplosionLineLayer.draw() y HandsLayer.draw() son llamados en setVisible o syncLayersAndControls/toggleSetting
        // ya que no dependen de 'keys' para su dibujo fundamental.
        // if (this.settings.explosionLine) this.explosionLine.draw(); // Ya se maneja en toggleSetting/syncLayersAndControls
        // if (this.settings.hands) this.hands.draw(); // Ya se maneja en toggleSetting/syncLayersAndControls
        
        this.updateControlsPosition(); // Reposicionar botones si el tamaño del teclado cambia
    }

    clear() {
        this.keyboard.clear();
        this.guides.clear();
        this.explosionLine.clear();
        this.hands.clear();
        this.lastKeys = []; // Limpiar lastKeys al borrar
    }

    // Método público para mover el teclado y sincronizar capas/controles
    setPosition(x, y) {
        this.container.setPosition(x, y);
        this.syncLayersAndControls(); // Sincroniza después de cada movimiento
    }

    // === Métodos de Control UI ===
    createControlsUI() {
        const buttonStyle = {
            fontSize: "12px",
            fontFamily: "Arial",
            // Los colores iniciales se establecen en updateButton
            padding: { x: 8, y: 4 }
        };

        // Profundidad alta para los botones de control para asegurar su visibilidad
        const buttonDepth = 30;

        this.btnGuides = this.scene.add.text(0, 0, ``, buttonStyle)
            .setInteractive()
            .setOrigin(0, 0.5)
            .setDepth(buttonDepth) // Asigna profundidad
            .on("pointerdown", () => this.toggleSetting("guides"));

        this.btnExplosion = this.scene.add.text(0, 0, ``, buttonStyle)
            .setInteractive()
            .setOrigin(0, 0.5)
            .setDepth(buttonDepth) // Asigna profundidad
            .on("pointerdown", () => this.toggleSetting("explosionLine"));

        this.btnHands = this.scene.add.text(0, 0, ``, buttonStyle)
            .setInteractive()
            .setOrigin(0, 0.5)
            .setDepth(buttonDepth) // Asigna profundidad
            .on("pointerdown", () => this.toggleSetting("hands"));
    }

    updateControlsPosition() {
        const kbBounds = this.container.getBounds(); 
        const posX = kbBounds.x + kbBounds.width + 10; 
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
        // Guardar como JSON string para que localStorage lo maneje bien
        localStorage.setItem(`keyboard_${setting}`, JSON.stringify(this.settings[setting]));

        // Sincronizar visibilidad y redibujar la capa específica
        switch(setting) {
            case 'guides':
                this.guides.setVisible(this.settings.guides);
                if (this.settings.guides) this.guides.draw(this.getAllKeysFromLastInput()); // Redibujar con teclas actuales
                else this.guides.clear();
                break;
            case 'explosionLine':
                this.explosionLine.setVisible(this.settings.explosionLine);
                if (this.settings.explosionLine) this.explosionLine.draw(); // ExplosionLineLayer.draw() no necesita keys
                else this.explosionLine.clear();
                break;
            case 'hands':
                this.hands.setVisible(this.settings.hands);
                if (this.settings.hands) this.hands.draw();
                else this.hands.clear();
                break;
        }

        this.updateButton(setting);
        // this.draw(this.lastKeys); // Ya no es necesario, las capas se manejan directamente
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
            const isOn = this.settings[setting];
            // Usar COLORS centralizados para el fondo y texto
            button.setBackgroundColor(isOn ? '#333333' : '#555555');
            button.setColor('#BBBBBB');
            button.setText(`${icon} ${setting} ${isOn ? "ON" : "OFF"}`);
        }
    }

    processInput(input, options = {}) {
        // Usar COLORS centralizados para colores por defecto
        const defaultColors = {
            primary: 0xFF9900,
            secondary: 0x00AAFF
        };
        const colors = { ...defaultColors, ...options.colors };

        if (typeof input === "string") {
            return { keys: getKeysForChar(input), color: defaultColors.primary };
        }
        if (Array.isArray(input) && !input.some(Array.isArray)) {
            return { keys: input.flatMap(getKeysForChar), color: defaultColors.primary };
        }
        if (Array.isArray(input) && input.length === 2 && Array.isArray(input[0]) && Array.isArray(input[1])) {
            return [
                { keys: input[0].flatMap(getKeysForChar), color: defaultColors.primary },
                { keys: input[1].flatMap(getKeysForChar), color: defaultColors.secondary },
            ];
        }
        if (typeof input === 'object' && !Array.isArray(input)) {
            return {
                keys: getKeysForChar(input.char),
                color: input.color || defaultColors.primary,
                blink: input.blink || false
            };
        }
        return { keys: [], color: defaultColors.primary };
    }

    getAllKeysFromLastInput() {
        const processed = this.processInput(this.lastKeys);
        if (Array.isArray(processed)) {
            return processed.flatMap(group => group.keys);
        } else {
            return processed.keys;
        }
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
        // Retorna la posición Y global de la línea de explosión
        // Asegúrate de que ExplosionLineLayer.graphics.y sea la posición global
        return this.explosionLine.lineaExplosionY;
    }

    // NUEVO MÉTODO: Sincroniza la visibilidad y el dibujo de todas las capas y controles
    syncLayersAndControls() {
        // Sincronizar el texto y color inicial de los botones
        this.updateButton('guides');
        this.updateButton('explosionLine');
        this.updateButton('hands');

        // Sincronizar visibilidad y dibujar capas
        this.guides.setVisible(this.settings.guides);
        if (this.settings.guides) this.guides.draw(this.getAllKeysFromLastInput());

        this.explosionLine.setVisible(this.settings.explosionLine);
        if (this.settings.explosionLine) this.explosionLine.draw(); 

        this.hands.setVisible(this.settings.hands);
        if (this.settings.hands) this.hands.draw();

        // Posicionar los botones de control (después de que el teclado ya esté posicionado)
        this.updateControlsPosition();
    }
}