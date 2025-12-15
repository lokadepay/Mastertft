<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)

const handleScroll = () => {
    isScrolled.value = window.scrollY > 50 // Nombre de px scroller où la réduction s'active
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
<nav class="navbar" :class="{ 'shrink': isScrolled }">

    <div class="navbar_content">
    </div>

</nav>    
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;

.navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 80px;
    background-color: $dark-purple;
    border-bottom: 1px solid $light-purple;
    box-shadow: 0px 4px 10px 4px rgba($light-purple, 0.25);

    transition: height 0.3s ease-in-out, backround-color 0.3s;

    z-index: 50;

    display: flex;
    align-items: center;

    &.shrink {
        height: 40px; /* Hauteur au scroll */
    }
}

</style>