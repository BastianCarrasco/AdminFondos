<template>
    <div class="fondos-admin">
        

           <div v-if="showSuccess" class="alert alert-success">
            {{ successMessage }}
            <button @click="showSuccess = false" class="close-btn">&times;</button>
        </div>

        <!-- Formulario de edición/creación -->
        <div class="card form-card">
            <h2>{{ editing ? 'Editar Fondo' : 'Nuevo Fondo' }}</h2>
            <form @submit.prevent="handleSubmit">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Nombre del Fondo*</label>
                        <input v-model="form.nombre" type="text" required placeholder="Ej: Crea y Valida">
                    </div>

                    <div class="form-group">
                        <label>URL de la Convocatoria*</label>
                        <input v-model="form.url" type="url" required placeholder="https://www.ejemplo.cl/fondo">
                    </div>

                    <div class="form-group">
                        <label>Plataforma*</label>
                        <select v-model="form.plataforma" required>
                            <option value="">Seleccione plataforma</option>
                            <option value="CORFO">CORFO</option>
                            <option value="ANID">ANID</option>
                            <option value="GORE">GORE</option>
                            <option value="OTRO">OTRO</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Fecha de Apertura*</label>
                        <input v-model="form.fechainicio" type="date" required>
                    </div>

                    <div class="form-group">
                        <label>Fecha de Cierre*</label>
                        <input v-model="form.fechacierre" type="date" required>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn primary">
                        {{ editing ? 'Actualizar' : 'Crear' }}
                    </button>
                    <button v-if="editing" type="button" @click="cancelEdit" class="btn secondary">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>

        <!-- Listado de fondos -->
        <div class="card table-card">
            <div class="table-header">
                <h2>Fondos Disponibles</h2>
                <div class="search-box">
                    <input v-model="searchQuery" type="text" placeholder="Buscar fondos...">
                </div>
            </div>

            <div class="table-responsive">
                <table class="fondos-table">
                    <thead>
                        <tr>
                            <th @click="sortBy('nombre')">Nombre {{ sortIcon('nombre') }}</th>
                            <th>Plataforma</th>
                            <th @click="sortBy('fechainicio')">Apertura {{ sortIcon('fechainicio') }}</th>
                            <th @click="sortBy('fechacierre')">Cierre {{ sortIcon('fechacierre') }}</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="fondo in filteredFondos" :key="fondo.id">
                            <td>
                                <a :href="fondo.url" target="_blank" class="fondo-link">
                                    {{ fondo.nombre }}
                                </a>
                            </td>
                            <td>
                                <span class="platform-tag" :class="fondo.plataforma.toLowerCase()">
                                    {{ fondo.plataforma }}
                                </span>
                            </td>
                            <td>{{ formatDate(fondo.fechainicio) }}</td>
                            <td :class="{ 'closing-soon': isClosingSoon(fondo.fechacierre) }">
                                {{ formatDate(fondo.fechacierre) }}
                                <span v-if="isClosingSoon(fondo.fechacierre)" class="warning-badge">Pronto a
                                    cerrar</span>
                            </td>
                            <td class="actions">
                                <button @click="editFondo(fondo)" class="btn-icon edit">
                                    <p>E</p>
                                </button>
                                <button @click="confirmDelete(fondo.id)" class="btn-icon delete">
                                    <p>X</p>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="filteredFondos.length === 0" class="empty-state">
                No se encontraron fondos que coincidan con la búsqueda
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
    name: 'FondosAdmin',
    setup() {
        const API_URL = 'https://backendrw-production.up.railway.app/fondos'
        const fondos = ref([])
        const editing = ref(false)
        const currentId = ref(null)
        const searchQuery = ref('')
        const sortField = ref('nombre')
        const sortDirection = ref('asc')

        const showSuccess = ref(false)
        const successMessage = ref('')

        const form = ref({
            nombre: '',
            url: '',
            plataforma: '',
            fechainicio: '',
            fechacierre: ''
            // Eliminamos contador del formulario inicial
        })

        // Obtener fondos desde la API
        const fetchFondos = async () => {
            try {
                const response = await fetch(API_URL)
                if (!response.ok) throw new Error('Error al cargar fondos')
                fondos.value = await response.json()
            } catch (error) {
                console.error('Error:', error)
                alert('Error al cargar los fondos')
            }
        }

        // Incrementar contador de visitas
        const incrementCounter = async (id) => {
            try {
                const response = await fetch(`${API_URL}/${id}/increment`, {
                    method: 'PUT'
                })
                if (!response.ok) throw new Error('Error al actualizar contador')
                await fetchFondos()
            } catch (error) {
                console.error('Error al incrementar contador:', error)
            }
        }

        // Filtrar y ordenar fondos
        const filteredFondos = computed(() => {
            let result = [...fondos.value]

            // Filtrar por búsqueda
            if (searchQuery.value) {
                const query = searchQuery.value.toLowerCase()
                result = result.filter(fondo =>
                    fondo.nombre.toLowerCase().includes(query) ||
                    fondo.plataforma.toLowerCase().includes(query)
                )
            }

            // Ordenar
            return result.sort((a, b) => {
                const fieldA = a[sortField.value]
                const fieldB = b[sortField.value]

                if (sortField.value.includes('fecha')) {
                    return sortDirection.value === 'asc'
                        ? new Date(fieldA) - new Date(fieldB)
                        : new Date(fieldB) - new Date(fieldA)
                }

                if (sortField.value === 'contador') {
                    return sortDirection.value === 'asc'
                        ? fieldA - fieldB
                        : fieldB - fieldA
                }

                return sortDirection.value === 'asc'
                    ? fieldA.localeCompare(fieldB)
                    : fieldB.localeCompare(fieldA)
            })
        })

        // Manejar envío del formulario
        const handleSubmit = async () => {
            try {
                // Convertir las fechas a objetos Date
                const fechaInicio = new Date(form.value.fechainicio);
                const fechaCierre = new Date(form.value.fechacierre);

                // Validar fechas
                if (isNaN(fechaInicio.getTime()) || isNaN(fechaCierre.getTime())) {
                    alert('Por favor ingrese fechas válidas');
                    return;
                }

                if (fechaCierre < fechaInicio) {
                    alert('La fecha de cierre no puede ser anterior a la fecha de apertura');
                    return;
                }

                const url = editing.value ? `${API_URL}/${currentId.value}` : API_URL;
                const method = editing.value ? 'PUT' : 'POST';

                // Preparar los datos para el backend
                const dataToSend = {
                    nombre: form.value.nombre,
                    url: form.value.url,
                    plataforma: form.value.plataforma,
                    fechainicio: fechaInicio.toISOString(), // Convertir a ISO string
                    fechacierre: fechaCierre.toISOString() // Convertir a ISO string
                };

                // Si es edición, mantener el contador existente
                if (editing.value) {
                    const fondoExistente = fondos.value.find(f => f.id === currentId.value);
                    if (fondoExistente) {
                        dataToSend.contador = fondoExistente.contador;
                    }
                }

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dataToSend)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al guardar el fondo');
                }

                await fetchFondos();
                resetForm();
            } catch (error) {
                console.error('Error en handleSubmit:', error);
                alert(error.message || 'Error al guardar el fondo');
            }
        };

        // Editar fondo
        const editFondo = (fondo) => {
            editing.value = true
            currentId.value = fondo.id
            form.value = {
                nombre: fondo.nombre,
                url: fondo.url,
                plataforma: fondo.plataforma,
                fechainicio: fondo.fechainicio.split('T')[0],
                fechacierre: fondo.fechacierre.split('T')[0]
                // No incluimos contador en el formulario de edición
            }
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }

        // Confirmar eliminación
        const confirmDelete = (id) => {
            if (confirm('¿Está seguro de eliminar este fondo? Esta acción no se puede deshacer.')) {
                deleteFondo(id)
            }
        }

        // Eliminar fondo
        const deleteFondo = async (id) => {
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE'
                })

                if (!response.ok) throw new Error('Error al eliminar el fondo')

                await fetchFondos()
            } catch (error) {
                console.error('Error:', error)
                alert('Error al eliminar el fondo')
            }
        }

        // Cancelar edición
        const cancelEdit = () => {
            resetForm()
        }

        // Reiniciar formulario
        const resetForm = () => {
            form.value = {
                nombre: '',
                url: '',
                plataforma: '',
                fechainicio: '',
                fechacierre: ''
            }
            editing.value = false
            currentId.value = null
        }

        // Ordenar por campo
        const sortBy = (field) => {
            if (sortField.value === field) {
                sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
            } else {
                sortField.value = field
                sortDirection.value = 'asc'
            }
        }

        // Ícono de ordenación
        const sortIcon = (field) => {
            if (sortField.value !== field) return ''
            return sortDirection.value === 'asc' ? '▲' : '▼'
        }

        // Formatear fecha
           const formatDate = (dateString) => {
            const options = { year: 'numeric', month: 'short', day: 'numeric' }
            return new Date(dateString).toLocaleDateString('es-CL', options)
        }

        // Verificar si el fondo está por cerrarse (menos de 7 días)
       const isClosingSoon = (fechacierre) => {
            const hoy = new Date()
            const cierre = new Date(fechacierre)
            const diffTime = cierre - hoy
            const diffDays = diffTime / (1000 * 60 * 60 * 24)
            return diffDays <= 5 && diffDays >= 0
        }

        onMounted(fetchFondos)

        return {
            fondos,
            editing,
            form,
            searchQuery,
            filteredFondos,
            handleSubmit,
            editFondo,
            confirmDelete,
            cancelEdit,
            sortBy,
            sortIcon,
            formatDate,
            isClosingSoon
        }
    }
}
</script>

<style scoped>
</style>