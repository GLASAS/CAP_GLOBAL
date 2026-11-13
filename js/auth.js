window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const validarCertId = urlParams.get('validar_certificado');
    const consultarIdentificacion = urlParams.get('consultar_certificaciones');
    const actionQR = urlParams.get('action');

    if (validarCertId) {
        document.getElementById('cardLogin').classList.add('d-none');
        document.getElementById('cardBienvenidaQR').classList.add('d-none');
        document.getElementById('cardConsultaCertificaciones').classList.add('d-none');
        document.getElementById('cardPanelUsuario').classList.remove('d-none');
        document.getElementById('vistaListaCapacitaciones').classList.add('d-none');
        document.getElementById('vistaValidacionCertificado').classList.remove('d-none');
        ejecutarValidacionPublicaCertificado(validarCertId);
    } else if (consultarIdentificacion) {
        document.getElementById('cardLogin').classList.add('d-none');
        document.getElementById('cardBienvenidaQR').classList.add('d-none');
        document.getElementById('cardConsultaCertificaciones').classList.add('d-none');
        document.getElementById('cardPanelUsuario').classList.remove('d-none');
        document.getElementById('vistaListaCapacitaciones').classList.add('d-none');
        document.getElementById('vistaResultadoConsultaPublica').classList.remove('d-none');
        ejecutarConsultaPublicaCertificaciones(consultarIdentificacion);
    } else if (actionQR === 'verificar') {
        document.getElementById('cardLogin').classList.add('d-none');
        document.getElementById('cardConsultaCertificaciones').classList.add('d-none');
        document.getElementById('cardBienvenidaQR').classList.remove('d-none');
    } else if (actionQR === 'consultar') {
        document.getElementById('cardLogin').classList.add('d-none');
        document.getElementById('cardBienvenidaQR').classList.add('d-none');
        document.getElementById('cardConsultaCertificaciones').classList.remove('d-none');
    }
});

function irALoginFuncionario() {
    document.getElementById('cardBienvenidaQR').classList.add('d-none');
    document.getElementById('cardConsultaCertificaciones').classList.add('d-none');
    document.getElementById('cardLogin').classList.remove('d-none');
    window.history.replaceState({}, document.title, window.location.pathname);
}

function irAValidarCertificadoDirecto() {
    let numeroIngresado = prompt("Por favor, ingrese el número de certificado o código de validación QR:");
    if (numeroIngresado && numeroIngresado.trim() !== "") {
        window.location.href = `${window.location.pathname}?validar_certificado=${encodeURIComponent(numeroIngresado.trim())}`;
    }
}

function irAConsultaPublicaCertificaciones() {
    document.getElementById('cardBienvenidaQR').classList.add('d-none');
    document.getElementById('cardLogin').classList.add('d-none');
    document.getElementById('cardConsultaCertificaciones').classList.remove('d-none');
    window.history.replaceState({}, document.title, `${window.location.pathname}?action=consultar`);
}

function regresarDesdeConsultaPublica() {
    document.getElementById('cardConsultaCertificaciones').classList.add('d-none');
    document.getElementById('cardPanelUsuario').classList.add('d-none');
    document.getElementById('vistaResultadoConsultaPublica').classList.add('d-none');
    document.getElementById('cardBienvenidaQR').classList.remove('d-none');
    window.history.replaceState({}, document.title, `${window.location.pathname}?action=verificar`);
}

document.getElementById('formConsultaPublica').addEventListener('submit', function(e) {
    e.preventDefault();
    const identificacion = document.getElementById('inputIdentificacionConsulta').value.trim();
    if (!identificacion) return;
    window.location.href = `${window.location.pathname}?consultar_certificaciones=${encodeURIComponent(identificacion)}`;
});

document.getElementById('formLogin').addEventListener('submit', function(e) {
    e.preventDefault();
    const usuario = document.getElementById('inputUsuario').value.trim();
    const password = document.getElementById('inputPassword').value.trim();
    const salida = document.getElementById('resultadoLogin');

    salida.innerHTML = `<div class="alert alert-info py-2 text-center small"><i class="fas fa-spinner fa-spin me-2"></i> Verificando credenciales...</div>`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'verificarAdmin', usuario: usuario, password: password }),
        signal: controller.signal
    })
    .then(res => {
        clearTimeout(timeoutId);
        return res.json();
    })
    .then(res => {
        if(res.success) {
            document.getElementById('cardLogin').classList.add('d-none');
            document.getElementById('nombreAdminLogueado').innerText = res.nombre;
            document.getElementById('nombreUsuarioLogueado').innerText = res.nombre;
            usuarioIdentificacionGlobal = res.identificacion;

            if (res.esAdmin) {
                usuarioPuedeModificar = res.puedeModificar;
                
                const seccionSelector = document.getElementById('seccionSelectorModificacion');
                const liGestion = document.getElementById('liTabGestion');
                const liRegistrar = document.getElementById('liTabRegistrarUsuario');
                const liReportes = document.getElementById('liTabReportes');

                if (liGestion) liGestion.classList.remove('d-none');
                if (liRegistrar) liRegistrar.classList.remove('d-none');

                if (usuarioPuedeModificar) {
                    if (seccionSelector) seccionSelector.classList.remove('d-none');
                    if (liReportes) liReportes.classList.remove('d-none');
                } else {
                    if (seccionSelector) seccionSelector.classList.add('d-none');
                    if (liReportes) liReportes.classList.add('d-none');
                }

                precargarDatosAdmin();

                document.getElementById('btnVolverAdmin').classList.remove('d-none');
                document.getElementById('cardPanelAdmin').classList.remove('d-none');
            } else {
                document.getElementById('btnVolverAdmin').classList.add('d-none');
                document.getElementById('cardPanelUsuario').classList.remove('d-none');
                cargarCapacitacionesParaUsuario();
            }
        } else {
            salida.innerHTML = `<div class="alert alert-danger py-2 text-center small"><i class="fas fa-ban me-2"></i> ${res.error || 'Acceso denegado.'}</div>`;
        }
    })
    .catch(err => {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            salida.innerHTML = `<div class="alert alert-warning py-2 text-center small"><i class="fas fa-exclamation-triangle me-2"></i> La carga tardó demasiado. Reintenta.</div>`;
        } else {
            salida.innerHTML = `<div class="alert alert-danger py-2 text-center small">Error de red: ${err.message}</div>`;
        }
    });
});
