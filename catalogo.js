// Variables globales
let todosLosLibros = [];
let librosFiltrados = [];
const librosPorPagina = 6;
let paginaActual = 1;

document.addEventListener("DOMContentLoaded", () => {
    cargarLibros();
});

// Cargar libros desde XML
async function cargarLibros() {
    try {
        const respuesta = await fetch("libros.xml");
        const textoXML = await respuesta.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textoXML, "application/xml");

        const nodos = xmlDoc.getElementsByTagName("libro");
        todosLosLibros = Array.from(nodos).map((nodo, index) => ({
            id: index + 1,
            titulo: nodo.getElementsByTagName("titulo")[0]?.textContent || "",
            autor: nodo.getElementsByTagName("autor")[0]?.textContent || "",
            isbn: nodo.getElementsByTagName("isbn")[0]?.textContent || "",
            categoria: nodo.getElementsByTagName("categoria")[0]?.textContent || ""
        }));

        librosFiltrados = [...todosLosLibros];
        llenarCategorias();
        mostrarLibros();
        mostrarPaginacion();
    } catch (error) {
        console.error("Error:", error);
    }
}

function llenarCategorias() {
    const cats = [...new Set(todosLosLibros.map(l => l.categoria))];
    const select = document.getElementById("filtro-categoria");
    cats.sort().forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

document.getElementById("btn-aplicar-filtros")?.addEventListener("click", () => {
    const cat = document.getElementById("filtro-categoria").value;
    const aut = document.getElementById("filtro-autor").value.toLowerCase();
    const tit = document.getElementById("filtro-titulo").value.toLowerCase();
    const isbn = document.getElementById("filtro-isbn").value.toLowerCase();

    librosFiltrados = todosLosLibros.filter(l => {
        return (!cat || l.categoria === cat) &&
               (!aut || l.autor.toLowerCase().includes(aut)) &&
               (!tit || l.titulo.toLowerCase().includes(tit)) &&
               (!isbn || l.isbn.toLowerCase().includes(isbn));
    });

    paginaActual = 1;
    mostrarLibros();
    mostrarPaginacion();
});

document.getElementById("btn-limpiar-filtros")?.addEventListener("click", () => {
    document.getElementById("filtro-categoria").value = "";
    document.getElementById("filtro-autor").value = "";
    document.getElementById("filtro-titulo").value = "";
    document.getElementById("filtro-isbn").value = "";
    librosFiltrados = [...todosLosLibros];
    paginaActual = 1;
    mostrarLibros();
    mostrarPaginacion();
});

document.getElementById("cerrar-modal")?.addEventListener("click", () => {
    document.getElementById("modal-detalles").classList.remove("active");
});

document.getElementById("modal-detalles")?.addEventListener("click", (e) => {
    if (e.target.id === "modal-detalles") 
        document.getElementById("modal-detalles").classList.remove("active");
});

document.getElementById("formulario-agregar")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const titulo = document.getElementById("nuevo-titulo").value;
    const autor = document.getElementById("nuevo-autor").value;
    const isbn = document.getElementById("nuevo-isbn").value;
    const categoria = document.getElementById("nueva-categoria").value;

    if (!titulo || !autor || !isbn || !categoria) {
        alert("Rellena todos los campos");
        return;
    }

    todosLosLibros.push({
        id: todosLosLibros.length + 1,
        titulo,
        autor,
        isbn,
        categoria
    });

    librosFiltrados = [...todosLosLibros];
    document.getElementById("formulario-agregar").reset();
    alert("Libro añadido");
    
    paginaActual = Math.ceil(todosLosLibros.length / librosPorPagina);
    mostrarLibros();
    mostrarPaginacion();
});

