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
    state.ability = { name: '', active: '', passive: '' }
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

    // Nettoyage
    ddragonQuery.value = ''
    ddragonResults.value = []
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
  <div 
    v-if="modelValue" 
    class="fixed inset-0 z-50 overflow-y-auto bg-gray-900/75 dark:bg-gray-900/75 flex items-start justify-center p-4 sm:p-0" 
    @click="emit('update:modelValue', false)"
  >
    <div 
      class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full my-8" 
      @click.stop=""
    >
      
      <div class="p-4 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ unitToEdit ? `Modifier ${unitToEdit.name}` : 'Nouveau Champion' }}
          </h2>
          <button 
            type="button"
            class="p-2 -m-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition" 
            @click="emit('update:modelValue', false)"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div class="p-4 sm:px-6 sm:py-4">
        <div class="h-[70vh] overflow-y-auto pr-4 custom-scrollbar">

          <div v-if="!unitToEdit" class="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg relative">
            <div class="mb-4 relative">
                <label for="ddragon-search" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Recherche Auto (Set 16)</label>
                <p class="text-xs text-gray-500 mb-2">Tape le nom pour pré-remplir</p>
                
                <input 
                    id="ddragon-search" 
                    type="text" 
                    placeholder="Ex: Jinx"
                    v-model="ddragonQuery"
                    class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm pr-10"
                />

                <div v-if="loadingSearch" class="absolute right-3 top-[34px] flex items-center pointer-events-none">
                    <svg class="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
                        <path fill="currentColor" class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            </div>
            
            <ul 
                v-if="ddragonResults.length > 0" 
                class="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto left-0 top-[85px]"
            >
                <li 
                    v-for="item in ddragonResults" 
                    :key="item.riotApiId"
                    class="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition flex items-center gap-2"
                    @click="onSelectDDragon(item)"
                >
                    <img :src="item.imageUrl" class="w-8 h-8 rounded bg-gray-800" :alt="item.label" />
                    <div class="flex flex-col">
                        <span class="font-medium text-gray-900 dark:text-white">{{ item.label }}</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">{{ item.riotApiId }}</span>
                    </div>
                </li>
            </ul>
          </div>

          <form @submit.prevent="onSubmit" class="space-y-6">
            
            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-3 flex justify-center">
                <img :src="state.imageUrl || 'https://placehold.co/100'" class="w-24 h-24 rounded-lg object-cover border-2 border-gray-200" />
              </div>
              <div class="col-span-9 grid grid-cols-2 gap-4">
                
                <div class="mb-4">
                  <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Nom</label>
                  <input id="name" v-model="state.name" required class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm" />
                </div>
                
                <div class="mb-4">
                  <label for="riotApiId" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Riot API ID</label>
                  <input id="riotApiId" v-model="state.riotApiId" required disabled class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm disabled:opacity-50" />
                </div>
                
                <div class="col-span-2 mb-4">
                  <label for="imageUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-200">URL Image</label>
                  <input id="imageUrl" v-model="state.imageUrl" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm" />
                </div>
              </div>
            </div>

            <div class="relative flex justify-center my-6">
              <div class="absolute inset-0 flex items-center" aria-hidden="true">
                <div class="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div class="relative flex justify-center">
                <span class="bg-white dark:bg-gray-800 px-3 text-sm font-medium text-gray-900 dark:text-white">Statistiques</span>
              </div>
            </div>

            <div class="grid grid-cols-4 gap-4">
                
              <div class="mb-4">
                <label for="cost" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Coût</label>
                <input id="cost" type="number" v-model.number="state.cost" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm" />
              </div>

              <div class="mb-4">
                <label for="health" class="block text-sm font-medium text-gray-700 dark:text-gray-200">PV (Health)</label>
                <input id="health" v-model="state.health" placeholder="ex: 600/1080/1944" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm" />
              </div>
              
              <div class="mb-4">
                <label for="attackDamage" class="block text-sm font-medium text-gray-700 dark:text-gray-200">AD (Dégâts)</label>
                <input id="attackDamage" v-model="state.attackDamage" placeholder="ex: 50/75/113" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm" />
              </div>
              
              <div class="mb-4">
                <label for="attackSpeed" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Vitesse (AS)</label>
                <input id="attackSpeed" type="number" step="0.01" v-model.number="state.attackSpeed" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm" />
              </div>

              <div class="mb-4">
                <label for="startMana" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Mana Start</label>
                <input id="startMana" type="number" v-model.number="state.startMana" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm" />
              </div>
              
              <div class="mb-4">
                <label for="maxMana" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Mana Max</label>
                <input id="maxMana" type="number" v-model.number="state.maxMana" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm" />
              </div>
              
              <div class="mb-4">
                <label for="armor" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Armure</label>
                <input id="armor" type="number" v-model.number="state.armor" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm" />
              </div>
              
              <div class="mb-4">
                <label for="magicResist" class="block text-sm font-medium text-gray-700 dark:text-gray-200">MR</label>
                <input id="magicResist" type="number" v-model.number="state.magicResist" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm" />
              </div>
            </div>

            <div class="relative flex justify-center my-6">
              <div class="absolute inset-0 flex items-center" aria-hidden="true">
                <div class="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div class="relative flex justify-center">
                <span class="bg-white dark:bg-gray-800 px-3 text-sm font-medium text-gray-900 dark:text-white">Compétence</span>
              </div>
            </div>

            <div class="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                
              <div class="mb-4">
                <label for="abilityName" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Nom du Sort</label>
                <input id="abilityName" v-model="state.ability.name" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm" />
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                
                <div class="mb-4">
                  <label for="abilityActive" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Active</label>
                  <textarea id="abilityActive" v-model="state.ability.active" :rows="3" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm"></textarea>
                </div>
                
                <div class="mb-4">
                  <label for="abilityPassive" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Passif</label>
                  <textarea id="abilityPassive" v-model="state.ability.passive" :rows="3" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm"></textarea>
                </div>
              </div>
            </div>

            <div class="relative flex justify-center my-6">
              <div class="absolute inset-0 flex items-center" aria-hidden="true">
                <div class="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div class="relative flex justify-center">
                <span class="bg-white dark:bg-gray-800 px-3 text-sm font-medium text-gray-900 dark:text-white">Set 16 Unlockables</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                
              <div class="mb-4">
                <label for="unlockCondition" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Condition déblocage</label>
                <textarea id="unlockCondition" v-model="state.unlockCondition" placeholder="Laisser vide si standard..." class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm"></textarea>
              </div>
              
              <div class="mb-4">
                <label for="unlockIconUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Icône URL</label>
                <input id="unlockIconUrl" v-model="state.unlockIconUrl" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm" />
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 -mx-6 -mb-6">
              
              <button 
                type="button"
                class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition" 
                @click="emit('update:modelValue', false)"
              >
                Annuler
              </button>
              
              <button 
                type="submit" 
                class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition"
              >
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                {{ unitToEdit ? 'Enregistrer' : 'Créer' }}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  </div>
</template>