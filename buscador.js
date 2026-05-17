function escapeXPath(str) {
    if (str.includes("'")) {
        return `concat('${str.split("'").join("', \"'\", '")}')`;
    }
    return `'${str}'`;
}

document.getElementById("buscar").addEventListener("click", function(e) {
    e.preventDefault();

    fetch("libros.xml")
        .then(response => response.text())
        .then(data => {
            const titulo = document.getElementById("titulo").value.trim();
            const autor = document.getElementById("autor").value.trim();
            const isbn = document.getElementById("isbn").value.trim();
            
            const categoria = document.getElementById("categoria").value.trim();

            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "application/xml");

            let xpath = "//libro";
            let condiciones = [];

            if (titulo !== "") {
                condiciones.push(`contains(titulo, ${escapeXPath(titulo)})`);
            }
            if (autor !== "") {
                condiciones.push(`contains(autor, ${escapeXPath(autor)})`);
            }
            if (isbn !== "") {
                condiciones.push(`contains(isbn, ${escapeXPath(isbn)})`);
            }
            if (categoria !== "") {
                condiciones.push(`contains(categoria, ${escapeXPath(categoria)})`);
            }

            if (condiciones.length > 0) {
                xpath += "[" + condiciones.join(" and ") + "]";
            }

            const resultados = xml.evaluate(
                xpath,
                xml,
                null,
                XPathResult.ANY_TYPE,
                null
            );

            const tbody = document.querySelector("#resultados tbody");
            tbody.innerHTML = "";

            let nodo = resultados.iterateNext();
            while (nodo) {
                const tituloXML = nodo.getElementsByTagName("titulo")[0]?.textContent || "";
                const autorXML = nodo.getElementsByTagName("autor")[0]?.textContent || "";
                const isbnXML = nodo.getElementsByTagName("isbn")[0]?.textContent || "";
                const categoriaXML = nodo.getElementsByTagName("categoria")[0]?.textContent || "";

                const fila = tbody.insertRow();
                fila.style.cursor = "pointer";
                fila.insertCell().textContent = tituloXML;
                fila.insertCell().textContent = autorXML;
                fila.insertCell().textContent = isbnXML;
                fila.insertCell().textContent = categoriaXML;

                fila.dataset.titulo = tituloXML;
                fila.dataset.autor = autorXML;
                fila.dataset.isbn = isbnXML;
                fila.dataset.categoria = categoriaXML;
                
                fila.addEventListener("click", function() {
                    document.getElementById("detalleLibro").innerHTML = `
                        <h2>${tituloXML}</h2>
                        <p><strong>Autor:</strong> ${autorXML}</p>
                        <p><strong>ISBN:</strong> ${isbnXML}</p>
                        <p><strong>Categoría:</strong> ${categoriaXML}</p>
                  `;  
                });

                nodo = resultados.iterateNext();
            }
        })
        .catch(error => {
            console.error("Error al cargar el archivo XML:", error);
        });
});
