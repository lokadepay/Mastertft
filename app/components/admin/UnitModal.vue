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
}

// --- WATCHER ---
watch(() => props.unitToEdit, (newUnit) => {
    if (newUnit) {
        // EDIT
        Object.assign(state, {
            ...newUnit,
            health: String(newUnit.health),
            attackDamage: String(newUnit.attackDamage),
            ability: newUnit.ability || { name: '', active: '', passive:'' },
            unlockCondition: newUnit.unlockCondition || '',
            unlockIconUrl: newUnit.unlockIconUrl || ''
        })
    } else {
        // CREATION
        resetState()
    }
}, { immediate: true })

// --- DDRAGON ---
const ddragonQuery = ref('')
const ddragonResults = ref<any[]>([])
const loadingSearch = ref(false)

let searchTimeout: NodeJS.Timeout | null = null

async function searchDDragon(query: string): Promise<any[]> {
    if (query.length < 2) return []
    loadingSearch.value = true
    try {
        const results = await $fetch<any[]>('/api/b1/admin/ddragon/search', {
            params: { q: query, type: 'units' }
        })
        return results
    } catch (e) {
        console.error(e)
        return []
    } finally {
        loadingSearch.value = false
    }
}

watch(ddragonQuery, (newQuery) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }

  if (newQuery.length < 2) {
    ddragonResults.value=[]
    return
  }

  searchTimeout = setTimeout(async () => {
    ddragonResults.value = await searchDDragon(newQuery)
  }, 300)

})

function onSelectDDragon(selection: any) {

  console.log('--- Selection DDragon ---', selection)
  console.log('--- Etat avant ---', { ...state })
  
    state.name = selection.label
    state.riotApiId = selection.riotApiId
    state.imageUrl = selection.imageUrl

    if (selection.stats) {
        state.cost = selection.stats.cost || 1
        state.startMana = selection.stats.startMana || 0
        state.maxMana = selection.stats.maxMana || 100
        state.armor = selection.stats.armor || 20
        state.magicResist = selection.stats.magicResist || 20
        state.attackSpeed = selection.stats.attackSpeed || 0.65
        state.attackRange = selection.stats.attackRange || 1

        // Scaling HP
        const baseHP = selection.stats.health || 500
        const baseHP_2 = Math.round(baseHP * 1.8)
        const baseHP_3 = Math.round(baseHP_2 * 1.8)
        state.health = `${baseHP}/${baseHP_2}/${baseHP_3}`

        // Scaling AD
        const baseAD = selection.stats.attackDamage || 50
        const baseAD_2 = Math.round(baseAD * 1.5)
        const baseAD_3 = Math.round(baseAD_2 * 1.5)
        state.attackDamage = `${baseAD}/${baseAD_2}/${baseAD_3}`

        // Ability
        state.ability.name = selection.stats.abilityName || ''
        state.ability.active = selection.stats.abilityDesc?.replace(/<[^>]*>?/gm, '') || ''
    }
}

// --- SOUMISSION FORM ---
async function onSubmit() { 
    try {
        const isEditing = !!props.unitToEdit

        const url = isEditing
        ? `/api/b1/admin/units/${props.unitToEdit.id}` 
        : '/api/b1/admin/units/create'   
        const method = isEditing ? 'PUT' : 'POST'    

        await $fetch(url, { method, body: state })

        emit('update:modelValue', false)
        emit('success')

    } catch (error: any) {
        console.error("Erreur sauvegarde :", error)
    }
}
</script>

<template>
</template>