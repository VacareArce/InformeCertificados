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

            // === Gráficas ===
            renderCharts(data);
        })
        .catch(error => {
            console.error('Error cargando los datos:', error);
            const tbody = document.querySelector('#tabla-totales-cert tbody');
            if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-center">Error al cargar datos. Verifica que el JSON exista.</td></tr>`;
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
        if (!d || d.count === 0) continue;

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
        tbody.innerHTML = `<tr><td colspan="3" class="text-center">No hay documentos rechazados en este período</td></tr>`;
        return;
    }

    rechazos.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.document_id || 'N/A'}</td>
            <td>${r.empresa}</td>
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

// === Gráficos con Chart.js ===
function renderCharts(data) {
    const labels = [];
    const valuesCert = [];
    const valuesConst = [];

    // Recopilar datos solo de los meses con actividad
    for (let i = 6; i <= 12; i++) {
        const dCert = data.certificados.mensual[i];
        const dConst = data.constancias.mensual[i];

        if (dCert && dCert.count > 0 || dConst && dConst.count > 0) {
            labels.push(nombresMeses[i]);
            valuesCert.push(dCert ? dCert.count : 0);
            valuesConst.push(dConst ? dConst.count : 0);
        }
    }

    // Chart de Certificados
    const ctxCert = document.getElementById('grafico-certificados');
    if (ctxCert) {
        new Chart(ctxCert, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cantidad de Certificados',
                    data: valuesCert,
                    backgroundColor: 'rgba(210, 222, 56, 0.8)', // Verde Limón ABACO
                    borderColor: '#00A859', // Verde hojas ABACO
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Certificados Emitidos por Mes' }
                },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    // Chart de Constancias
    const ctxConst = document.getElementById('grafico-constancias');
    if (ctxConst) {
        new Chart(ctxConst, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cantidad de Constancias',
                    data: valuesConst,
                    backgroundColor: 'rgba(245, 134, 52, 0.8)', // Naranja ABACO
                    borderColor: '#F58634',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Constancias Emitidas por Mes' }
                },
                scales: { y: { beginAtZero: true } }
            }
        });
    }
}
