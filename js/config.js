const API_URL = "https://script.google.com/macros/s/AKfycbxgHF7jp6DXy2CEv6Ba8HBLGsWBWYEpTu4phAXRgX-lrSQV9AlVqaeT4wQQ7946bjTh/exec";

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
