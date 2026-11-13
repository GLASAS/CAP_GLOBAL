function renderizarCapacitacionesUsuario(capacitaciones) {
    const contenedorPendientes = document.getElementById('contenedorCapacitacionesPendientes');
    const contenedorCulminadas = document.getElementById('contenedorCapacitacionesCulminadas');
    if(!contenedorPendientes || !contenedorCulminadas) return;

    contenedorPendientes.innerHTML = "";
    contenedorCulminadas.innerHTML = "";

    if(!capacitaciones || capacitaciones.length === 0) {
        contenedorPendientes.innerHTML = `<div class="col-12"><div class="alert alert-warning text-center">No hay capacitaciones asignadas.</div></div>`;
        contenedorCulminadas.innerHTML = `<div class="col-12"><div class="alert alert-light border text-center text-muted py-3 small">Aún no tienes capacitaciones culminadas.</div></div>`;
        return;
    }

    let contadorPendientes = 0;
    let contadorCulminadas = 0;

    capacitaciones.forEach(cap => {
        let sinIntentos = (cap.intentosPermitidos > 0 && cap.intentosRealizados >= cap.intentosPermitidos);
        let etiquetaIntentos = cap.intentosPermitidos === 0 ? "Ilimitados" : `${cap.intentosRealizados} / ${cap.intentosPermitidos}`;

        let bannerAprobado = "";
        let botonExamenOAccion = "";

        if (cap.yaAprobo) {
            contadorCulminadas++;
            let notaMostrar = cap.ultimaNota || '100%';
            let numNota = parseFloat(notaMostrar);
            if (!isNaN(numNota) && numNota <= 1) notaMostrar = Math.round(numNota * 100) + '%';

            bannerAprobado = `
                <div class="alert alert-success py-2 px-3 mb-3 rounded-3 d-flex justify-content-between align-items-center">
                    <span><i class="fas fa-check-circle me-2"></i> <b>CAPACITACIÓN CULMINADA</b></span>
                    <span class="badge bg-success fs-6">Nota: ${notaMostrar}</span>
                </div>
            `;
            
            if (String(cap.generaCertificado).trim().toUpperCase() === "SI") {
                botonExamenOAccion = `
                    <button class="btn btn-success rounded-pill fw-bold w-100 shadow-sm" onclick="generarPDFCertificado('${cap.id}')">
                        <i class="fas fa-file-pdf me-2"></i> Descargar Certificado PDF
                    </button>
                `;
            } else {
                botonExamenOAccion = `
                    <div class="alert alert-info text-center m-0 py-2 rounded-pill fw-bold text-primary small border-primary">
                        <i class="fas fa-award me-1"></i> ¡Aprobada Exitosamente!
                    </div>
                `;
            }
        } else {
            contadorPendientes++;
            
            // Lógica de restricción de video: Si tiene video y no se han completado los 3 min, el examen inicia bloqueado
            let tieneVideo = cap.videoUrl && cap.videoUrl.trim() !== "";
            let videoListo = !tieneVideo || videoCompletadoMap[cap.id] === true;

            let textoBotonExamen = sinIntentos ? 'Intentos Agotados' : 'Presentar Examen';
            let claseBotonExamen = sinIntentos ? 'btn-secondary' : (videoListo ? 'btn-success' : 'btn-secondary');
            let disabledExamenAttr = (sinIntentos || !videoListo) ? 'disabled' : '';

            botonExamenOAccion = `
                <button id="btnExamen_${cap.id}" class="btn ${claseBotonExamen} rounded-pill fw-bold w-100" ${disabledExamenAttr} onclick="iniciarExamen('${cap.id}')">
                    <i class="fas fa-file-alt me-2"></i> ${textoBotonExamen}
                </button>
            `;
        }

        let botonPdfHtml = "";
        if (cap.pdfUrl && cap.pdfUrl.trim() !== "") {
            botonPdfHtml = `
                <div class="d-grid gap-2 mb-2">
                    <button class="btn btn-outline-primary rounded-pill fw-bold" onclick="abrirVisorPDF('${cap.pdfUrl}')">
                        <i class="fas fa-file-pdf me-2"></i> 1. Leer Documento PDF
                    </button>
                </div>
            `;
        }

        let botonVideoHtml = "";
        if (cap.videoUrl && cap.videoUrl.trim() !== "") {
            let yaVisto = videoCompletadoMap[cap.id] === true;
            let timerActivo = videoTimersMap[cap.id] !== undefined;

            let estadoVideoHtml = "";
            if (yaVisto) {
                estadoVideoHtml = `<span class="badge bg-success mt-1 d-block"><i class="fas fa-check-circle"></i> Video visto (3 min cumplidos) - Examen habilitado</span>`;
            } else if (timerActivo) {
                estadoVideoHtml = `<span id="timer_video_lbl_${cap.id}" class="badge bg-warning text-dark mt-1 d-block"><i class="fas fa-clock fa-spin"></i> Vistas el video... (Esperando 3 min)</span>`;
            } else {
                estadoVideoHtml = `<span class="badge bg-secondary mt-1 d-block">Obligatorio: Ver video 3 minutos para desbloquear evaluación</span>`;
            }

            botonVideoHtml = `
                <div class="d-grid gap-2 mb-2">
                    <a href="${cap.videoUrl}" target="_blank" class="btn btn-outline-danger rounded-pill fw-bold" onclick="iniciarTemporizadorVideo('${cap.id}', '${cap.videoUrl}')">
                        <i class="fab fa-youtube me-2"></i> Ver Video de Estudio (3 min)
                    </a>
                    ${estadoVideoHtml}
                </div>
            `;
        }

        let cardHtml = `
            <div class="col-md-6">
                <div class="card shadow-sm border-0 rounded-4 h-100">
                    <div class="card-body p-4 d-flex flex-column justify-content-between">
                        <div>
                            ${bannerAprobado}
                            <span class="badge bg-primary mb-2">${cap.categoria}</span>
                            <h5 class="fw-bold text-dark">${cap.nombre}</h5>
                            <p class="text-muted small mb-3">${cap.descripcion}</p>
                            <ul class="list-unstyled small text-secondary mb-3">
                                <li><i class="fas fa-clock me-2 text-primary"></i> Duración: ${cap.duracion} horas</li>
                                <li><i class="fas fa-user-tie me-2 text-primary"></i> Responsable: ${cap.responsable}</li>
                                <li><i class="fas fa-award me-2 text-primary"></i> Nota mínima: ${cap.notaMinima}%</li>
                                <li class="mt-2"><i class="fas fa-redo me-2 ${sinIntentos ? 'text-danger' : 'text-primary'}"></i> Intentos: <span class="fw-bold">${etiquetaIntentos}</span></li>
                            </ul>
                        </div>
                        <div>
                            ${!cap.yaAprobo ? `${botonPdfHtml}${botonVideoHtml}` : ''}
                            <div class="d-grid gap-2 mt-2">${botonExamenOAccion}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (cap.yaAprobo) contenedorCulminadas.innerHTML += cardHtml;
        else contenedorPendientes.innerHTML += cardHtml;
    });

    if (contadorPendientes === 0) contenedorPendientes.innerHTML = `<div class="col-12"><div class="alert alert-light border text-center text-muted py-3 small">No hay capacitaciones pendientes.</div></div>`;
    if (contadorCulminadas === 0) contenedorCulminadas.innerHTML = `<div class="col-12"><div class="alert alert-light border text-center text-muted py-3 small">Sin capacitaciones culminadas.</div></div>`;
}

// Función para activar el temporizador obligatorio de 3 min al hacer clic en ver video
function iniciarTemporizadorVideo(capId, urlVideo) {
    if (videoCompletadoMap[capId] === true || videoTimersMap[capId] !== undefined) return;

    let segundosRestantes = 180; // 3 minutos exactos
    videoTimersMap[capId] = setInterval(() => {
        segundosRestantes--;
        let min = Math.floor(segundosRestantes / 60);
        let seg = segundosRestantes % 60;
        let tiempoStr = `${min}:${seg < 10 ? '0' : ''}${seg}`;

        let lbl = document.getElementById(`timer_video_lbl_${capId}`);
        if (lbl) {
            lbl.className = "badge bg-warning text-dark mt-1 d-block";
            lbl.innerHTML = `<i class="fas fa-clock fa-spin"></i> Tiempo de estudio restante: ${tiempoStr}`;
        }

        if (segundosRestantes <= 0) {
            clearInterval(videoTimersMap[capId]);
            delete videoTimersMap[capId];
            videoCompletadoMap[capId] = true;

            alert('¡Tiempo de estudio del video completado! Ya puedes presentar tu evaluación.');
            if (cacheCapacitacionesUsuario) {
                renderizarCapacitacionesUsuario(cacheCapacitacionesUsuario);
            }
        }
    }, 1000);
}

function abrirVisorPDF(urlPdf) {
    document.getElementById('vistaListaCapacitaciones').classList.add('d-none');
    document.getElementById('vistaVisorPDF').classList.remove('d-none');
    let urlEmbed = urlPdf;
    if (urlPdf.includes('drive.google.com')) {
        urlEmbed = urlPdf.replace('/view?usp=drivesdk', '/preview').replace('/edit?usp=sharing', '/preview');
        let match = urlPdf.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) urlEmbed = `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    document.getElementById('iframePdfViewer').src = urlEmbed;
}

function cerrarVisorPDF() {
    document.getElementById('iframePdfViewer').src = "";
    document.getElementById('vistaVisorPDF').classList.add('d-none');
    document.getElementById('vistaListaCapacitaciones').classList.remove('d-none');
}

function cargarCapacitacionesParaUsuario() {
    regresarAListaCapacitaciones();
    if (cacheCapacitacionesUsuario) {
        renderizarCapacitacionesUsuario(cacheCapacitacionesUsuario);
        return;
    }

    const contenedorPendientes = document.getElementById('contenedorCapacitacionesPendientes');
    if(contenedorPendientes) contenedorPendientes.innerHTML = `<div class="col-12 text-center py-4"><i class="fas fa-spinner fa-spin fa-2x text-primary"></i><p class="mt-2 text-muted">Cargando...</p></div>`;

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'obtenerCapacitacionesUsuario', identificacionUsuario: usuarioIdentificacionGlobal })
    })
    .then(res => res.json())
    .then(res => {
        if(res.success) {
            cacheCapacitacionesUsuario = res.capacitaciones;
            renderizarCapacitacionesUsuario(cacheCapacitacionesUsuario);
        } else {
            if(contenedorPendientes) contenedorPendientes.innerHTML = `<div class="col-12"><div class="alert alert-danger text-center p-4">Error al cargar.</div></div>`;
        }
    })
    .catch(err => { if(contenedorPendientes) contenedorPendientes.innerHTML = `<div class="col-12"><div class="alert alert-danger">Error de red</div></div>`; });
}

