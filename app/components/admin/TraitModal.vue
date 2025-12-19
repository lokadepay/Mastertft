<script setup lang="ts">
import { z } from 'zod'

const props = defineProps<{
    modelValue: boolean
    traitToEdit?: any | null // nul -> création, sinon -> édition

}>()

const emit = defineEmits(['update:modelValue', 'success'])

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

// --- VALIDATION ---
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
watch

</script>