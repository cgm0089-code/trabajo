// En primer lugar, vamos a crear variables globales
let xmlReseñas;
let xslReseñas;

// Paso 1 y 2: Cargar el XML y el XSL al abrir la página.
document.addEventListener("DOMContentLoaded", function() {
    fetch("reseñas.xml")
        .then(function(respuesta) {
            return respuesta.text();
        })
        .then(function(texto) {
            const parser = new DOMParser();
            xmlReseñas = parser.parseFromString(texto, "application/xml");
            return fetch("reseñas.xsl");
        })
        .then(function(respuesta) {
            return respuesta.text();
        })
        .then(function(xslTexto) {
            const parser = new DOMParser();
            xslReseñas = parser.parseFromString(xslTexto, "application/xml");
            mostrarResenas();
            actualizarMedia();
        })
        .catch(function(error) {
            console.error("Error al cargar los archivos:", error);
        });

    // Paso 4: Escuchar el formulario
    const formulario = document.getElementById("formulario-resenas");
    if (formulario) {
        formulario.addEventListener("submit", function(e) {
            e.preventDefault();
            añadirResena();
        });
    }
});

// Función que aplica XSLT y vuelca el resultado en el div
function mostrarResenas() {
    const procesador = new XSLTProcessor();
    procesador.importStylesheet(xslReseñas);

    const resultado = procesador.transformToFragment(xmlReseñas, document);

    const contenedor = document.getElementById("lista-resenas");
    if (contenedor) {
        contenedor.innerHTML = "";
        contenedor.appendChild(resultado);
    }
}

// Paso 4: Añadir nueva reseña al XML usando DOM
function añadirResena() {
    const usuario = document.getElementById("nuevo-usuario").value.trim();
    const puntuacion = document.getElementById("nueva-puntuacion").value.trim();
    const comentario = document.getElementById("nuevo-comentario").value.trim();
    const idLibro = document.getElementById("nuevo-idLibro").value.trim();
    const fecha = new Date().toLocaleDateString("es-ES");

    if (!usuario || !puntuacion || !comentario || !idLibro) {
        alert("Todos los campos son obligatorios");
        return;
    }

    const nuevaResena = xmlReseñas.createElement("resena");
    nuevaResena.setAttribute("idLibro", idLibro);

    const nUsuario = xmlReseñas.createElement("usuario");
    const nPuntuacion = xmlReseñas.createElement("puntuacion");
    const nComentario = xmlReseñas.createElement("comentario");
    const nFecha = xmlReseñas.createElement("fecha");

    nUsuario.textContent = usuario;
    nPuntuacion.textContent = puntuacion;
    nComentario.textContent = comentario;
    nFecha.textContent = fecha;

    nuevaResena.appendChild(nUsuario);
    nuevaResena.appendChild(nPuntuacion);
    nuevaResena.appendChild(nComentario);
    nuevaResena.appendChild(nFecha);

    const raiz = xmlReseñas.getElementsByTagName("resenas")[0];
    if (raiz) {
        raiz.appendChild(nuevaResena);
    }

    mostrarResenas();
    actualizarMedia();

    const formulario = document.getElementById("formulario-resenas");
    if (formulario) {
        formulario.reset();
    }
}

// Paso 5: Calcular la puntuación media.
function actualizarMedia() {
    const puntuaciones = xmlReseñas.getElementsByTagName("puntuacion");
    const mediaElemento = document.getElementById("puntuacion-media");
    if (!mediaElemento) return;

    if (puntuaciones.length === 0) {
        mediaElemento.textContent = "No hay reseñas aún.";
        return;
    }

    let suma = 0;
    for (let i = 0; i < puntuaciones.length; i++) {
        suma += parseFloat(puntuaciones[i].textContent) || 0;
    }

    const media = (suma / puntuaciones.length).toFixed(1);
    mediaElemento.textContent = "Puntuación media: " + media + "/10";
}

