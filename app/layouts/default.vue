<script setup>
</script>

<template>
<div class="layout">
    <Background />
    <Header />

    <main class="layout__column">
        <slot />
    </main>
</div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;

.layout{
    &__column {
        width: 100%;
        max-width: 1200px;
        min-height: 100vh;
        margin: 0 auto;
        padding: 100px 20px 0 20px;
        background-color: rgba($straight-purple, 0.1);
        backdrop-filter: blur(1px); 
        border-left: 1px solid $light-purple;
        border-right: 1px solid $light-purple;
    }
}
</style>