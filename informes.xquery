for $libro in distinct-values(doc("prestamos.xml")//prestamo/libro)
return <resultado><tipo>librosMasPrestados</tipo><idLibro>{$libro}</idLibro><prestamos>{count(doc("prestamos.xml")//prestamo[libro=$libro])}</prestamos></resultado>

for $idLibro in distinct-values(doc("reseñas.xml")//resena/@idLibro)
return <resultado><tipo>librosMejorValorados</tipo><idLibro>{$idLibro}</idLibro><media>{format-number(avg(doc("reseñas.xml")//resena[@idLibro=$idLibro]/puntuacion),"0.0")}</media></resultado>

for $categoria in distinct-values(doc("libros.xml")//categoria)
return <resultado><tipo>librosPorCategoria</tipo><categoria>{$categoria}</categoria><cantidad>{count(doc("libros.xml")//libro[categoria=$categoria])}</cantidad></resultado>

for $usuario in distinct-values(doc("prestamos.xml")//prestamo/usuario)
return <resultado><tipo>usuariosMasLeidos</tipo><usuario>{$usuario}</usuario><librosLeidos>{count(doc("prestamos.xml")//prestamo[usuario=$usuario])}</librosLeidos></resultado>
