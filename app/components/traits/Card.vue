<script setup lang="ts">
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

defineProps<{
    trait: Trait
    units: Unit[] 
}>()

const getBreakpointColor = (level: string) => {
    switch(level) {
        case 'bronze': return '$bronze'
        case 'silver': return '$silver'
        case 'gold': return '$gold'
        case 'prismatic': return '$prisma'
        default: return '$light-purple'
    }
}

const getUnitColor = (cost: number) => {
    switch(cost) {
        case 1: return '$one-cost'
        case 2: return '$two-cost'
        case 3: return '$three-cost'
        case 4: return '$four-cost'
        case 5: return '$five-cost'
        default: return '$light-purple'
    }
}
</script>

<template>
<article class="card">

    <header class="card__header">
        <div class="icon-wrapper">
            <img :src="trait.img" :alt="trait.name" />
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
    width: 120px !important;
    height: 170px;
    background-color: $dark-purple !important;
    border: 4px solid $light-purple;
    &__header {
        display: flex !important;
        flex-direction: row !important;
        background-color: $deep-purple;
    }
}
</style>