document.addEventListener("DOMContentLoaded", () => {
    cargarInformes();
});

const consultasXQuery = {
    prestamosMasFrecuentes: `(: Libros más prestados :)
for $prestamo in doc("prestamos.xml")//prestamo
let $libro := $prestamo/libro
group by $id := $libro
let $veces := count($prestamo)
order by $veces descending
return <resultado><id>{$id}</id><veces>{$veces}</veces></resultado>`,

    mejoresValorados: `(: Libros mejor valorados :)
for $reseña in doc("reseñas.xml")//resena
let $idLibro := $reseña/@idLibro
let $puntuaciones := doc("reseñas.xml")//resena[@idLibro = $idLibro]/puntuacion
let $media := avg($puntuaciones)
order by $media descending
return <resultado><idLibro>{$idLibro}</idLibro><media>{format-number($media, "0.0")}</media></resultado>`,

    librosPorCategoria: `(: Número de libros por categoría :)
for $categoria in distinct-values(doc("libros.xml")//categoria)
let $conteo := count(doc("libros.xml")//libro[categoria = $categoria])
return <resultado><categoria>{$categoria}</categoria><conteo>{$conteo}</conteo></resultado>`,

    usuariosMasLeidos: `(: Usuarios con más libros leídos :)
for $usuario in distinct-values(doc("prestamos.xml")//prestamo/usuario)
let $libros := count(doc("prestamos.xml")//prestamo[usuario = $usuario])
order by $libros descending
return <resultado><usuario>{$usuario}</usuario><conteo>{$libros}</conteo></resultado>`
};

async function cargarInformes() {
    try {
        const [librosTexto, prestamosTexto, resenasTexto] = await Promise.all([
            fetch("libros.xml").then(res => res.text()),
            fetch("prestamos.xml").then(res => res.text()),
            fetch("reseñas.xml").then(res => res.text())
        ]);

        const parser = new DOMParser();
        const librosDoc = parser.parseFromString(librosTexto, "application/xml");
        const prestamosDoc = parser.parseFromString(prestamosTexto, "application/xml");
        const resenasDoc = parser.parseFromString(resenasTexto, "application/xml");

        const libros = extraerLibros(librosDoc);
        const prestamos = extraerPrestamos(prestamosDoc);
        const resenas = extraerResenas(resenasDoc);

        mostrarConsultasXQuery();
        mostrarLibrosMasPrestados(libros, prestamos);
        mostrarLibrosMejorValorados(libros, resenas);
        mostrarLibrosPorCategoria(libros);
        mostrarUsuariosMasLeidos(prestamos);
        dibujarGraficas(libros, prestamos);
    } catch (error) {
        console.error("Error al cargar los informes:", error);
        const contenedor = document.getElementById("mensaje-error");
        if (contenedor) {
            contenedor.textContent = "No se pudieron cargar los datos de informe. Comprueba que los archivos XML estén disponibles.";
        }
    }
}

function extraerLibros(librosDoc) {
    const libroNodos = Array.from(librosDoc.getElementsByTagName("libro"));
    return libroNodos.map((libro, index) => ({
        id: String(index + 1),
        titulo: getTexto(libro, "titulo"),
        autor: getTexto(libro, "autor"),
        categoria: getTexto(libro, "categoria")
    }));
}

function extraerPrestamos(prestamosDoc) {
    return Array.from(prestamosDoc.getElementsByTagName("prestamo")).map(prestamo => ({
        idUsuario: getTexto(prestamo, "usuario"),
        idLibro: getTexto(prestamo, "libro"),
        estado: getTexto(prestamo, "estado")
    }));
}

function extraerResenas(resenasDoc) {
    return Array.from(resenasDoc.getElementsByTagName("resena")).map(resena => ({
        idLibro: resena.getAttribute("idLibro") || "",
        puntuacion: parseFloat(getTexto(resena, "puntuacion")) || 0
    }));
}

function getTexto(elemento, etiqueta) {
    const nodo = elemento.getElementsByTagName(etiqueta)[0];
    return nodo ? nodo.textContent.trim() : "";
}

function mostrarConsultasXQuery() {
    const contenedor = document.getElementById("consultas-xquery");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    for (const [titulo, consulta] of Object.entries(consultasXQuery)) {
        const panel = document.createElement("div");
        panel.className = "consulta-panel";

        const heading = document.createElement("h3");
        heading.textContent = obtenerTituloConsulta(titulo);
        panel.appendChild(heading);

        const pre = document.createElement("pre");
        pre.textContent = consulta;
        panel.appendChild(pre);

        contenedor.appendChild(panel);
    }
}

function obtenerTituloConsulta(clave) {
    switch (clave) {
        case "prestamosMasFrecuentes":
            return "Libros más prestados";
        case "mejoresValorados":
            return "Libros mejor valorados";
        case "librosPorCategoria":
            return "Libros por categoría";
        case "usuariosMasLeidos":
            return "Usuarios con más libros leídos";
        default:
            return "Consulta";
    }
}

