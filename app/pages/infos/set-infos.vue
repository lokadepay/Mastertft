<script setup lang="ts">
    import { formatText } from '~/utils/textFormatter'

const { data: response } = await useFetch<any>('/api/b1/public/traits')

const traits = computed(() => response.value?.data || [])

const formatBreakpoints = (bpData: any) => {
    if (!bpData || !Array.isArray(bpData)) return []

    return bpData.map((bp: any) => {
        return {
            minUnits: Number(bp.unitsNeeded),
            effect: bp.effect,
            level: bp.level ? bp.level.toLowerCase() : 'bronze'
        }
    })
}
</script>

<template>
    <div class="container">

        <div class="header">
            <h1 class="header__title">Set infos</h1>
            <p class="header__desc">Toutes les infos du set 16 de TFT</p>
        </div>

        <div class="traits-grid">
            <TraitsCard
                v-for="trait in traits"
                :key="trait.id"
                :trait="{
                    name: trait.name,
                    img: trait.imageUrl,
                    description: trait.description,
                    breakpoints: formatBreakpoints(trait.breakpoints)
                }"
                :units="[]"
            >

            </TraitsCard>
        </div>

    </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;

.container {
    padding: 0 50px;

    .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        &__title {
            font-family: $title-font;
            color: $light-purple;
            font-size: 80px;
        }
        &__desc {
            font-family: $text-font;
            font-size: 20px;
            color: $common-text;
        }
    }

    .traits-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    }
}

</style>