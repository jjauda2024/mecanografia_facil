// ./src/core/generadorContenido.js para el juego Mecanografía Fácil

import { palabrasPorNivel } from "..palabrasPorNivel.js";
import { frasesPorNivel } from "..frasesPorNivel.js";

// Obtener letras únicas a partir de las palabras
function extraerLetras(palabras) {
  return [...new Set(palabras.join("").split(""))];
}

// Generar letras para modo "falling"
export function generarFallingLetras(nivel) {
  const letrasNuevas = extraerLetras(palabrasPorNivel[nivel] || []);
  const letrasPrevias = Object.keys(palabrasPorNivel)
    .filter(n => parseInt(n) < nivel)
    .flatMap(n => extraerLetras(palabrasPorNivel[n]));

  const acumuladas = [...new Set([...letrasNuevas, ...letrasPrevias])];
  const resultado = [];

  const total = 100; // número arbitrario de letras a generar
  const cantidadNuevas = Math.floor(total * 0.4);
  const cantidadPrevias = total - cantidadNuevas;

  for (let i = 0; i < cantidadNuevas; i++) {
    resultado.push(letrasNuevas[Math.floor(Math.random() * letrasNuevas.length)]);
  }
  for (let i = 0; i < cantidadPrevias; i++) {
    resultado.push(acumuladas[Math.floor(Math.random() * acumuladas.length)]);
  }

  // Opcional: mezclar
  return resultado.sort(() => Math.random() - 0.5);
}

// Generar texto para modo "text"
export function generarTexto(nivel) {
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
