<script setup lang="ts">
import { z } from 'zod'

const props = defineProps<{
    modelValue: boolean
    traitToEdit?: any | null // nul -> création, sinon -> édition

}>()

const emit = defineEmits(['update:modelValue', 'success'])

// --- LOADING & ERREURS ---
const isLoading = ref(false)
const errors = ref<Record<string, string>>({})

// --- DATA FETCHING ---
const { data: allUnits } = await useFetch('/api/b1/public/units', {
    transform: (res: any) => res.data || []
})

// --- STATE ---
const state = reactive({
    name: '',
    riotApiId: '',
    description: '',
    imageUrl: '',

    // Breakpoint
    breakpoints: [{
        unitsNeeded: 1,
        level: 'Bronze',
        effect: '',
    }]
})

// --- AJOUT AUTO CHAMPIONS ---
const linkedUnits = computed(() => {
    if (!props.traitToEdit || !allUnits.value) return []

    return allUnits.value.filter((unit: any) =>
        unit.traits?.some((t: any) => t.traitId === props.traitToEdit.id))
})

// --- VALIDATION ZOD ---
const schema = z.object({
    name: z.string().min(1, 'Nom Requis'),
    riotApiId: z.string().min(1, 'Riot ID requis'),
    description: z.string().min(1, 'Description requise'),

    breakpoints: z.array(z.object({
        unitsNeeded: z.number().min(1),
        level: z.string().min(1, 'Level requis'),
        effect: z.string().min(1, 'Effet requis'),
    })).min(1, 'Au moins un palier requis')
})

// --- BOUTONS BREAKPOINT ---
const addBreakpoint = () => {
    state.breakpoints.push({
        unitsNeeded: 1,
        level: 'Bronze',
        effect: ''
    })
}

const removeBreakpoint = (index: number) => {
    state.breakpoints.splice(index, 1)
}

// --- RESET ---
function resetState() {
    state.name = ''
    state.riotApiId = ''
    state.description = ''
    state.imageUrl = ''
    state.breakpoints = [{
        unitsNeeded: 1,
        level: 'Bronze',
        effect: ''
    }]
}

// --- WATCHER ---
watch(() => props.traitToEdit, (newTrait) => {
    errors.value = {}
    if (newTrait) {
        state.name = newTrait.name
        state.riotApiId = newTrait.riotApiId
        state.description = newTrait.description
        state.imageUrl = newTrait.imageUrl || ''

        if (newTrait.breakpoints && newTrait.breakpoints.length > 0) {
            state.breakpoints = newTrait.breakpoints.map((bp: any) => ({
                unitsNeeded: bp.unitsNeeded,
                level: bp.level,
                effect: bp.effect
            }))
        } else {
            state.breakpoints = [{ unitsNeeded: 2, level:'Bronze', effect: '' }]
        }
    } else {
        resetState()
    }
}, { immediate: true })

// --- SUBMIT ---
async function onSubmit() {
    const validation = schema.safeParse(state)
    if (!validation.success) {
        errors.value = validation.error.issues.reduce((acc: any, issue) => {
            const path = issue.path.join('.')
            acc[path] = issue.message
            return acc
        }, {})
        return
    }
    errors.value = {}
    isLoading.value = true

    //Nettoyage paliers vides
    const cleanBreakpoints = state.breakpoints.filter(b => b.unitsNeeded > 0 && b.effect)

    const payload = {
        ...state,
        breakpoints: cleanBreakpoints
    }

    const url = props.traitToEdit
        ? `/api/b1/admin/traits/${props.traitToEdit.id}` 
        : '/api/b1/admin/traits/create'

    try {
        await $fetch(url, { 
            method: props.traitToEdit ? 'PUT' : 'POST',
            body: payload
        })
        emit('success')
        emit('update:modelValue', false)
    } catch (e) {
        alert('Erreur sauvegarde Trait')
        console.error(e)
    } finally {
        isLoading.value = false
    }
}
</script>

<template>

</template>