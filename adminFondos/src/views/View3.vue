<template>
  <div class="view3-container">
    <div class="view3">
      <div v-if="loading" class="fullscreen-loader">
        <img src="/reloj.png" alt="Cargando..." class="spinner">
      </div>

      <div v-else-if="postulaciones.length === 0" class="empty-state">
        <div class="empty-content">
          <img src="/reloj.png" alt="Reloj" class="spinner">
          <p>No hay postulaciones registradas.</p>

        </div>
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
.view3-container {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 60px);
  /* Asume 60px de altura del navbar */
  margin-top: 60px;
  /* Espacio para el navbar */
}

.view3 {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  width: 100%;
}

.fullscreen-loader {
  position: fixed;
  top: 60px;
  /* Altura del navbar */
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 100;
}

.empty-state {
  width: 100%;
  min-height: calc(100vh - 60px);
  /* Resta la altura del navbar */
  display: flex;
  justify-content: center;
  align-items: flex-start;
  /* Cambiado de center a flex-start */
  padding-top: 100px;
  /* Ajusta este valor para mover más arriba o abajo */
}

.empty-content {
  text-align: center;
  font-size: 1.5rem;
  color: #666;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 0;
  /* Aseguramos que no haya margen superior adicional */
}

.spinner {
  width: 100px;
  height: 100px;
  animation: spin 2s linear infinite;
  transform: scale(2);
  /* Mejor que scale: 2 para mejor compatibilidad */
  margin-top: 0;
  /* Eliminamos el margen superior que tenía antes */
  scale: 2;
  /* Aumenta el tamaño del spinner */
  margin-bottom: 50px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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