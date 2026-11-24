<script setup lang="ts">
import MainFooter from './components/MainFooter.vue'
import MainHeader from './components/MainHeader.vue'
</script>

<template>
  <MainHeader />
  <main class="app-main">
    <RouterView />
  </main>
  <MainFooter />
</template>
