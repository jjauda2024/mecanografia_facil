// Ejemplo de instancia configurada
const keyboard = new KeyboardDisplay(scene, {
    x: 100, 
    y: 50,
    keyboardOptions: {
        keyColor: 0x333333,
        highlightColor: 0xFF9900
    },
    initialSettings: {
        guides: true,
        hands: false
    }
});

// Estructura interna resultante
console.log(keyboard);
/*
{
    container: Phaser.Container,
    settings: {
        guides: true,
        explosionLine: true,
        hands: false
    },
    keyboard: BasicKeyboard,
    guides: GuidesLayer,
    explosionLine: ExplosionLineLayer,
    hands: HandsLayer,
    __proto__: {
        draw: fn(),
        clear: fn(),
        ...
    }
}
*/