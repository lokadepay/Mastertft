<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

// --- PROPS & EMITS ---
const props = defineProps<{
    modelValue: boolean
    unitToEdit?: any | null // null -> création, sinon -> édition
}>()

const emit = defineEmits(['update:modelValue', 'success'])
// const toast = useToast()

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
const loadingSearch = ref(false)

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

function onSelectDDragon(selection: any) {
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
async function onSubmit(event: FormSubmitEvent<any>) {
    try {
        const isEditing = !!props.unitToEdit

        const url = isEditing
        ? `/api/b1/admin/units/${props.unitToEdit.id}` 
        : '/api/b1/admin/units/create'   
        const method = isEditing ? 'PUT' : 'POST'    

        await $fetch(url, { method, body: event.data })

//        toast.add({ 
//            title: 'Succès', 
//            description: isEditing ? 'Champion modifié !' : 'Champion créé !', 
//            color: 'green'
//        })

        emit('update:modelValue', false)
        emit('success')

    } catch (error: any) {
        console.error(error)
//        toast.add({
//            title: 'Erreur',
  //          description: error.data?.message || "Erreur sauvegarde",
    //        color: 'red'
      //  })
    }
}
</script>

<template>
    <UModal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" :ui="{ width: 'sm:max-w-4xl' }">
        <UCard>
            <template #header>
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-bold">
                        {{ unitToEdit ? `Modifier ${unitToEdit.name}` : 'Nouveau Champion' }}
                    </h2>
                    <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" @click="emit('update:modelValue', false)" />
                </div>
            </template>

            <div class="h-[70vh] overflow-y-auto pr-4 custom-scrollbar">

                <div v-if="!unitToEdit" class="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <UFormGroup label="Recherche Auto (Set 16)" description="Tape le nom pour pré-remplir">
                        <USelectMenu
                            searchable
                            :search="searchDDragon"
                            placeholder="Ex: Jinx"
                            option-attribute="label"
                            @change="onSelectDDragon"
                            :loading="loadingSearch"
                        >
                        <template #item="{ item }: { item: any }">
                            <div class="flex items-center gap-2">
                                <img :src="item.imageUrl" class="w-8 h-8 rounded bg-gray-800" />
                                <div class="flex flex-col">
                                <span class="font-medium">{{ item.label }}</span>
                                <span class="text-xs text-gray-500">{{ item.riotId }}</span>
                                </div>
                            </div>
                        </template>
                        </USelectMenu>
                    </UFormGroup> 
                </div>

                <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-6">
          
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-3 flex justify-center">
                    <img :src="state.imageUrl || 'https://placehold.co/100'" class="w-24 h-24 rounded-lg object-cover border-2 border-gray-200" />
                    </div>
                    <div class="col-span-9 grid grid-cols-2 gap-4">
                    <UFormGroup label="Nom" name="name" required>
                        <UInput v-model="state.name" />
                    </UFormGroup>
                    <UFormGroup label="Riot API ID" name="riotApiId" required>
                        <UInput v-model="state.riotApiId" disabled />
                    </UFormGroup>
                    <UFormGroup label="URL Image" name="imageUrl" class="col-span-2">
                        <UInput v-model="state.imageUrl" />
                    </UFormGroup>
                    </div>
                </div>

                <UDivider label="Statistiques" />

                <div class="grid grid-cols-4 gap-4">
                    <UFormGroup label="Coût" name="cost">
                    <UInput type="number" v-model.number="state.cost" />
                    </UFormGroup>

                    <UFormGroup label="PV (Health)" name="health">
                    <UInput v-model="state.health" placeholder="ex: 600/1080/1944" />
                    </UFormGroup>
                    <UFormGroup label="AD (Dégâts)" name="attackDamage">
                    <UInput v-model="state.attackDamage" placeholder="ex: 50/75/113" />
                    </UFormGroup>
                    
                    <UFormGroup label="Vitesse (AS)" name="attackSpeed">
                    <UInput type="number" step="0.01" v-model.number="state.attackSpeed" />
                    </UFormGroup>

                    <UFormGroup label="Mana Start" name="startMana">
                    <UInput type="number" v-model.number="state.startMana" />
                    </UFormGroup>
                    <UFormGroup label="Mana Max" name="maxMana">
                    <UInput type="number" v-model.number="state.maxMana" />
                    </UFormGroup>
                    <UFormGroup label="Armure" name="armor">
                    <UInput type="number" v-model.number="state.armor" />
                    </UFormGroup>
                    <UFormGroup label="MR" name="magicResist">
                    <UInput type="number" v-model.number="state.magicResist" />
                    </UFormGroup>
                </div>

                <UDivider label="Compétence" />

                <div class="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <UFormGroup label="Nom du Sort" name="ability.name">
                    <UInput v-model="state.ability.name" />
                    </UFormGroup>
                    <div class="grid grid-cols-2 gap-4">
                    <UFormGroup label="Active" name="ability.active">
                        <UTextarea v-model="state.ability.active" :rows="3" />
                    </UFormGroup>
                    <UFormGroup label="Passif" name="ability.passive">
                        <UTextarea v-model="state.ability.passive" :rows="3" />
                    </UFormGroup>
                    </div>
                </div>

                <UDivider label="Set 16 Unlockables" />

                <div class="grid grid-cols-2 gap-4 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <UFormGroup label="Condition déblocage" name="unlockCondition">
                        <UTextarea v-model="state.unlockCondition" placeholder="Laisser vide si standard..." />
                    </UFormGroup>
                    <UFormGroup label="Icône URL" name="unlockIconUrl">
                        <UInput v-model="state.unlockIconUrl" icon="i-heroicons-photo" />
                    </UFormGroup>
                </div>

                <div class="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white dark:bg-gray-900 border-t dark:border-gray-800 p-4 -mx-6 -mb-6">
                    <UButton color="gray" variant="ghost" @click="emit('update:modelValue', false)">
                    Annuler
                    </UButton>
                    <UButton type="submit" color="primary" icon="i-heroicons-check">
                    {{ unitToEdit ? 'Enregistrer' : 'Créer' }}
                    </UButton>
                </div>

                </UForm>

            </div>
        </UCard>
    </UModal>
</template>