function iniciarExamen(capId) {
    const contenedorPreguntas = document.getElementById('contenedorPreguntaActual');
    contenedorPreguntas.innerHTML = `<div class="text-center py-5"><i class="fas fa-spinner fa-spin fa-2x text-primary"></i><p class="mt-2 text-muted">Cargando cuestionario...</p></div>`;

    document.getElementById('vistaListaCapacitaciones').classList.add('d-none');
    document.getElementById('vistaExamenInteractivo').classList.remove('d-none');

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'obtenerExamenCapacitacion', idCapacitacion: capId, identificacionUsuario: usuarioIdentificacionGlobal })
    })
    .then(res => res.json())
    .then(res => {
        if(res.success) {
            // CORRECCIÓN DEL BUG DE PREGUNTA FANTASMA (Filtra objetos vacíos o nulos)
            let preguntasValidas = (res.preguntas || []).filter(p => p && p.pregunta && p.pregunta.trim() !== "");

            res.preguntas = preguntasValidas;
            examenActualGlobal = res;
            indicePreguntaActual = 0;
            respuestasUsuarioMap = {};
            document.getElementById('tituloExamenCap').textContent = `Evaluación: ${res.nombreCapacitacion}`;
            
            construirCuadrosNavegacion();
            mostrarPreguntaActual();
        } else {
            contenedorPreguntas.innerHTML = `<div class="alert alert-danger p-4 text-center"><h5>Error</h5><p>${res.error}</p></div>`;
        }
    })
    .catch(err => contenedorPreguntas.innerHTML = `<div class="alert alert-danger">Error de red: ${err}</div>`);
}

