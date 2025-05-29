<template>
  <div class="view3">
    <div v-if="loading">Cargando...</div>
    
    <div v-else-if="postulaciones.length === 0">
      No hay postulaciones registradas.
    </div>
    
    <div v-else>
      <table class="post-table">
        <thead>
          <tr>
            <th>Link</th>
            <th>Fecha de creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in postulaciones" :key="post.id">
            <td><a :href="post.link" target="_blank" rel="noopener noreferrer">{{ post.link }}</a></td>
            <td>{{ formatFecha(post.created_at) }}</td>
            <td>
              <button @click="eliminar(post.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { fetchPostulaciones, deletePostulacion } from '../components/api.js';

export default {
  name: 'View3',
  data() {
    return {
      postulaciones: [],
      loading: true,
      error: null
    };
  },
  async mounted() {
    try {
      const data = await fetchPostulaciones();
      this.postulaciones = Array.isArray(data) 
        ? data.map(item => ({
            id: item.id,
            link: item.link || '#',
            created_at: item.created_at
          }))
        : [];
    } catch (err) {
      console.error('Error fetching postulaciones:', err);
      this.error = 'Error al cargar las postulaciones.';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async eliminar(id) {
      if (!confirm('¿Estás seguro de que quieres eliminar esta postulación?')) return;

      try {
        await deletePostulacion(id);
        this.postulaciones = this.postulaciones.filter(post => post.id !== id);
      } catch (err) {
        console.error('Error deleting postulación:', err);
        this.error = 'Error al eliminar la postulación.';
      }
    },
    formatFecha(fecha) {
      if (!fecha) return 'Sin fecha';
      const date = new Date(fecha);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
.view3 {
  padding: 20px;
  max-width: 900px;
  margin: auto;
}

.post-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

.post-table th,
.post-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.post-table th {
  background-color: #f9fafb;
  font-weight: bold;
  color: #374151;
}

.post-table td a {
  color: #2563eb;
  text-decoration: none;
  word-break: break-all;
}

.post-table td a:hover {
  text-decoration: underline;
}

.post-table button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.post-table button:hover {
  background: #dc2626;
}

.error {
  color: #dc2626;
  margin-top: 20px;
  padding: 10px;
  background: #fee2e2;
  border-radius: 6px;
}
</style>
