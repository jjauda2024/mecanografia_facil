// js/utils/keyMappings.js

const accentedMap = {
    'á': ['´', 'a'], 'é': ['´', 'e'], 'í': ['´', 'i'], 'ó': ['´', 'o'], 'ú': ['´', 'u'],
    'Á': ['Shift ', '´', 'a'], 'É': ['Shift ', '´', 'e'], 'Í': ['Shift', '´', 'i'], 'Ó': ['Shift', '´', 'o'], 'Ú': ['Shift', '´', 'u'],
    '!': ['Shift ', '1'], '"': ['Shift ', '2'], '#': ['Shift ', '3'], '$': ['Shift ', '4'],
    '%': ['Shift ', '5'], '&': ['Shift ', '6'], '/': ['Shift', '7'], '(': ['Shift', '8'],
    ')': ['Shift', '9'], '=': ['Shift', '0'], '?': ['Shift', '´ '], '¡': ['Shift', '¿'],
};

const fingerMap = {
    'A': 'meñique-izq', 'Q': 'meñique-izq', 'Z': 'meñique-izq', 'Shift': 'meñique-izq',
    'º': 'meñique-izq', '|': 'meñique-izq', '¡': 'meñique-izq', 'Tab': 'meñique-izq',
    'S': 'anular-izq', 'W': 'anular-izq', 'X': 'anular-izq',
    'D': 'medio-izq', 'E': 'medio-izq', 'C': 'medio-izq',
    'F': 'indice-izq', 'R': 'indice-izq', 'T': 'indice-izq', 'G': 'indice-izq', 'V': 'indice-izq', 'B': 'indice-izq', '4': 'indice-izq', '5': 'indice-izq',
    'Ñ': 'meñique-der', 'P': 'meñique-der', '-': 'meñique-der', '´': 'meñique-der', '+': 'meñique-der', '}': 'meñique-der', '{': 'meñique-der', 'Enter': 'meñique-der', 'Shift ': 'meñique-der', 'Backspace': 'meñique-der',
    'L': 'anular-der', 'O': 'anular-der', '.': 'anular-der',
    'K': 'medio-der', 'I': 'medio-der', ',': 'medio-der',
    'J': 'indice-der', 'H': 'indice-der', 'Y': 'indice-der', 'U': 'indice-der', 'N': 'indice-der', 'M': 'indice-der', '6': 'indice-der', '7': 'indice-der',
    'Espacio': 'pulgar', '←': 'meñique-der', '→': 'meñique-der', '↑↓': 'meñique-der', '1': 'meñique-izq', '2': 'anular-izq',
    '3': 'medio-izq', '8': 'medio-der', '9': 'anular-der', '0': 'meñique-der', '¿': 'meñique-der', "'": 'meñique-der', '<': 'meñique-izq'

};

function getShiftForKey(key) {
    const leftSideKeys = ['A', 'S', 'D', 'F', 'G', 'Z', 'X', 'C', 'V', 'B', 'Q', 'W', 'E', 'R', 'T'];
    return leftSideKeys.includes(key) ? 'Shift ' : 'Shift';
}

function resolveShiftSide(key) {
    return (key === 'Shift' || key === 'Shift ') ? key : key.toUpperCase();
}

function getKeysForChar(char) {
    console.log('🪵 getKeysForChar recibido:', char);  // 👈 esto te mostrará el valor recibido
    if (typeof char !== 'string' || char.length === 0) return [];

    if (char === ' ') return ['Espacio']; // antes que cualquier transformación

    if (accentedMap[char]) {
        return accentedMap[char].map(k => resolveShiftSide(k));
    }

    if (char.length === 1) {
        const isUpper = char.toUpperCase() === char && char.toLowerCase() !== char;
        const baseChar = char.toUpperCase();

        if (isUpper) {
            const shiftKey = getShiftForKey(baseChar);
            return [baseChar, shiftKey];
        } else {
            return [baseChar];
        }
    }

    return [char.toUpperCase()];

}

function getFingerForKey(key) {
    return fingerMap[key] || null;
}

export {
    getKeysForChar,
    getFingerForKey,
    getShiftForKey,
    resolveShiftSide,
    accentedMap,
    fingerMap
};
