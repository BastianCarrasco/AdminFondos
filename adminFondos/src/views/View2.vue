<template>
    <div class="view">
        <h1>Estadísticas de Fondos de Investigación</h1>

        <div v-if="showMessage" :class="['message', messageType]">
            {{ messageText }}
        </div>

        <div class="stats-container">
            <div class="stats-summary">
                <div class="stat-card">
                    <div class="stat-header">
                        <img src="/wallet.png" alt="Total de Fondos" class="icon" />
                        <h3>Total de Fondos</h3>
                    </div>
                    <p>{{ fondos.length }}</p>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <img src="/plat.png" alt="Plataformas distintas" class="icon" />
                        <h3>Plataformas distintas</h3>
                    </div>
                    <p>{{ plataformasUnicas.length }}</p>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <img src="/grafico.png" alt="Fondo más visitado" class="icon" />
                        <h3>Fondo más visitado</h3>
                    </div>
                    <p>{{ fondoMasVisitado.nombre || 'N/A' }}</p>
                    <small>Visitas: {{ fondoMasVisitado.contador || 0 }}</small>
                </div>
            </div>



            <div class="advanced-stats">
                <div class="chart-container">
                    <h2>Distribución por Plataforma</h2>
                    <canvas ref="plataformasChart"></canvas>
                </div>

                <div class="chart-container">
                    <h2>Fondos más visitados (Top 5)</h2>
                    <canvas ref="visitasChart"></canvas>
                </div>

                <div class="chart-container">
                    <h2>Fondos por Mes de Cierre</h2>
                    <canvas ref="mesesChart"></canvas>
                </div>
            </div>

            <h2>Listado de Fondos Disponibles</h2>
            <div class="table-responsive">
                <table class="fondos-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Plataforma</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Cierre</th>
                            <th>Días Restantes</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="fondo in fondosOrdenados" :key="fondo.id">
                            <td><a :href="fondo.url" target="_blank">{{ fondo.nombre }}</a></td>
                            <td>{{ fondo.plataforma }}</td>
                            <td>{{ formatFecha(fondo.fechainicio) }}</td>
                            <td>{{ formatFecha(fondo.fechacierre) }}</td>
                            <td :class="{ warning: calcularDiasRestantes(fondo.fechacierre) < 30 }">
                                {{ calcularDiasRestantes(fondo.fechacierre) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
    name: 'EstadisticasFondos',
    data() {
        return {
            fondos: [],
            showMessage: false,
            messageText: '',
            messageType: 'info',
            plataformasChart: null,
            visitasChart: null,
            mesesChart: null,
            loading: true
        };
    },
    async created() {
        try {
            await this.cargarFondos();
        } catch (error) {
            console.error('Error en created:', error);
            this.mostrarMensaje('Error al cargar los datos iniciales', 'error');
        } finally {
            this.loading = false;
        }
    },
    computed: {
        fondosOrdenados() {
            return [...this.fondos].sort((a, b) =>
                new Date(a.fechacierre) - new Date(b.fechacierre)
            );
        },
        plataformasUnicas() {
            return [...new Set(this.fondos.map(f => f.plataforma))];
        },
        conteoPorPlataforma() {
            const conteo = {};
            this.fondos.forEach(f => {
                conteo[f.plataforma] = (conteo[f.plataforma] || 0) + 1;
            });
            return conteo;
        },
        fondoMasVisitado() {
            return [...this.fondos].sort((a, b) => (b.contador || 0) - (a.contador || 0))[0] || {};
        },
        fondosMasVisitados() {
            return [...this.fondos]
                .sort((a, b) => (b.contador || 0) - (a.contador || 0))
                .slice(0, 5);
        },
        fondosPorMes() {
            const meses = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];
            const conteo = Array(12).fill(0);
            this.fondos.forEach(f => {
                if (f.fechacierre) {
                    const mes = new Date(f.fechacierre).getMonth();
                    conteo[mes]++;
                }
            });
            return {
                labels: meses,
                data: conteo
            };
        }
    },
    methods: {
        async cargarFondos() {
            try {
                this.loading = true;
                const response = await fetch('https://backendrw-production.up.railway.app/fondos');
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                this.fondos = data.map(fondo => ({
                    ...fondo,
                    contador: fondo.contador || 0
                }));
                this.inicializarGraficos();
                this.mostrarMensaje('Datos cargados correctamente', 'success');
            } catch (error) {
                console.error('Error al cargar fondos:', error);
                this.mostrarMensaje('Error al cargar los fondos', 'error');
            } finally {
                this.loading = false;
            }
        },
        mostrarMensaje(texto, tipo = 'info') {
            this.messageText = texto;
            this.messageType = tipo;
            this.showMessage = true;
            setTimeout(() => {
                this.showMessage = false;
            }, 5000);
        },
        formatFecha(fechaString) {
            if (!fechaString) return 'N/A';
            try {
                const fecha = new Date(fechaString);
                return fecha.toLocaleDateString('es-CL');
            } catch {
                return 'Fecha inválida';
            }
        },
        calcularDiasRestantes(fechaCierre) {
            if (!fechaCierre) return 'N/A';
            try {
                const hoy = new Date();
                const cierre = new Date(fechaCierre);
                const diff = cierre - hoy;
                return Math.ceil(diff / (1000 * 60 * 60 * 24));
            } catch {
                return 'N/A';
            }
        },
        inicializarGraficos() {
            [this.plataformasChart, this.visitasChart, this.mesesChart].forEach(chart => {
                if (chart) chart.destroy();
            });

            // Plataforma
            if (this.$refs.plataformasChart) {
                const ctx = this.$refs.plataformasChart.getContext('2d');
                this.plataformasChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(this.conteoPorPlataforma),
                        datasets: [{
                            label: 'Fondos por Plataforma',
                            data: Object.values(this.conteoPorPlataforma),
                            backgroundColor: '#4e79a7'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true, ticks: { precision: 0 } }
                        }
                    }
                });
            }

            // Visitas
            if (this.$refs.visitasChart) {
                const ctx = this.$refs.visitasChart.getContext('2d');
                this.visitasChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: this.fondosMasVisitados.map(f =>
                            f.nombre?.length > 20 ? f.nombre.substring(0, 20) + '...' : f.nombre
                        ),
                        datasets: [{
                            label: 'Visitas',
                            data: this.fondosMasVisitados.map(f => f.contador || 0),
                            backgroundColor: '#4CAF50'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        scales: {
                            x: { beginAtZero: true, ticks: { precision: 0 } }
                        }
                    }
                });
            }

            // Meses
            if (this.$refs.mesesChart) {
                const ctx = this.$refs.mesesChart.getContext('2d');
                this.mesesChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: this.fondosPorMes.labels,
                        datasets: [{
                            label: 'Fondos por Mes de Cierre',
                            data: this.fondosPorMes.data,
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.3
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true, ticks: { precision: 0 } }
                        }
                    }
                });
            }
        }
    }
};
</script>

<style scoped>
.view {
    padding: 2rem;
    background-color: aliceblue;
}

.stats-summary {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
}


.chart-container {
    height: 300px;
    margin-bottom: 2rem;
}

.table-responsive {
    overflow-x: auto;
}

.fondos-table {
    width: 100%;
    border-collapse: collapse;
}

.fondos-table th,
.fondos-table td {
    border: 1px solid #ccc;
    padding: 0.5rem;
    text-align: center;
}

.fondos-table th {
    background-color: #f0f0f0;
}

.warning {
    color: red;
    font-weight: bold;
}

.message {
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
    border-radius: 5px;
}

.message.success {
    background-color: #d4edda;
    color: #155724;
}

.message.error {
    background-color: #f8d7da;
    color: #721c24;
}

.stats-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 20px;
}

.stat-card {
    background: #f9f9f9;
    border-radius: 8px;
    padding: 16px;
    flex: 1 1 250px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.stat-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.stat-card .icon {
    width: 24px;
    height: 24px;
}



.stat-card p {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 4px 0 0;
}
</style>
