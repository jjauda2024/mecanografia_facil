
// js/contenidoNivel.js

import { palabrasPorNivel } from "../utils/palabrasPorNivel.js";
import { frasesPorNivel } from "../utils/frasesPorNivel.js";

function extraerLetras(palabras) {
  return [...new Set(palabras.join("").split(""))];
}

export const ContenidoNivel = {
  /**
   * Retorna un array de letras aleatorias tomadas del nivel.
   * Mezcla letras acumuladas con 40% de letras nuevas del nivel.
   * Sin repeticiones inmediatas. Ideal para el modo Falling.
   */
  getLetrasParaFalling(nivel, cantidad = 100) {
    const letrasNuevas = extraerLetras(palabrasPorNivel[nivel] || []);
    const letrasPrevias = Object.keys(palabrasPorNivel)
      .filter(n => parseInt(n) < nivel)
      .flatMap(n => extraerLetras(palabrasPorNivel[n]));
    const letrasAcumuladas = [...new Set([...letrasNuevas, ...letrasPrevias])];

    const totalNuevas = Math.floor(cantidad * 0.4);
    const totalViejas = cantidad - totalNuevas;
    const resultado = [];

    function agregarLetras(origen, cantidadDeseada) {
      let prev = null;
      for (let i = 0; i < cantidadDeseada; i++) {
        const opciones = origen.filter(l => l !== prev);
        const letra = opciones[Math.floor(Math.random() * opciones.length)] || prev;
        resultado.push(letra);
        prev = letra;
      }
    }

    agregarLetras(letrasNuevas, totalNuevas);
    agregarLetras(letrasAcumuladas, totalViejas);

    return resultado.sort(() => Math.random() - 0.5);
  },

  /**
   * Retorna un string de texto para modo Text.
   * Niveles 1 y 2 usan palabras con repeticiones, 3+ usan frases completas.
   */
  getTextoParaText(nivel) {
    if (nivel === 1 || nivel === 2) {
      const palabras = palabrasPorNivel[nivel] || [];
      const lineas = [];
      for (let i = 0; i < 5; i++) {
        const seleccion = Array.from({ length: 3 }, () => {
          const palabra = palabras[Math.floor(Math.random() * palabras.length)];
          return `${palabra} ${palabra} ${palabra}`;
        });
        lineas.push(seleccion.join(" "));
      }
      return lineas.join("\n");
    } else {
      const frases = Object.values(frasesPorNivel[nivel] || {}).flat();
      const seleccion = [];
      for (let i = 0; i < 5; i++) {
        seleccion.push(frases[Math.floor(Math.random() * frases.length)]);
      }
      return seleccion.join("\n");
    }
  }
};

export default ContenidoNivel;
