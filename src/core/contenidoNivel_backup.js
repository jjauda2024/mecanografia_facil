
// js/contenidoNivel.js

import niveles from "../utils/nivelesData";

export const ContenidoNivel = {
  /**
   * Retorna un array de letras aleatorias tomadas del texto del nivel.
   * Las letras se pueden repetir y el orden es aleatorio.
   * Ideal para el modo Falling.
   */
  getLetrasParaFalling(nivel, cantidad = 100) {
    const texto = niveles[nivel];
    if (!texto) return [];
    const letras = texto.replace(/\s+/g, '').split('');
    const resultado = [];
    for (let i = 0; i < cantidad; i++) {
      const aleatoria = letras[Math.floor(Math.random() * letras.length)];
      resultado.push(aleatoria);
    }
    return resultado;
  },

  /**
   * Retorna un string con palabras aleatorias separadas por espacio del texto del nivel.
   * Ideal para el modo Text.
   */
  getPalabrasParaText(nivel, cantidad = 50) {
    const texto = niveles[nivel];
    if (!texto) return "";
    const palabras = texto.trim().split(/\s+/);
    const barajadas = palabras.sort(() => Math.random() - 0.5);
    return barajadas.slice(0, cantidad).join(" ");
  }
};

export default ContenidoNivel;
