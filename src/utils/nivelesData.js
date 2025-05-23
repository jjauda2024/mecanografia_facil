// utils/nivelesData.js
// Definición centralizada de todos los niveles del juego.
// Contiene las letras, palabras, frases y adaptaciones visuales por nivel.

export const niveles = {
  1: {
    id: 1,
    name: "Fundamentos",
    newLetters: ["a", "e", "o", "s", "m", "l"],
    words: [ // Palabras que usan las letras de este nivel y anteriores
      "casa", "mesa", "sol", "sal", "ala", "loma", "mola", "lesa", "sola", "loas", "mas",
      "la", "el", "es", "me", "se", "lo", "las", "los"
    ],
    phrases: [ // Frases para el modo texto
      "la casa es mia",
      "el sol sale",
      "mesa de madera",
      "la sal es blanca",
      "somos leales"
    ],
    visuals: { // Adaptaciones visuales para este nivel
      keyboardOpacity: 0.6, // Teclado virtual al 60% de opacidad
      correctWaveEffect: "leaves", // Efecto "onda" con hojas
      errorKeyBlink: true, // Tecla correcta brilla suavemente al error
    }
  },
  2: {
    id: 2,
    name: "Estructuras Básicas",
    newLetters: ["i", "d", "n", "r", "t"],
    words: [
      "dado", "nido", "tren", "rana", "tinta", "dedo", "ida", "tarde", "naranja",
      "ir", "dan", "nada", "arte", "red", "tienda", "dentro", "andar", "sentir"
    ],
    phrases: [
      "dame la tinta",
      "el tren es rapido",
      "naranja madura",
      "ir a la tienda",
      "sentir el aire"
    ],
    visuals: {
      keyboardBreathing: true, // Teclado con "respiración" suave
      guideLinesAnimated: true, // Guías de dedos animadas
    }
  },
  3: {
    id: 3,
    name: "Ortografía Completa",
    newLetters: ["u", "c", "p", "b"], // Las mayúsculas y acentos se gestionan en keyMappings y la lógica de entrada
    words: [
      "burro", "cubo", "pato", "boca", "culpa", "pulpo", "cabra", "pueblo",
      "azul", "uno", "cielo", "puro", "barco", "subir", "buscar", "culpa"
    ],
    phrases: [
      "un buho canta",
      "el pato es blanco",
      "sube la cuesta",
      "busca tu camino",
      "pulpo en el cubo"
    ],
    visuals: {
      shiftDragEffect: "golden_trail", // Efecto de "arrastre" para Shift
      fingerThumbnails: true, // Teclado muestra miniaturas de dedos
    }
  },
  4: {
    id: 4,
    name: "Combinaciones Especiales",
    newLetters: ["g", "q", "y", "h", "v"],
    words: [
      "gato", "queso", "vaca", "huevo", "yoga", "guia", "agua", "viaje",
      "lago", "quizas", "ayer", "hola", "verde", "grande", "guante", "volar"
    ],
    phrases: [
      "que gusto verte",
      "hay agua en el vaso",
      "voy de viaje",
      "quiero un helado",
      "vive la vida"
    ],
    visuals: {
      qKeyPulsing: true, // Tecla "Q" con efecto pulsante morado
      interrogationTooltip: true, // Tooltip para "¿" con animación
    }
  },
  5: {
    id: 5,
    name: "Dominio Total",
    newLetters: ["f", "z", "j", "ñ", "x", "k", "w"],
    words: [
      "pez", "jirafa", "ñu", "fox", "kiwi", "web", "jazmin", "cafe",
      "feliz", "jugar", "niño", "examen", "koala", "wifi", "fax"
    ],
    phrases: [
      "el pez es azul",
      "la jirafa es alta",
      "la web es grande",
      "juega con el niño",
      "haz tu examen"
    ],
    visuals: {} // Sin adaptaciones visuales específicas mencionadas, pero se pueden añadir
  }
};

// Exportar también como default si se prefiere
export default niveles;