function mostrarLibrosMasPrestados(libros, prestamos) {
    const contador = prestamos.reduce((mapa, prestamo) => {
        mapa[prestamo.idLibro] = (mapa[prestamo.idLibro] || 0) + 1;
        return mapa;
    }, {});

    const lista = Object.entries(contador)
        .map(([id, veces]) => ({
            id,
            veces,
            titulo: obtenerTituloLibro(libros, id)
        }))
        .sort((a, b) => b.veces - a.veces || a.titulo.localeCompare(b.titulo))
        .slice(0, 3);

    renderLista("libros-mas-prestados", lista, "veces", "prestamos");
}

function mostrarLibrosMejorValorados(libros, resenas) {
    const valores = resenas.reduce((mapa, resena) => {
        if (!mapa[resena.idLibro]) {
            mapa[resena.idLibro] = { total: 0, cantidad: 0 };
        }
        mapa[resena.idLibro].total += resena.puntuacion;
        mapa[resena.idLibro].cantidad += 1;
        return mapa;
    }, {});

    const lista = Object.entries(valores)
        .map(([id, datos]) => ({
            id,
            media: datos.total / datos.cantidad,
            titulo: obtenerTituloLibro(libros, id)
        }))
        .sort((a, b) => b.media - a.media || a.titulo.localeCompare(b.titulo))
        .slice(0, 3);

    const contenedor = document.getElementById("libros-mejor-valorados");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    lista.forEach(item => {
        const card = document.createElement("div");
        card.className = "resultado-item";
        card.innerHTML = `<strong>${item.titulo}</strong> <span>${item.media.toFixed(1)} / 10</span>`;
        contenedor.appendChild(card);
    });

    if (lista.length === 0) {
        contenedor.textContent = "No hay reseñas disponibles.";
    }
}

function mostrarLibrosPorCategoria(libros) {
    const contador = libros.reduce((mapa, libro) => {
        mapa[libro.categoria] = (mapa[libro.categoria] || 0) + 1;
        return mapa;
    }, {});

    const lista = Object.entries(contador)
        .map(([categoria, cantidad]) => ({ categoria, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad || a.categoria.localeCompare(b.categoria));

    renderLista("libros-por-categoria", lista, "cantidad", "libros");
}

function mostrarUsuariosMasLeidos(prestamos) {
    const contador = prestamos.reduce((mapa, prestamo) => {
        mapa[prestamo.idUsuario] = (mapa[prestamo.idUsuario] || 0) + 1;
        return mapa;
    }, {});

    const lista = Object.entries(contador)
        .map(([usuario, cantidad]) => ({ usuario, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad || a.usuario.localeCompare(b.usuario))
        .slice(0, 5);

    renderLista("usuarios-mas-leidos", lista, "cantidad", "libros leídos");
}

function obtenerTituloLibro(libros, id) {
    const libro = libros.find(lib => lib.id === id);
    return libro ? libro.titulo : `Libro ${id}`;
}

function renderLista(contenedorId, items, valorClave, leyenda) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    contenedor.innerHTML = "";

    if (items.length === 0) {
        contenedor.textContent = "No hay resultados disponibles.";
        return;
    }

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "resultado-item";
        const valor = item[valorClave];
        const texto = item.titulo || item.categoria || item.usuario || item.id;
        card.innerHTML = `<strong>${texto}</strong><span>${valor} ${leyenda}</span>`;
        contenedor.appendChild(card);
    });
}

function dibujarGraficas(libros, prestamos) {
    const categoriaContador = libros.reduce((mapa, libro) => {
        mapa[libro.categoria] = (mapa[libro.categoria] || 0) + 1;
        return mapa;
    }, {});

    const prestamosContador = prestamos.reduce((mapa, prestamo) => {
        mapa[prestamo.idLibro] = (mapa[prestamo.idLibro] || 0) + 1;
        return mapa;
    }, {});

    renderBarChart("grafico-categorias", Object.entries(categoriaContador).map(([categoria, cantidad]) => ({
        label: categoria,
        value: cantidad
    })), "Libros por categoría");

    renderBarChart("grafico-prestamos", Object.entries(prestamosContador).map(([libro, veces]) => ({
        label: obtenerTituloLibro(libros, libro),
        value: veces
    })).sort((a, b) => b.value - a.value).slice(0, 5), "Libros más prestados");
}

function renderBarChart(contenedorId, datos, titulo) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const maxValue = datos.reduce((max, item) => Math.max(max, item.value), 0);
    const tituloElemento = document.createElement("h3");
    tituloElemento.textContent = titulo;
    contenedor.appendChild(tituloElemento);

    datos.forEach(item => {
        const fila = document.createElement("div");
        fila.className = "barra-fila";

        const etiqueta = document.createElement("span");
        etiqueta.className = "barra-etiqueta";
        etiqueta.textContent = item.label;

        const barra = document.createElement("div");
        barra.className = "barra-base";
        const indicador = document.createElement("div");
        indicador.className = "barra-indicador";
        indicador.style.width = `${maxValue ? (item.value / maxValue) * 100 : 0}%`;
        indicador.textContent = item.value;

        barra.appendChild(indicador);
        fila.appendChild(etiqueta);
        fila.appendChild(barra);
        contenedor.appendChild(fila);
    });
}
