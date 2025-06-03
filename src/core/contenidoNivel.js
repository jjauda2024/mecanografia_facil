// js/contenidoNivel.js

import { niveles } from "../utils/nivelesData.js"; // Importar la nueva tabla de niveles

export const ContenidoNivel = {
  /**
   * Retorna un array de letras únicas que pertenecen específicamente a un nivel dado.
   * Ideal para mostrar las "letras nuevas" en InterlevelScene.
   */
  getLetrasDelNivel(nivel) {
    const nivelData = niveles[nivel];
    if (!nivelData) {
      console.warn(`Nivel ${nivel} no encontrado en nivelesData.`);
      return [];
    }
    return nivelData.newLetters;
  },

  /**
   * Retorna un array de letras únicas acumuladas hasta (e incluyendo) un nivel dado.
   * Ideal para mostrar las "letras aprendidas" en InterlevelScene.
   */
  getLetrasAcumuladasHastaNivel(nivel) {
    const letrasAcumuladas = new Set();
    for (let i = 1; i <= nivel; i++) {
      const nivelData = niveles[i];
      if (nivelData) {
        nivelData.newLetters.forEach(letra => letrasAcumuladas.add(letra));
      }
    }
    return Array.from(letrasAcumuladas);
  },

  /**
   * Retorna un array de letras aleatorias para el modo Falling.
   * Mezcla letras acumuladas con una proporción de letras nuevas del nivel.
   * Sin repeticiones inmediatas.
   */
  getLetrasParaFalling(nivel, cantidad = 100) {
    const letrasNuevas = this.getLetrasDelNivel(nivel);
    const letrasPrevias = this.getLetrasAcumuladasHastaNivel(nivel - 1);
    const letrasAcumuladas = [...new Set([...letrasNuevas, ...letrasPrevias])];

    const totalNuevas = Math.floor(cantidad * 0.4);
    const totalViejas = cantidad - totalNuevas;
    const resultado = [];

    function agregarLetras(origen, cantidadDeseada) {
      let prev = null;
      for (let i = 0; i < cantidadDeseada; i++) {
        const opciones = origen.filter(l => l !== prev);
        const letra = opciones.length > 0 ? opciones[Math.floor(Math.random() * opciones.length)] : (origen[0] || null);
        if (letra) {
            resultado.push(letra);
            prev = letra;
        } else if (origen.length === 0) { // Si el origen está vacío, no hay nada que agregar
            break;
        }
      }
    }

    // Asegurarse de que haya letras disponibles antes de intentar agregarlas
    if (letrasNuevas.length > 0) {
        agregarLetras(letrasNuevas, Math.min(totalNuevas, letrasNuevas.length));
    }
    if (letrasAcumuladas.length > 0) {
        agregarLetras(letrasAcumuladas, Math.min(totalViejas, letrasAcumuladas.length));
    }


    // Rellenar hasta la cantidad deseada si aún faltan letras
    while (resultado.length < cantidad && letrasAcumuladas.length > 0) {
        const letra = letrasAcumuladas[Math.floor(Math.random() * letrasAcumuladas.length)];
        if (letra) resultado.push(letra);
        else break; // Si por alguna razón no se puede obtener una letra, evitar bucle infinito
    }

    return resultado.sort(() => Math.random() - 0.5);
  },

  /**
   * Retorna un string de texto para modo Text, basado en la configuración del nivel.
   */
  getTextoParaText(nivel) {
    const nivelData = niveles[nivel];
    if (!nivelData) {
      console.warn(`Nivel ${nivel} no encontrado en nivelesData.`);
      return "Texto de ejemplo si el nivel no existe.";
    }

    const config = nivelData.textConfig;
    console.log('nivelData: ', nivelData);
    console.log('config.type: ', config);

    if (config && config.type === 'repeatedWords') {
        return ContenidoNivel._generateRepeatedWordsText(config, nivelData.words);
    } else if (nivelData.phrases && nivelData.phrases.length > 0) {
        // Si no hay 'textConfig' de tipo 'repeatedWords', busca en 'phrases'
        return nivelData.phrases[Math.floor(Math.random() * nivelData.phrases.length)];
    } else {
        console.warn(`Ni frases ni configuración de texto especial para el nivel ${nivel}.`);
        return "Texto de ejemplo si no hay frases o config.";
    }
  },

    /**
   * Genera un texto con grupos de palabras repetidas seleccionadas al azar.
   * @param {object} config - Configuración para la generación de texto (wordsPerGroup, groupsPerLine, numLines).
   * @param {string[]} availableWords - Array de palabras disponibles para este nivel (de niveles[nivel].words).
   * @returns {string} El texto generado con saltos de línea.
   */
  _generateRepeatedWordsText(config, availableWords) {
      let fullText = [];
      const wordsPerGroup = config.wordsPerGroup || 3;
      const groupsPerLine = config.groupsPerLine || 3;
      const numLines = config.numLines || 5;

      if (!availableWords || availableWords.length === 0) {
          console.warn("No hay palabras disponibles para generar texto repetido.");
          return "practica palabras"; // Fallback
      }

      // Función auxiliar para seleccionar una palabra al azar de las disponibles
      // y evitar repeticiones inmediatas de palabras en la misma línea o grupo
      let lastSelectedWord = null;

      const getRandomWord = (wordsArray) => {
          if (wordsArray.length === 0) return null;
          if (wordsArray.length === 1) return wordsArray[0];

          let word;
          let attempts = 0;
          // Intenta encontrar una palabra diferente a la última, hasta 5 intentos
          do {
              word = wordsArray[Math.floor(Math.random() * wordsArray.length)];
              attempts++;
          } while (word === lastSelectedWord && attempts < 5);

          lastSelectedWord = word;
          return word;
      };

      for (let l = 0; l < numLines; l++) {
          let line = '';
          // Reiniciar lastSelectedWord para cada nueva línea para evitar repeticiones a través de líneas
          lastSelectedWord = null;

          for (let g = 0; g < groupsPerLine; g++) {
              const wordToRepeat = getRandomWord(availableWords);
              if (!wordToRepeat) { // Si no se pudo obtener una palabra, salir del bucle
                  break;
              }

              for (let i = 0; i < wordsPerGroup; i++) {
                  line += wordToRepeat + ' ';
              }
          }

          fullText.push(line.trim());
      }
      return fullText.join('\n');
  },


  /**
   * Retorna un subconjunto de palabras del nivel para el modo texto (si se necesita para demo o previsualización).
   */
  getPalabrasParaText(nivel, cantidad = 5) {
    const nivelData = niveles[nivel];
    if (!nivelData || !nivelData.words || nivelData.words.length === 0) {
        console.warn(`Palabras para el nivel ${nivel} no encontradas o vacías.`);
        return ["ejemplo", "palabras"];
    }
    const palabras = nivelData.words.slice();
    const seleccion = [];
    for (let i = 0; i < cantidad; i++) {
        // Asegurarse de que no intentamos acceder a un índice que no existe
        if (palabras.length > 0) {
             seleccion.push(palabras[Math.floor(Math.random() * palabras.length)]);
        } else {
             break; // Salir si no hay más palabras para seleccionar
        }
    }
    return seleccion.join(" ");
  }
};

export default ContenidoNivel;