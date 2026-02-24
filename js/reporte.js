document.addEventListener("DOMContentLoaded", () => {
    fetch('report_data.json')
        .then(response => response.json())
        .then(data => {
            renderTotales(data.mensual);
            renderTipos(data.mensual);
            renderRechazos(data.rechazos);
            renderDonantes(data.top_donantes);
        })
        .catch(error => {
            console.error('Error cargando los datos:', error);
            document.querySelector('#tabla-totales tbody').innerHTML = `<tr><td colspan="5" class="text-center">Error al cargar datos. Verifica que el JSON exista.</td></tr>`;
        });
});

const nombresMeses = {
    6: 'Junio', 7: 'Julio', 8: 'Agosto',
    9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
};

function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(value);
}

function renderTotales(mensual) {
    const tbody = document.querySelector('#tabla-totales tbody');
    tbody.innerHTML = '';

    for (let i = 6; i <= 12; i++) {
        const d = mensual[i];
        if (!d) continue;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-bold">${nombresMeses[i]}</td>
            <td class="text-right">${d.count}</td>
            <td class="text-right">${formatCurrency(d.valor)}</td>
            <td class="text-right">${d.acumulado_count}</td>
            <td class="text-right font-bold">${formatCurrency(d.acumulado_valor)}</td>
        `;
        tbody.appendChild(tr);
    }
}

function renderTipos(mensual) {
    const tbody = document.querySelector('#tabla-tipos tbody');
    tbody.innerHTML = '';

    for (let i = 6; i <= 12; i++) {
        const d = mensual[i];
        if (!d || Object.keys(d.tipos).length === 0) continue;

        let isFirst = true;
        const numTipos = Object.keys(d.tipos).length;

        for (const [tipo, cantidad] of Object.entries(d.tipos)) {
            const tr = document.createElement('tr');
            let cols = '';

            if (isFirst) {
                cols += `<td rowspan="${numTipos}" class="font-bold">${nombresMeses[i]}</td>`;
                isFirst = false;
            }

            cols += `
                <td>${tipo.replace(/_/g, ' ')}</td>
                <td class="text-right">${cantidad}</td>
                <td class="text-right font-bold">${d.acumulado_tipos[tipo] || cantidad}</td>
            `;
            tr.innerHTML = cols;
            tbody.appendChild(tr);
        }
    }
}

function renderRechazos(rechazos) {
    const tbody = document.querySelector('#tabla-rechazos tbody');
    document.getElementById('total-rechazados').textContent = rechazos.length;
    tbody.innerHTML = '';

    if (rechazos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">No hay certificados rechazados en este período</td></tr>`;
        return;
    }

    rechazos.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.document_id}</td>
            <td>${r.empresa}</td>
            <td>${r.quien || 'N/A'}</td>
            <td>${r.observacion || 'Sin observación'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderDonantes(donantes) {
    const tbody = document.querySelector('#tabla-donantes tbody');
    tbody.innerHTML = '';

    donantes.forEach((d, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center">${idx + 1}</td>
            <td class="font-bold">${d.empresa}</td>
            <td class="text-right">${d.count}</td>
            <td class="text-right">${formatCurrency(d.valor)}</td>
        `;
        tbody.appendChild(tr);
    });
}
