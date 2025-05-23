<template>
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
</template>

<script>
export default {
  name: 'FormularioFondo',
  props: {
    initialData: {
      type: Object,
      default: () => ({
        nombre: '',
        url: '',
        plataforma: '',
        fechainicio: '',
        fechacierre: ''
      })
    },
    editing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submit', 'cancel'],
  data() {
    return {
      form: { ...this.initialData }
    }
  },
  watch: {
    initialData: {
      handler(newVal) {
        this.form = { ...newVal }
      },
      deep: true
    }
  },
  methods: {
    handleSubmit() {
      // Validación de fechas
      const fechaInicio = new Date(this.form.fechainicio)
      const fechaCierre = new Date(this.form.fechacierre)

      if (isNaN(fechaInicio.getTime())) {
        alert('Por favor ingrese una fecha de apertura válida')
        return
      }

      if (isNaN(fechaCierre.getTime())) {
        alert('Por favor ingrese una fecha de cierre válida')
        return
      }

      if (fechaCierre < fechaInicio) {
        alert('La fecha de cierre no puede ser anterior a la fecha de apertura')
        return
      }

      // Emitir los datos del formulario
      this.$emit('submit', {
        ...this.form,
        fechainicio: fechaInicio.toISOString(),
        fechacierre: fechaCierre.toISOString()
      })
    },
    cancelEdit() {
      this.$emit('cancel')
      this.resetForm()
    },
    resetForm() {
      this.form = {
        nombre: '',
        url: '',
        plataforma: '',
        fechainicio: '',
        fechacierre: ''
      }
    }
  }
}
</script>

<style scoped>
/* Puedes mover aquí los estilos específicos del formulario */
.form-card {
  margin-bottom: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn.primary {
  background-color: #4CAF50;
  color: white;
}

.btn.secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn.primary:hover {
  background-color: #45a049;
}

.btn.secondary:hover {
  background-color: #e0e0e0;
}
</style>