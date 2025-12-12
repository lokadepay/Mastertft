<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { reactive, ref, watch } from 'vue'

// --- PROPS & EMITS ---
const props = defineProps<{
    modelValue: boolean
    unitToEdit?: any | null // null -> création, sinon -> édition
}>()

const emit = defineEmits(['update: modelValue', 'success'])
const toast = useToast()

// --- STATE ---
const state = reactive({

})
</script>