// Mostrar libros en la página
function mostrarLibros() {
    const contenedor = document.getElementById("libros-grid");
    contenedor.innerHTML = "";

    if (librosFiltrados.length === 0) {
        contenedor.innerHTML = '<div class="sin-resultados">Sin resultados</div>';
        return;
    }

    const inicio = (paginaActual - 1) * librosPorPagina;
    const fin = inicio + librosPorPagina;
    const librosAMostrar = librosFiltrados.slice(inicio, fin);

    librosAMostrar.forEach(libro => {
        const card = document.createElement("div");
        card.className = "libro-card";
        card.innerHTML = `
            <div class="libro-header">
                <h3>${libro.titulo}</h3>
            </div>
            <div class="libro-body">
                <div class="libro-categoria">${libro.categoria}</div>
                <div class="libro-info"><strong>Autor:</strong> ${libro.autor}</div>
                <div class="libro-info"><strong>ISBN:</strong> ${libro.isbn}</div>
                <div class="libro-acciones">
                    <button class="btn-detalles" onclick="verDetalles(${libro.id})">Detalles</button>
                    <button class="btn-eliminar" onclick="borrarLibro(${libro.id})">Eliminar</button>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function verDetalles(id) {
    const libro = todosLosLibros.find(l => l.id === id);
    if (!libro) return;

    document.getElementById("detalles-titulo").textContent = libro.titulo;
    document.getElementById("detalles-contenido").innerHTML = `
        <div class="detalles-libro">
            <div class="detalle-fila"><strong>Título:</strong> <span>${libro.titulo}</span></div>
            <div class="detalle-fila"><strong>Autor:</strong> <span>${libro.autor}</span></div>
            <div class="detalle-fila"><strong>ISBN:</strong> <span>${libro.isbn}</span></div>
            <div class="detalle-fila"><strong>Categoría:</strong> <span>${libro.categoria}</span></div>
        </div>
    `;
    document.getElementById("modal-detalles").classList.add("active");
}

// Mostrar detalles del libro en modal
function mostrarDetallesLibro(id) {
    verDetalles(id);
}

// Cerrar modal
function cerrarModal() {
    document.getElementById("modal-detalles").classList.remove("active");
}

// Mostrar paginación
function mostrarPaginacion() {
    const contenedor = document.getElementById("paginacion");
    contenedor.innerHTML = "";

    const totalPaginas = Math.ceil(librosFiltrados.length / librosPorPagina);
    if (totalPaginas <= 1) return;

    // Anterior
    const btnAnt = document.createElement("button");
    btnAnt.textContent = "← Anterior";
    btnAnt.disabled = paginaActual === 1;
    btnAnt.onclick = () => {
        if (paginaActual > 1) {
            paginaActual--;
            mostrarLibros();
            mostrarPaginacion();
        }
    };
    contenedor.appendChild(btnAnt);

    // Números
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === paginaActual) {
            const span = document.createElement("span");
            span.textContent = i;
            span.style.padding = "6px 10px";
            span.style.background = "#7a3db8";
            span.style.color = "white";
            contenedor.appendChild(span);
        } else {
            const btn = document.createElement("button");
            btn.textContent = i;
            btn.onclick = () => {
                paginaActual = i;
                mostrarLibros();
                mostrarPaginacion();
                window.scrollTo(0, 0);
            };
            contenedor.appendChild(btn);
        }
    }

    // Siguiente
    const btnSig = document.createElement("button");
    btnSig.textContent = "Siguiente →";
    btnSig.disabled = paginaActual === totalPaginas;
    btnSig.onclick = () => {
        if (paginaActual < totalPaginas) {
            paginaActual++;
            mostrarLibros();
            mostrarPaginacion();
        }
    };
    contenedor.appendChild(btnSig);
}

function borrarLibro(id) {
    if (confirm("¿Eliminar este libro?")) {
        todosLosLibros = todosLosLibros.filter(l => l.id !== id);
        librosFiltrados = librosFiltrados.filter(l => l.id !== id);
        
        const totalPaginas = Math.ceil(librosFiltrados.length / librosPorPagina);
        if (paginaActual > totalPaginas && totalPaginas > 0) {
            paginaActual = totalPaginas;
        }

        mostrarLibros();
        mostrarPaginacion();
    }
}

function agregarLibro(e) {
    e.preventDefault();
}

// Mostrar mensaje
function mostrarMensaje(texto, tipo) {
    const elemento = document.getElementById("mensaje");
    elemento.textContent = texto;
    elemento.className = `mensaje ${tipo}`;
    
    setTimeout(() => {
        elemento.className = "mensaje";
    }, 3000);
}   