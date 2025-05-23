<template>
    <div class="fondos-admin">


        <div v-if="showSuccess" class="alert alert-success">
            {{ successMessage }}
            <button @click="showSuccess = false" class="close-btn">&times;</button>
        </div>

        <!-- Formulario de edición/creación -->
        <FormularioFondo :initial-data="form" :editing="editing" @submit="handleSubmit" @cancel="cancelEdit" />

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
import FormularioFondo from '../components/FormularioFondo.vue.vue'


export default {
    name: 'FondosAdmin',
    components: {
        FormularioFondo
    },
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
        const handleSubmit = async (formData) => {
            try {
                const url = editing.value ? `${API_URL}/${currentId.value}` : API_URL
                const method = editing.value ? 'PUT' : 'POST'

                // Si es edición, mantener el contador existente
                if (editing.value) {
                    const fondoExistente = fondos.value.find(f => f.id === currentId.value)
                    if (fondoExistente) {
                        formData.contador = fondoExistente.contador
                    }
                }

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Error al guardar el fondo')
                }

                await fetchFondos()
                resetForm()

                // Mostrar mensaje de éxito
                showSuccess.value = true
                successMessage.value = editing.value
                    ? 'Fondo actualizado correctamente'
                    : 'Fondo creado correctamente'

                setTimeout(() => {
                    showSuccess.value = false
                }, 3000)
            } catch (error) {
                console.error('Error en handleSubmit:', error)
                alert(error.message || 'Error al guardar el fondo')
            }
        }
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
            isClosingSoon,
            showSuccess,
            successMessage
        }
    }
}
</script>

<style scoped>.fondos-admin {
  padding: 1rem;
}

.alert {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.table-card {
  margin-top: 2rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.search-box input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.fondos-table {
  width: 100%;
  border-collapse: collapse;
}

.fondos-table th, .fondos-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.fondos-table th {
  cursor: pointer;
  background-color: #f8f9fa;
}

.fondo-link {
  color: #007bff;
  text-decoration: none;
}

.fondo-link:hover {
  text-decoration: underline;
}

.platform-tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.platform-tag.corfo {
  background-color: #e3f2fd;
  color: #0d47a1;
}

.platform-tag.anid {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.platform-tag.gore {
  background-color: #fff3e0;
  color: #e65100;
}

.platform-tag.otro {
  background-color: #f3e5f5;
  color: #6a1b9a;
}

.closing-soon {
  color: #d32f2f;
  font-weight: bold;
}

.warning-badge {
  display: inline-block;
  background-color: #ffeb3b;
  color: #333;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
}

.btn-icon.edit {
  background-color: #2196f3;
  color: white;
}

.btn-icon.delete {
  background-color: #f44336;
  color: white;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #666;
}</style>