function construirCuadrosNavegacion() {
    const contenedorCuadros = document.getElementById('cuadrosNavegacionPreguntas');
    contenedorCuadros.innerHTML = "";

    examenActualGlobal.preguntas.forEach((p, idx) => {
        let cuadro = document.createElement('div');
        cuadro.className = `cuadro-pregunta ${idx === 0 ? 'actual' : ''}`;
        cuadro.id = `cuadro_preg_${idx}`;
        cuadro.textContent = idx + 1;
        cuadro.onclick = function() {
            salvarRespuestaActual();
            indicePreguntaActual = idx;
            mostrarPreguntaActual();
        };
        contenedorCuadros.appendChild(cuadro);
    });
}

function mostrarPreguntaActual() {
    if (!examenActualGlobal) return;
    const p = examenActualGlobal.preguntas[indicePreguntaActual];
    const contenedor = document.getElementById('contenedorPreguntaActual');

    let opcionesHtml = "";
    if (p.opciones && p.opciones.length > 0) {
        p.opciones.forEach(op => {
            let seleccionada = respuestasUsuarioMap[indicePreguntaActual] === op ? 'checked' : '';
            opcionesHtml += `
                <div class="form-check mb-3">
                    <input class="form-check-input" type="radio" name="opcionRespuesta" value="${op}" id="op_${p.id}_${op}" ${seleccionada} onchange="registrarRespuestaSeleccionada('${op}')">
                    <label class="form-check-label text-dark fs-6" for="op_${p.id}_${op}">${op}</label>
                </div>
            `;
        });
    }

    contenedor.innerHTML = `
        <div class="p-4 border rounded-4 bg-light">
            <span class="badge bg-secondary mb-2">Pregunta ${indicePreguntaActual + 1} de ${examenActualGlobal.preguntas.length}</span>
            <h5 class="fw-bold text-dark mb-4">${p.pregunta}</h5>
            <div class="ps-2">${opcionesHtml}</div>
        </div>
    `;

    actualizarEstadoCuadros();
    actualizarBotonesNavegacion();
    reiniciarTemporizador();
}

