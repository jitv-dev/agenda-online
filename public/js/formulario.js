// Mostrar u ocultar el selector de cliente según si es pública o privada
function toggleClienteSelector() {
    const esPrivada = document.getElementById('reunionPrivada')?.checked;
    const container = document.getElementById('clienteSelectorContainer');
    const selectCliente = document.getElementById('clienteId');

    if (!container || !selectCliente) return;

    if (esPrivada) {
        container.style.display = 'block';
        selectCliente.required = true;
    } else {
        container.style.display = 'none';
        selectCliente.required = false;
        selectCliente.value = '';
    }
}

// Validar que si es privada tenga cliente seleccionado
function validarFormularioCrear(e) {
    const esPrivada = document.getElementById('reunionPrivada')?.checked;
    const clienteId = document.getElementById('clienteId')?.value;

    if (esPrivada && !clienteId) {
        e.preventDefault();
        alert('Debes seleccionar un cliente para reuniones privadas');
        return false;
    }

    return true;
}

// Funciones para editar reunión

// Mostrar u ocultar el selector cuando se marca cambiar cliente
function toggleCambiarCliente() {
    const checkbox = document.getElementById('cambiarCliente');
    const container = document.getElementById('selectorClienteContainer');
    const selectCliente = document.getElementById('clienteId');

    if (!checkbox || !container || !selectCliente) return;

    if (checkbox.checked) {
        container.style.display = 'block';
        selectCliente.required = true;
    } else {
        container.style.display = 'none';
        selectCliente.required = false;
        selectCliente.value = '';
    }
}

// Validar que si marcó cambiar cliente, haya seleccionado uno
function validarFormularioEditar(e) {
    const cambiarCliente = document.getElementById('cambiarCliente')?.checked;
    const clienteId = document.getElementById('clienteId')?.value;

    if (cambiarCliente && !clienteId) {
        e.preventDefault();
        alert('Debes seleccionar un cliente si marcaste "Cambiar cliente"');
        return false;
    }

    return true;
}

// Inicializar tooltips de Bootstrap
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(el => {
        try {
            new bootstrap.Tooltip(el);
        } catch (error) {
            console.warn('Error inicializando tooltip:', error);
        }
    });
}

// Configurar el formulario de crear
function initFormularioCrear() {
    const form = document.getElementById('formReunion');
    if (!form) return;

    form.addEventListener('submit', validarFormularioCrear);

    // Los radio buttons de público/privado
    const radioPublica = document.getElementById('reunionPublica');
    const radioPrivada = document.getElementById('reunionPrivada');

    if (radioPublica) radioPublica.addEventListener('change', toggleClienteSelector);
    if (radioPrivada) radioPrivada.addEventListener('change', toggleClienteSelector);
}

// Configurar el formulario de editar
function initFormularioEditar() {
    const form = document.getElementById('formEditarReunion');
    if (!form) return;

    form.addEventListener('submit', validarFormularioEditar);

    // El checkbox de cambiar cliente
    const checkbox = document.getElementById('cambiarCliente');
    if (checkbox) checkbox.addEventListener('change', toggleCambiarCliente);
}

// Poner la fecha mínima como hoy
function setMinDate() {
    const fechaInput = document.getElementById('fecha');
    if (!fechaInput) return;

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const minDate = `${year}-${month}-${day}`;

    fechaInput.setAttribute('min', minDate);
}

// Cuando carga la página, inicializar todo
document.addEventListener('DOMContentLoaded', function () {
    initTooltips();
    initFormularioCrear();
    initFormularioEditar();
    setMinDate();
});