// utils/nivelesData.js
// Definición centralizada de todos los niveles del juego.

export const niveles = {
    1: {
      id: 1,
      name: "Fundamentos",
      newLetters: ["a", "e", "o", "s", "m", "l"],
      words: [ // Estas son las palabras de las que se seleccionarán al azar para la repetición
        "casa", "mesa", "sol", "sal", "ala", "loma", "mola", "lesa", "sola", "loas", "mas",
        "la", "el", "es", "me", "se", "lo", "las", "los", "asoma"
      ],
      // *** CONFIGURACIÓN SIMPLIFICADA PARA TEXTO REPETITIVO ***
      textConfig: {
        type: 'repeatedWords',
        wordsPerGroup: 3, // Cuántas veces se repite cada palabra en un grupo
        groupsPerLine: 3, // Cuántos grupos de palabras hay en cada línea
        numLines: 5 // Número total de líneas a generar
      },
      phrases: [],
      visuals: { /* ... */ }
    },
    2: {
      id: 2,
      name: "Estructuras Básicas",
      newLetters: ["i", "d", "n", "r", "t"],
      words: [
        "dado", "nido", "tren", "rana", "tinta", "dedo", "ida", "tarde", "naranja",
        "ir", "dan", "nada", "arte", "red", "tienda", "dentro", "andar", "sentir"
      ],
      textConfig: {
        type: 'repeatedWords',
        wordsPerGroup: 3,
        groupsPerLine: 3,
        numLines: 5
      },
      phrases: [],
      visuals: { /* ... */ }
    },
    3: {
    id: 3,
    name: "Ortografía Completa",
    newLetters: ["u", "c", "p", "b"],
    words: [
      "burro", "cubo", "pato", "boca", "culpa", "pulpo", "cabra", "pueblo",
      "azul", "uno", "cielo", "puro", "barco", "subir", "buscar", "culpa"
    ],
    phrases: [ // Estos son los textos normales para los niveles avanzados
      "un buho canta",
      "el pato es blanco",
      "sube la cuesta",
      "busca tu camino",
      "pulpo en el cubo"
    ],
    textConfig: { // Indicar que es un texto normal, sin formato especial
        type: 'normal'
    },
    visuals: {
      shiftDragEffect: "golden_trail",
      fingerThumbnails: true,
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
    textConfig: {
        type: 'normal'
    },
    visuals: {
      qKeyPulsing: true,
      interrogationTooltip: true,
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
    textConfig: {
        type: 'normal'
    },
    visuals: {}
  }
};

// Exportar también como default si se prefiere
export default niveles;