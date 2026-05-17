<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
		
	<!-- Esta es la plantilla principal-->
	<xsl:template match="/">
		<div>
			<h2>Lista de reseñas</h2>
			
			<ul>
				<!-- Aquí recorremos cada reseña -->
				<xsl:for-each select="resenas/resena">
					<li>	
						
							<strong>Usuario:</strong>
							<xsl:value-of select="usuario"/> <br/>
						
							<strong>Puntuación:</strong>
							<xsl:value-of select="puntuacion"/> <br/>
						
							<strong>Comentario:</strong>
							<xsl:value-of select="comentario"/> <br/>
						
							<strong>Fecha:</strong>
							<xsl:value-of select="fecha"/> <br/>
					</li>
				</xsl:for-each>
			</ul>
		</div>
	</xsl:template>
</xsl:stylesheet>