function registrarRespuestaSeleccionada(valor) {
    respuestasUsuarioMap[indicePreguntaActual] = valor;
    let cuadro = document.getElementById(`cuadro_preg_${indicePreguntaActual}`);
    if (cuadro) cuadro.classList.add('respondida');
}

function salvarRespuestaActual() {
    const radioSeleccionado = document.querySelector('input[name="opcionRespuesta"]:checked');
    if (radioSeleccionado) {
        respuestasUsuarioMap[indicePreguntaActual] = radioSeleccionado.value;
        let cuadro = document.getElementById(`cuadro_preg_${indicePreguntaActual}`);
        if (cuadro) cuadro.classList.add('respondida');
    }
}

function actualizarEstadoCuadros() {
    examenActualGlobal.preguntas.forEach((p, idx) => {
        let cuadro = document.getElementById(`cuadro_preg_${idx}`);
        if (cuadro) {
            cuadro.classList.remove('actual');
            if (idx === indicePreguntaActual) cuadro.classList.add('actual');
        }
    });
}

function actualizarBotonesNavegacion() {
    const btnAnterior = document.getElementById('btnAnteriorPregunta');
    const btnSiguiente = document.getElementById('btnSiguientePregunta');
    const btnFinalizar = document.getElementById('btnFinalizarExamen');

    if (indicePreguntaActual === 0) btnAnterior.classList.add('d-none');
    else btnAnterior.classList.remove('d-none');

    if (indicePreguntaActual === examenActualGlobal.preguntas.length - 1) {
        btnSiguiente.classList.add('d-none');
        btnFinalizar.classList.remove('d-none');
    } else {
        btnSiguiente.classList.remove('d-none');
        btnFinalizar.classList.add('d-none');
    }
}

