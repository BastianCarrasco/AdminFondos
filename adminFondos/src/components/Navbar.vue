<template>
  <nav class="navbar">
    <div class="navbar-brand">ADMIN FONDOS</div>
    <ul class="navbar-menu">
      <li class="navbar-item">
        <router-link 
          to="/view1" 
          active-class="active"
          exact-active-class="exact-active"
        >
          Editar Fondos
        </router-link>
      </li>
      <li class="navbar-item">
        <router-link 
          to="/view2" 
          active-class="active"
          exact-active-class="exact-active"
        >
          Estadisticas Fondos
        </router-link>
      </li>
      <li class="navbar-item">
        <router-link 
          to="/view3" 
          active-class="active"
          exact-active-class="exact-active"
        >
          Propuestas
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'Navbar'
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2c3e50;
  color: white;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.navbar-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar-item {
  margin-left: 1.5rem;
}

.navbar-item a {
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  padding: 0.5rem 0;
}

.navbar-item a:hover {
  color: #42b983;
}

.active {
  color: #42b983;
  font-weight: bold;
}

.exact-active {
  color: #42b983;
  font-weight: bold;
  border-bottom: 2px solid #42b983;
}
</style>