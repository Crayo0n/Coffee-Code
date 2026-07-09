import sys

with open(r'c:\CAFECODE09\Coffee-Code\web-flask\templates\estadisticas.html', 'r', encoding='utf-8') as f:
    content = f.read()

modal_html = '''
<!-- TICKET MODAL -->
<div id="ticketModal" class="modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.5);">
    <div class="modal-content" style="background-color: #fefefe; margin: 10% auto; padding: 20px; border: 1px solid #888; width: 400px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
        <span class="close" onclick="closeModal()" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
        <div id="ticketContent" style="font-family: monospace; color: #352728;">
            <div style="text-align: center; border-bottom: 1px dashed #352728; padding-bottom: 10px; margin-bottom: 10px;">
                <h2 style="margin: 0; color: var(--color-primary);">Coffee-Code</h2>
                <p style="margin: 5px 0 0 0;">Ticket de Venta</p>
                <p style="margin: 0; font-size: 12px;">ID: <span id="m_id"></span> | <span id="m_fecha"></span></p>
            </div>
            <div style="margin-bottom: 10px; font-size: 13px;">
                <p style="margin: 2px 0;"><b>Cliente:</b> <span id="m_cliente"></span></p>
                <p style="margin: 2px 0;"><b>Mesa:</b> <span id="m_mesa"></span></p>
                <p style="margin: 2px 0;"><b>Mesero:</b> <span id="m_mesero"></span></p>
                <p style="margin: 2px 0;"><b>Estado:</b> <span id="m_estado"></span></p>
            </div>
            <table style="width: 100%; text-align: left; border-collapse: collapse; margin-bottom: 15px; font-size: 13px;">
                <thead>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <th>Cant</th>
                        <th>Art</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody id="m_items">
                </tbody>
            </table>
            <div style="text-align: right; border-top: 1px dashed #352728; padding-top: 10px;">
                <h3 style="margin: 0;">TOTAL: $<span id="m_total"></span></h3>
            </div>
        </div>
        <div style="margin-top: 20px; text-align: center;">
            <button onclick="closeModal()" style="padding: 8px 16px; background: var(--color-secondary); color: white; border: none; border-radius: 4px; cursor: pointer;">Cerrar</button>
        </div>
    </div>
</div>
'''

js_logic = '''
    function verDetalle(order_id) {
        fetch(http://localhost:8000/api/estadisticas/pedidos//detalles)
            .then(res => res.json())
            .then(data => {
                if(data.error) { alert(data.error); return; }
                document.getElementById('m_id').innerText = data.id_venta;
                document.getElementById('m_fecha').innerText = data.fecha + " " + data.hora;
                document.getElementById('m_cliente').innerText = data.cliente;
                document.getElementById('m_mesa').innerText = data.mesa;
                document.getElementById('m_mesero').innerText = data.mesero;
                document.getElementById('m_estado').innerText = data.estado;
                document.getElementById('m_total').innerText = parseFloat(data.total).toFixed(2);
                
                let itemsHtml = '';
                data.items.forEach(i => {
                    itemsHtml += <tr>
                        <td></td>
                        <td></td>
                        <td style="text-align: right;">{parseFloat(i.importe).toFixed(2)}</td>
                    </tr>;
                });
                document.getElementById('m_items').innerHTML = itemsHtml;
                document.getElementById('ticketModal').style.display = "block";
            })
            .catch(err => {
                console.error(err);
                alert("Error al obtener los detalles del ticket");
            });
    }

    function closeModal() {
        document.getElementById('ticketModal').style.display = "none";
    }

    function imprimirTicket(order_id) {
        window.open(http://localhost:8000/api/estadisticas/pedidos//ticket/pdf, "_blank");
    }
'''

# Insert HTML before </body>
if '</body>' in content:
    content = content.replace('</body>', modal_html + '\n</body>')
else:
    # insert before endblock content
    content = content.replace('{% endblock %}', modal_html + '\n{% endblock %}')

# Insert JS before </script>
if '</script>' in content:
    content = content.replace('</script>', js_logic + '\n</script>')

with open(r'c:\CAFECODE09\Coffee-Code\web-flask\templates\estadisticas.html', 'w', encoding='utf-8') as f:
    f.write(content)
