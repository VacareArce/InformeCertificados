document.addEventListener("DOMContentLoaded", () => {
    fetch('report_data.json')
        .then(response => response.json())
        .then(data => {
            // === Sección Certificados ===
            renderTotales(data.certificados.mensual, 'tabla-totales-cert', true);
            renderTipos(data.certificados.mensual, 'tabla-tipos-cert');
            renderRechazos(data.certificados.rechazos, 'tabla-rechazos-cert', 'total-rechazados-cert');
            renderDonantes(data.certificados.top_donantes, 'tabla-donantes-cert', true);

            // === Sección Constancias ===
            renderTotales(data.constancias.mensual, 'tabla-totales-const', false);
            renderRechazos(data.constancias.rechazos, 'tabla-rechazos-const', 'total-rechazados-const');
            renderDonantes(data.constancias.top_donantes, 'tabla-donantes-const', false);
        })
        .catch(error => {
            console.error('Error cargando los datos:', error);
            document.querySelector('#tabla-totales-cert tbody').innerHTML = `<tr><td colspan="5" class="text-center">Error al cargar datos. Verifica que el JSON exista.</td></tr>`;
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

function formatNumber(value) {
    return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(value);
}

function renderTotales(mensual, tableId, isCurrency) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;
    tbody.innerHTML = '';

    for (let i = 6; i <= 12; i++) {
        const d = mensual[i];
        if (!d) continue;

        const valFormat = isCurrency ? formatCurrency(d.valor) : `${formatNumber(d.valor)} kg`;
        const valAcumFormat = isCurrency ? formatCurrency(d.acumulado_valor) : `${formatNumber(d.acumulado_valor)} kg`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-bold">${nombresMeses[i]}</td>
            <td class="text-right">${d.count}</td>
            <td class="text-right">${valFormat}</td>
            <td class="text-right">${d.acumulado_count}</td>
            <td class="text-right font-bold">${valAcumFormat}</td>
        `;
        tbody.appendChild(tr);
    }
}

function renderTipos(mensual, tableId) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;
    tbody.innerHTML = '';

    for (let i = 6; i <= 12; i++) {
        const d = mensual[i];
        if (!d || !d.tipos || Object.keys(d.tipos).length === 0) continue;

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

function renderRechazos(rechazos, tableId, countId) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    const countSpan = document.getElementById(countId);
    if (!tbody || !countSpan) return;

    countSpan.textContent = rechazos.length;
    tbody.innerHTML = '';

    if (rechazos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">No hay documentos rechazados en este período</td></tr>`;
        return;
    }

    rechazos.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.document_id || 'N/A'}</td>
            <td>${r.empresa}</td>
            <td>${r.quien || 'N/A'}</td>
            <td>${r.observacion || 'Sin observación'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderDonantes(donantes, tableId, isCurrency) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;
    tbody.innerHTML = '';

    donantes.forEach((d, idx) => {
        const valFormat = isCurrency ? formatCurrency(d.valor) : `${formatNumber(d.valor)} kg`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center">${idx + 1}</td>
            <td class="font-bold">${d.empresa}</td>
            <td class="text-right">${d.count}</td>
            <td class="text-right">${valFormat}</td>
        `;
        tbody.appendChild(tr);
    });
}
