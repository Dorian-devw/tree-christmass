// --- CONFIGURACIÓN ---
const TOTAL_ADORNOS = 25; // Debes tener adorno_1.png ... adorno_25.png
const ADORNOS_ANCHOS = [10, 11, 12, 13, 14, 15, 22, 23];
const cajaAdornos = document.getElementById('caja-adornos');
const zonaArbol = document.getElementById('zona-arbol');
const textoDia = document.getElementById('dia-numero');

// --- FECHA ACTUAL ---
const fechaHoy = new Date();
// IMPORTANTE: Para probar hoy, pon manualmente: let diaActual = 1;
// Para la versión final deja: fechaHoy.getDate();
let diaActual = fechaHoy.getDate(); 
let mesActual = fechaHoy.getMonth() + 1; // 12 es Diciembre

// Validación simple: Si no es diciembre, forzamos a día 0 o mensaje
if (mesActual !== 12) {
    alert("¡Vuelve en Diciembre!");
    diaActual = 1; // Modo prueba si quieres
}

textoDia.innerText = diaActual;

// Estado Global    
let idAdornoSeleccionado = null; 
let adornosUsadosMap = {}; // Mapa para saber qué adorno se usó qué día


// --- NUEVA FUNCIÓN PARA EL MENÚ ---
function toggleMenu() {
    const panel = document.getElementById('panel-lateral');
    panel.classList.toggle('abierto');
}

// --- 1. CARGAR ESTADO GUARDADO ---
function cargarEstado() {
    // Revisamos los 25 días posibles
    for (let d = 1; d <= 25; d++) {
        const datosDia = localStorage.getItem(`navidad_dia_${d}`);
        if (datosDia) {
            const data = JSON.parse(datosDia);
            // data = { idAdorno: 5, x: 50, y: 50 }
            
            // Registramos que el adorno X ya se usó
            adornosUsadosMap[data.idAdorno] = d; 
            
            // Dibujamos en el árbol
            dibujarAdornoEnArbol(data.idAdorno, data.x, data.y, d);
        }
    }
}

// --- 2. RENDERIZAR LA CAJA DE ADORNOS ---
function renderizarCaja() {
    cajaAdornos.innerHTML = ''; // Limpiar

    for (let i = 1; i <= TOTAL_ADORNOS; i++) {
        const div = document.createElement('div');
        div.classList.add('item-caja');
        
        // Verificar si este adorno ya fue usado en OTRO día
        const diaEnQueSeUso = adornosUsadosMap[i];
        
        // Lógica de Bloqueo:
        // Si se usó en un día pasado (no hoy), está bloqueado.
        // Si se usó HOY, está activo (para poder moverlo o reelegirlo).
        if (diaEnQueSeUso && diaEnQueSeUso !== diaActual) {
            div.classList.add('usado');
            div.title = `Usado el día ${diaEnQueSeUso}`;
        }

        // Si es el que tengo seleccionado actualmente
        if (idAdornoSeleccionado === i) {
            div.classList.add('seleccionado');
        }

        // Imagen
        div.innerHTML = `<img src="img/adorno_${i}.png">`;

        // Click para seleccionar
        div.addEventListener('click', () => {
            if (!div.classList.contains('usado')) {
                seleccionarAdorno(i);
            }
        });

        cajaAdornos.appendChild(div);
    }
}

// --- 3. SELECCIONAR ADORNO ---
function seleccionarAdorno(id) {
    // Si cambio de opinión y elijo otro, actualizamos variable
    idAdornoSeleccionado = id;
    
    // Refrescamos visualmente la caja (para ver el borde verde)
    // Nota: Es un poco ineficiente redibujar todo, pero para 25 items es instantáneo y evita bugs.
    renderizarCaja(); 

    // --- AGREGADO: CERRAR MENÚ AUTOMÁTICAMENTE ---
    // Si la pantalla es pequeña (celular), cerramos el menú al elegir
    if (window.innerWidth < 800) {
        toggleMenu(); 
    }
}

// --- 4. COLOCAR EN EL ARBOL ---
zonaArbol.addEventListener('click', (e) => {
    // Si no es un día válido (ej: día 26 o noviembre), no hacer nada
    if (diaActual > 25) return;

    if (!idAdornoSeleccionado) {
        alert("¡Escoge un adorno de la caja primero!😂😂");
        return;
    }

    // Calcular coordenadas %
    const rect = zonaArbol.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // --- REGLA DE ORO: 1 ADORNO POR DÍA ---
    // Si ya pusimos un adorno HOY, tenemos que borrar el anterior de la pantalla
    // para poner el nuevo (o mover el mismo).
    
    // Buscar si ya había guardado algo hoy
    const datosHoyPrevia = localStorage.getItem(`navidad_dia_${diaActual}`);
    if (datosHoyPrevia) {
        const data = JSON.parse(datosHoyPrevia);
        // Liberar el adorno que usaba antes en el mapa
        delete adornosUsadosMap[data.idAdorno];
        // Borrarlo visualmente
        const elementoViejo = document.getElementById(`adorno-visual-${data.idAdorno}`);
        if(elementoViejo) elementoViejo.remove();
    }

    // Guardar nuevo estado
    const nuevoEstado = { idAdorno: idAdornoSeleccionado, x: x, y: y };
    localStorage.setItem(`navidad_dia_${diaActual}`, JSON.stringify(nuevoEstado));
    
    // Actualizar mapa de usados
    adornosUsadosMap[idAdornoSeleccionado] = diaActual;

    // Dibujar
    dibujarAdornoEnArbol(idAdornoSeleccionado, x, y, diaActual);
    
    // Refrescar caja (ahora este adorno figurará como usado por 'diaActual')
    renderizarCaja();
});

function dibujarAdornoEnArbol(id, x, y, diaOwner) {
    // Evitar duplicados visuales si el script corre dos veces
    const existente = document.getElementById(`adorno-visual-${id}`);
    if (existente) existente.remove();

    const img = document.createElement('img');
    img.src = `img/adorno_${id}.png`;
    img.id = `adorno-visual-${id}`; // ID único visual
    img.classList.add('adorno-puesto');

    // --- ¡NUEVO CÓDIGO AQUÍ! ---
    // Verificamos si este ID está en nuestra lista de "anchos"
    // NOTA: Usamos parseInt(id) por si el id viene como texto.
    if (ADORNOS_ANCHOS.includes(parseInt(id))) {
        img.classList.add('adorno-ancho');
    }
    // ---------------------------
    
    img.style.left = x + '%';
    img.style.top = y + '%';
    img.style.zIndex = Math.floor(y);
    // Z-index basado en 'y' para dar sensación de profundidad (opcional)

    zonaArbol.appendChild(img);
}

// --- INICIALIZAR ---
cargarEstado();

renderizarCaja();
