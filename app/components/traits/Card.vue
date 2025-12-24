<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import { formatText } from '~/utils/textFormatter'

interface Breakpoint {
    minUnits: number
    effect: string
    level: 'bronze' | 'silver' | 'gold' | 'prismatic'
}

interface Trait {
    name: string
    img: string
    description: string
    breakpoints: Breakpoint[]
}

interface Unit {
    id: string
    name: string
    img: string
    cost: number
}

const props = defineProps<{
    trait: Trait
    units: Unit[] 
}>()

const iconComponent = computed(() => {
    const cleanName = props.trait.name.replace(/\s+/g, '')

    return resolveComponent(cleanName)
})

const getBreakpointColor = (level: string) => {
    switch(level) {
        case 'bronze': return 'background-color: #8C6239'
        case 'silver': return 'background-color: #C0C0C0'
        case 'gold': return 'background-color: #D4AF37'
        case 'prismatic': return 'background-color: #64E0D7'
        default: return '#ffffff'
    }
}

const getUnitColor = (cost: number) => {
    switch(cost) {
        case 1: return '#B0B0B0'
        case 2: return '#4CAF50'
        case 3: return '#2196F3'
        case 4: return '#9C27B0'
        case 5: return '#FFB300'
        default: return '#ffffff'
    }
}
</script>

<template>
<article class="card">

    <header class="card__header">
        <div class="icon-wrapper">
           <TraitBadge>
                <component 
                    :is="iconComponent"
                    class="trait-icon"
                />
           </TraitBadge>
        </div>
            <div class="card__header__infos">
            <h2 class="trait-name">{{ trait.name }}</h2>
            <div class="trait-levels">
                <span
                    v-for="(bp, index) in trait.breakpoints"    
                    :key="index"
                    class="level-badge"
                    :style="{ color: getBreakpointColor(bp.level) }"
                >
                    {{ bp.minUnits }}
                </span>
            </div>
        </div>
    </header>

    <div class="card__body">
        <p class="description" v-html="formatText(trait.description)"></p>

        <ul class="card__body__bp-list">
            <li v-for="(bp, index) in trait.breakpoints" :key="index" class="breakpoint">
                <span class="count">({{ bp.minUnits }})</span>
                <span class="effect" v-html="formatText(bp.effect)"></span>
            </li>
        </ul>
    </div>

    <footer class="card__footer">
        <div class="card__footer__grid">
            <div
                v-for="unit in units"
                :key="unit.id"
                class="unit-badge"
                :style="{ borderColor: getUnitColor(unit.cost) }"
            >
                <img :src="unit.img" :alt="unit.name" />
            </div>
        </div>
    </footer>

</article>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;

.card {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 200px ;
    height: 360px;
    background-color: $dark-purple ;
    border: 4px solid $light-purple;
    border-radius: 8px;
    &__header {
        display: flex ;
        flex-direction: row;
        align-items: center;
        width: 100%;
        background-color: $deep-purple;
        padding: 8px;
        border-radius: 8px 8px 0 0;
        border-bottom: 1px solid $light-purple;
        gap: 8px;

        .icon-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            .trait-icon {
                width: 32px;
                height: 32px;
                color: $light-purple;
            }
        }

        &__infos {
            display: flex;
            flex-direction: row;
            width: 100%;
            justify-content: space-between;
        }
    }
}
</style>