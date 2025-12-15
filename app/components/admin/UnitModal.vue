<script setup lang="ts">
import { z } from 'zod'


// --- PROPS & EMITS ---
const props = defineProps<{
    modelValue: boolean
    unitToEdit?: any | null // null -> création, sinon -> édition
}>()

const emit = defineEmits(['update:modelValue', 'success'])

// --- STATE ---
const state = reactive({
    name: '',
    riotApiId: '',
    cost: 1,
    imageUrl: '',

    // Stats ingame
    health: '',
    startMana: 0,
    maxMana: 100,
    armor: 20,
    magicResist: 20,
    attackDamage: '',
    attackSpeed: 0.65,
    attackRange: 1,

    // Unlockables SET 16
    unlockCondition: '',
    unlockIconUrl: '',

    // Ability
    ability: {
        name: '',
        active: '',
        passive: '',
        scalingStats: '',
    },

    // Meta stats
    playRate: undefined as number | undefined,
    top4Rate: undefined as number | undefined,
    averagePlace: undefined as number | undefined
})

// --- VALIDATION ---
const schema = z.object({
    name: z.string().min(1, 'Nom Requis'),
    riotApiId: z.string().min(1, 'Riot ID requis'),
    cost: z.number().min(1).max(7),

    health: z.string().min(1, 'HP requis'),
    attackDamage: z.string().min(1, 'AD requis'),

    ability: z.object({
        name: z.string().min(1, 'Nom du spell requis'),
        active: z.string().min(1, 'Description active requise')
    })
})

// --- RESET ---
function resetState() {
    state.name = ''
    state.riotApiId = ''
    state.cost = 1
    state.imageUrl = ''
    state.health = ''
    state.attackDamage = ''
    state.startMana = 0
    state.maxMana = 100
    state.armor = 20
    state.magicResist = 20
    state.attackSpeed = 0.65
    state.attackRange = 1
    state.unlockCondition = ''
    state.unlockIconUrl = ''
    state.ability = { name: '', active: '', passive: '', scalingStats: '' }
    state.playRate = undefined
    state.top4Rate = undefined
    state.averagePlace = undefined
}

// --- WATCHER ---
watch(() => props.unitToEdit, (newUnit) => {
    if (newUnit) {
        // EDIT
        let scalingString = ''
        if (newUnit.ability?.scalingSTats && Array.isArray(newUnit.ability.scalingStats)) {
          scalingString= newUnit.ability.scalingStats
            .map((s: any) => `${s.statName} : ${s.statValue}`)  
            .join('\n')
        }

        Object.assign(state, {
            ...newUnit,
            health: String(newUnit.health),
            attackDamage: String(newUnit.attackDamage),
            ability: {
              name: newUnit.ability?.name || '',
              active: newUnit.ability?.active || '',
              passive: newUnit.ability?.passive || '',
              scalingStats: scalingString
            },
            unlockCondition: newUnit.unlockCondition || '',
            unlockIconUrl: newUnit.unlockIconUrl || ''
        })
    } else {
        // CREATION
        resetState()
    }
}, { immediate: true })

// --- SOUMISSION FORM ---
async function onSubmit() { 
    try {
      schema.parse(state)

      const isEditing = !!props.unitToEdit
      const url = isEditing
        ? `/api/b1/admin/units/${props.unitToEdit.id}`
        : '/api/b1/admin/units/create'        
      const method = isEditing ? 'PUT' : 'POST'

      // Nettoyage
      const payload = {
        name: state.name,
        riotApiId: state.riotApiId,
        cost: state.cost,
        imageUrl: state.imageUrl,

        health: state.health,
        startMana: state.startMana,
        maxMana: state.maxMana,
        armor: state.armor,
        magicResist: state.magicResist,
        attackDamage: state.attackDamage,
        attackSpeed: state.attackSpeed,
        attackRange: state.attackRange,

        unlockCondition: state.unlockCondition || undefined,
        unlockIconUrl: state.unlockIconUrl || undefined,

        playRate: state.playRate,
        top4Rate: state.top4Rate,
        averagePlace: state.averagePlace,

        ability: {
          name: state.ability.name,
          active: state.ability.active,
          passive: state.ability.passive || undefined,
          scalingStats: state.ability.scalingStats || undefined,
        }
      }

      await $fetch(url, { method, body: payload })

      console.log(`Succès: ${isEditing ? 'Champion modifié' : 'Champion créé'}`)
      emit('update:modelValue', false)
      emit('success')

    } catch (error: any) {
      console.error("Erreur sauvegarde :",error)
    }
}
</script>

<template>
</template>