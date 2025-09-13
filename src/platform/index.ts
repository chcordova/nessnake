/**
 * Punto de entrada para la selección/adaptación de plataforma.
 *
 * Reexporta los adaptadores de entrada para web y móvil, permitiendo que el motor del juego
 * utilice la plataforma adecuada según el entorno de ejecución.
 */
export * from "./web/WebInputAdapter";
export * from "./mobile/MobileInputAdapter";
