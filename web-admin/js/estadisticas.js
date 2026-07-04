document.addEventListener("DOMContentLoaded", () => {
    
    // Función visual para simular la búsqueda en la sección de Catálogo
    const searchInput = document.querySelector('.search-input');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase();
            const filas = document.querySelectorAll('.card-section:nth-of-type(2) tbody tr');
            
            filas.forEach(fila => {
                const nombreProducto = fila.querySelector('td:first-child').textContent.toLowerCase();
                if (nombreProducto.includes(termino)) {
                    fila.style.display = '';
                } else {
                    fila.style.display = 'none';
                }
            });
        });
    }

    // Alertas visuales para los botones de impresión y exportación
    const printButtons = document.querySelectorAll('.btn-print');
    const exportButtons = document.querySelectorAll('.btn-export');

    printButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Esto abre la ventana nativa de impresión del navegador
        window.print(); 
    });
});

    exportButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const formato = e.target.textContent.includes('PDF') ? 'PDF' : 'XLSX';
        
        if (formato === 'PDF') {
            // Lógica real usando html2pdf (requiere importar la librería html2pdf.js)
            const elementoAExportar = document.getElementById('miTablaDeReporte');
            html2pdf().from(elementoAExportar).save('Reporte.pdf');
            
        } else if (formato === 'XLSX') {
            // Lógica real usando SheetJS (requiere importar la librería xlsx.js)
            const tabla = document.getElementById('miTablaDeReporte');
            const libro = XLSX.utils.table_to_book(tabla, {sheet:"Reporte"});
            XLSX.writeFile(libro, 'Reporte.xlsx');
        }
    });
});
});