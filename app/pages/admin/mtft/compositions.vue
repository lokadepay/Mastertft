<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useNuxtApp } from 'nuxt/app'

//1. ETAT MODALE + FORMULAIRE
const isModaleOpen = ref(false)

const formState = reactive({
    name: '',
    top4Rate: undefined as number | undefined,
    averagePlace: undefined as number | undefined,
    playRate: undefined as number | undefined,
    compDetails: undefined as string | undefined,
})

//2. ETAT CHARGEMENT/ERREUR
const isLoading = ref(false)
const errorMessage = ref ('')

const  { $toast } = useNuxtApp()



</script>