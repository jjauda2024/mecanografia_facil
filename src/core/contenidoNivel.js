// js/contenidoNivel.js

import { niveles } from "../utils/nivelesData.js"; // Importar la nueva tabla de niveles

// Función auxiliar para extraer letras únicas de un array de palabras
function extraerLetras(palabras) {
  return [...new Set(palabras.join("").split(""))];
}

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
    return nivelData.newLetters; // Las letras nuevas ya están definidas directamente
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
    const letrasNuevas = this.getLetrasDelNivel(nivel); // Usar el nuevo método
    const letrasPrevias = this.getLetrasAcumuladasHastaNivel(nivel - 1); // Letras de niveles anteriores
    const letrasAcumuladas = [...new Set([...letrasNuevas, ...letrasPrevias])];

    const totalNuevas = Math.floor(cantidad * 0.4); // 40% de letras nuevas
    const totalViejas = cantidad - totalNuevas;
    const resultado = [];

    // Función auxiliar para agregar letras sin repeticiones inmediatas
    function agregarLetras(origen, cantidadDeseada) {
      let prev = null;
      for (let i = 0; i < cantidadDeseada; i++) {
        const opciones = origen.filter(l => l !== prev);
        const letra = opciones[Math.floor(Math.random() * opciones.length)] || origen[0] || prev;
        if (letra) {
            resultado.push(letra);
            prev = letra;
        }
      }
    }

    const letrasNuevasParaAgregar = Math.min(totalNuevas, letrasNuevas.length);
    const letrasViejasParaAgregar = Math.min(totalViejas, letrasAcumuladas.length);

    agregarLetras(letrasNuevas, letrasNuevasParaAgregar);
    agregarLetras(letrasAcumuladas, letrasViejasParaAgregar);

    while (resultado.length < cantidad) {
        const letra = letrasAcumuladas[Math.floor(Math.random() * letrasAcumuladas.length)];
        if (letra) resultado.push(letra);
        else break;
    }

    return resultado.sort(() => Math.random() - 0.5);
  },

  /**
   * Retorna un string de texto para modo Text.
   * Utiliza las frases definidas en la tabla de niveles.
   */
  getTextoParaText(nivel) {
    const nivelData = niveles[nivel];
    if (!nivelData || !nivelData.phrases || nivelData.phrases.length === 0) {
      console.warn(`Frases para el nivel ${nivel} no encontradas o vacías.`);
      return "Texto de ejemplo si no hay frases.";
    }
    return nivelData.phrases[Math.floor(Math.random() * nivelData.phrases.length)];
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
        seleccion.push(palabras[Math.floor(Math.random() * palabras.length)]);
    }
    return seleccion.join(" ");
  }
};

export default ContenidoNivel;