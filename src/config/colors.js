// config/colors.js
// Definición centralizada de la paleta de colores del juego.

export const COLORS = {
    PRIMARY: 0xFF9900,      // Naranja para resaltado principal (ej. letras nuevas)
    SECONDARY: 0x00AAFF,    // Azul para resaltado secundario (ej. letras aprendidas)
    KEY_DEFAULT: 0x333333,  // Gris oscuro para teclas normales
    TEXT_DEFAULT: 0xFFFFFF, // Blanco para texto de teclas normales
    TEXT_HIGHLIGHTED: 0x000000, // Negro para texto en teclas resaltadas brillantes
    BACKGROUND_OVERLAY: 0x000000, // Negro para fondos de overlay (como en InterlevelScene)
    OVERLAY_OPACITY: 0.8,      // Opacidad para fondos de overlay
    PROMPT_TEXT: 0x00FF00,   // Verde para texto de prompt (ej. "Presiona ESPACIO")
    PROMPT_BG: 0x333333,     // Gris oscuro para fondo de prompt
    LEGEND_NEW: 0xFFCC00,    // Amarillo fuerte para leyenda de letras nuevas
    LEGEND_LEARNED: 0xEEEEAC, // Amarillo suave para leyenda de letras aprendidas
    SUCCESS_TEXT: 0xFFD700,  // Dorado para texto de éxito/título
    ERROR_TEXT: 0xFF0000,    // Rojo para texto de error (si aplica)
    BUTTON_BG_ON: 0x333333,  // Gris oscuro para botones ON
    BUTTON_BG_OFF: 0x555555, // Gris medio para botones OFF
};

export default COLORS;