function navegarPregunta(direccion) {
    salvarRespuestaActual();
    let nuevoIndice = indicePreguntaActual + direccion;
    if (nuevoIndice >= 0 && nuevoIndice < examenActualGlobal.preguntas.length) {
        indicePreguntaActual = nuevoIndice;
        mostrarPreguntaActual();
    }
}

function reiniciarTemporizador() {
    if (temporizadorInterval) clearInterval(temporizadorInterval);
    tiempoRestante = 60;
    const badgeCronometro = document.getElementById('cronometroExamen');
    badgeCronometro.innerHTML = `<i class="fas fa-clock me-1"></i> ${tiempoRestante}s`;

    temporizadorInterval = setInterval(() => {
        tiempoRestante--;
        badgeCronometro.innerHTML = `<i class="fas fa-clock me-1"></i> ${tiempoRestante}s`;
        if (tiempoRestante <= 0) {
            clearInterval(temporizadorInterval);
            if (indicePreguntaActual < examenActualGlobal.preguntas.length - 1) navegarPregunta(1);
            else confirmarEnvioExamen();
        }
    }, 1000);
}

function confirmarEnvioExamen() {
    salvarRespuestaActual();
    if (temporizadorInterval) clearInterval(temporizadorInterval);

    let totalPreguntas = examenActualGlobal.preguntas.length;
    let respondidas = Object.keys(respuestasUsuarioMap).length;

    if (respondidas < totalPreguntas) {
        if (!confirm(`Tienes ${totalPreguntas - respondidas} preguntas sin responder. ¿Enviar examen?`)) {
            reiniciarTemporizador();
            return;
        }
    }

    let respuestasFormato = [];
    examenActualGlobal.preguntas.forEach((p, idx) => {
        respuestasFormato.push({
            idPregunta: p.id,
            seleccionada: respuestasUsuarioMap[idx] || "",
            correcta: p.respuestaCorrecta
        });
    });

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
            action: 'calificarExamen',
            data: {
                identificacionUsuario: usuarioIdentificacionGlobal,
                idCapacitacion: examenActualGlobal.preguntas[0] ? examenActualGlobal.preguntas[0].idCap : '',
                notaMinima: examenActualGlobal.notaMinima,
                respuestas: respuestasFormato
            }
        })
    })
    .then(res => res.json())
    .then(res => {
        if(res.success) {
            cacheCapacitacionesUsuario = null;
            let califVal = parseFloat(res.calificacion);
            if (!isNaN(califVal) && califVal <= 1) califVal = Math.round(califVal * 100);

            let mensaje = `Calificación: ${califVal}%\nNota mínima requerida: ${examenActualGlobal.notaMinima}%\n\n`;
            if (res.aprueba) alert(mensaje + '¡FELICIDADES! Has aprobado.');
            else alert(mensaje + 'Lo sentimos, reprobaste.');
            cargarCapacitacionesParaUsuario();
        } else {
            alert('Error al calificar: ' + res.error);
        }
    })
    .catch(err => alert('Error de red: ' + err));
}

function regresarAListaCapacitaciones() {
    if (temporizadorInterval) clearInterval(temporizadorInterval);
    document.getElementById('vistaExamenInteractivo').classList.add('d-none');
    document.getElementById('vistaVisorPDF').classList.add('d-none');
    document.getElementById('vistaValidacionCertificado').classList.add('d-none');
    document.getElementById('vistaResultadoConsultaPublica').classList.add('d-none');
    document.getElementById('vistaListaCapacitaciones').classList.remove('d-none');
}

function regresarDesdeValidacion() {
    document.getElementById('vistaValidacionCertificado').classList.add('d-none');
    document.getElementById('cardPanelUsuario').classList.add('d-none');
    document.getElementById('cardBienvenidaQR').classList.remove('d-none');
    window.history.replaceState({}, document.title, window.location.pathname);
}
