const API_URL = "https://script.google.com/macros/s/AKfycbwsar5cEgQsyUc7KgJD7koKzWlo6bHdNPPtKFNaXXdH65Be-g5NniITscDNlibctXpz/exec";

let listaCapacitacionesGlobal = [];
let usuarioPuedeModificar = false;
let usuarioIdentificacionGlobal = "";
let examenActualGlobal = null;
let indicePreguntaActual = 0;
let respuestasUsuarioMap = {};
let temporizadorInterval = null;
let tiempoRestante = 60;
let cacheCapacitacionesUsuario = null;
let datosReporteGlobal = [];
let areasUnicasGlobal = [];
let cargosUnicosGlobal = [];

// Diccionario para controlar el temporizador de 3 minutos del video por capacitación
let videoTimersMap = {}; 
let videoCompletadoMap = {};
