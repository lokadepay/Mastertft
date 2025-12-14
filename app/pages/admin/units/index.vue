<template>
  <div>
    <h1>Page d'administration des unités</h1>

    <button @click="showModal = true">Ajouter/Modifier Unité</button>

    <UnitModal v-model="showModal" />
  </div>
</template>

<script setup lang="ts">
import UnitModal from '~/components/admin/UnitModal.vue';

const showModal = ref(false); 
</script>