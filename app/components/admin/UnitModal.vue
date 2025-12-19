<script setup lang="ts">
import { z } from 'zod'


// --- PROPS & EMITS ---
const props = defineProps<{
    modelValue: boolean
    unitToEdit?: any | null // null -> création, sinon -> édition
}>()

const emit = defineEmits(['update:modelValue', 'success'])

// --- DATA FETCHING ---
const { data: allTraits } = await useFetch('/api/b1/public/traits', {
  transform: (res:any) => res.data
})
const { data: allItems } = await useFetch('/api/b1/public/items', {
  transform: (res:any) => res.data
})

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
    abilityPower: 100,
    attackSpeed: 0.65,
    attackRange: 1,

    // Unlockables SET 16
    unlockCondition: '',
    unlockIconUrl: '',
    
    // Ability
    scalingStats: [{ statName: '', statValue: '' }],
    abilityName: '',
    abilityActive: '',
    abilityPassive: '',

    // Traits et Items
    selectedTraits: [''] as string[],
    selectedItems: [] as string[],

    // Meta stats
    playRate: undefined as number | undefined,
    top4Rate: undefined as number | undefined,
    averagePlace: undefined as number | undefined
})


// --- FILTRE & TRI ITEMS ---
// On détecte si le champion est Bilgewater
const isBilgewaterUnit = computed(() => {
  if (!allTraits.value) return false
  return state.selectedTraits.some(id => {
    const trait = allTraits.value.find(t => t.id === id)
    return trait?.name.toLowerCase().includes('bilgewater')
  })
})

const currentItemFilters = ref(['completed']) // Items complets par défaut
const currentSort = ref('top4Rate')
const sortDirection = ref(-1)

const itemFilters = computed(() => [
  { label: 'Completed', value: 'completed' },
  { label: 'Artifacts', value: 'artifact' },
  { label: 'Emblems', value: 'emblem' },
  { label: 'Radiants', value: 'radiant' },
  { label: 'Darkins', value: 'darkin' },

  {
    label: 'Bilgewater',
    value: 'bilgewater',
    hidden: !isBilgewaterUnit.value
  }
])

// Gestion filtres
const toggleFilter = (val: string) => {
  if (currentItemFilters.value.includes(val)) {
    currentItemFilters.value = currentItemFilters.value.filter(v => v !== val)
  } else {
    currentItemFilters.value.push(val)
  }
}

// Gestion tri
const setSort = (key: string) => {
  if (currentSort.value === key) {
    sortDirection.value *= -1
  } else {
    currentSort.value = key
    sortDirection.value = (key === 'averagePlace') ? 1 : -1
  }
}

//Liste finale filtrée, triée et coupée
const filteredItems = computed(() => {
  if (!allItems.value) return []
  if (currentItemFilters.value.length === 0) return []

  return allItems.value
    //Filtre
    .filter((item: any) => currentItemFilters.value.includes(item.type))

    //Tri
    .sort((a: any, b: any) => {
      const valA = a[currentSort.value] ?? (currentSort.value === 'averagePlace' ? 9 : -1)
      const valB = b[currentSort.value] ?? (currentSort.value === 'averagePlace' ? 9 : -1)

      return (valA - valB) * sortDirection.value
    })

    //Limite de 15 items
    .slice(0 ,15)
})

// --- TRAITS & SCALING ---
const addTrait = () => state.selectedTraits.push('')
const removeTrait = (index: number) => state.selectedTraits.splice(index, 1)
const addScalingStat = () => state.scalingStats.push({ statName: '', statValue: '' })
const removeStat = (index: number) => state.scalingStats.splice(index, 1)

// --- RESET ---
function resetState() {
    state.name = ''
    state.riotApiId = ''
    state.cost = 1
    state.imageUrl = ''
    state.health = ''
    state.attackDamage = ''
    state.abilityPower = 100
    state.startMana = 0
    state.maxMana = 100
    state.armor = 20
    state.magicResist = 20
    state.attackSpeed = 0.65
    state.attackRange = 1

    state.unlockCondition = ''
    state.unlockIconUrl = ''

    state.scalingStats = [{ statName: '', statValue: '' }]
    state.abilityName = ''
    state.abilityActive = ''
    state.abilityPassive = ''

    state.selectedTraits = ['']
    state.selectedItems = []

    state.playRate = undefined
    state.top4Rate = undefined
    state.averagePlace = undefined
}

// --- WATCHER ---
watch(() => props.unitToEdit, (newUnit) => {
  if (newUnit) {
    state.name = newUnit.name
    state.riotApiId = newUnit.riotApiId
    state.cost = newUnit.cost
    state.imageUrl = newUnit.imageUrl

    state.health = String(newUnit.health)
    state.startMana = newUnit.startMana
    state.maxMana = newUnit.maxMana
    state.armor = newUnit.armor
    state.magicResist = newUnit.magicResist
    state.attackDamage = String(newUnit.attackDamage)
    state.abilityPower = newUnit.abilityPower || 100
    state.attackSpeed = newUnit.attackSpeed
    state.attackRange = newUnit.attackRange

    state.unlockCondition = newUnit.unlockCondition || ''
    state.unlockIconUrl = newUnit.unlockIconUrl || ''

    state.abilityName = newUnit.ability?.name || ''
    state.abilityActive = newUnit.ability?.acive || ''
    state.abilityPassive = newUnit.ability?.passive || ''
    if (newUnit.ability?.scalingStats?.length) {
      state.scalingStats = newUnit.ability.scalingStats.map((s: any) => ({
        statName: s.statName,
        statValue: s.statValue
      }))
    } else {
      state.scalingStats = [{ statName: '', statValue: '' }]
    }

    state.selectedTraits = newUnit.traits?.length
      ? newUnit.traits.map((t: any) => t.traitId)
      : ['']
    
    state.selectedItems = newUnit.recommendedItems?.map((i :any) => i.itemId) || []

    state.playRate = newUnit.playRate
    state.top4Rate = newUnit.top4Rate
    state.averagePlace = newUnit.averagePlace

  } else {
    resetState()
  }
}, { immediate: true })

// --- SUBMIT ---
async function onSubmit() {
  const traitIds = state.selectedTraits.filter(id => id !== '')
  const cleanScalingStats = state.scalingStats.filter(s => s.statName && s.statValue)

  const payload = {
    ...state,
    traitIds,
    ability: {
      name: state.abilityName,
      active: state.abilityActive,
      passive: state.abilityPassive,
      scalingStats: cleanScalingStats
    },
    itemIds: state.selectedItems
  }

  const url = props.unitToEdit
    ? `/api/b1/admin/units/${props.unitToEdit.id}`
    : '/api/b1/admin/units/create'

  try {
    await $fetch(url, {
      method: props.unitToEdit ? 'PUT' : 'POST',
      body: payload
    })
    emit('success')
    emit('update:modelValue', false)
  } catch (e) {
    alert('Erreur lors de la sauvegarde')
    console.error(e)
  }
}
</script>

<template>
</template>