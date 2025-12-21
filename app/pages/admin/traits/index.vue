<script setup lang="ts">
// 1. On importe ta superbe modale
import TraitModal from '~/components/admin/TraitModal.vue'

// --- ETAT (La Télécommande) ---
const showModal = ref(false)       // L'interrupteur (Fermé par défaut)
const traitToEdit = ref(null)      // La mémoire (Vide par défaut)

// --- DONNÉES (Pour l'exemple, on imagine qu'on les a chargées) ---
const { data: traits, refresh } = await useFetch('/api/b1/public/traits', {
    transform: (res: any) => res.data || []
})

// --- ACTIONS ---

// CAS 1 : Ouvrir pour CRÉER (Nouveau)
const openCreate = () => {
    traitToEdit.value = null // On vide la mémoire => La modale saura que c'est une création
    showModal.value = true   // On allume l'interrupteur
}

// CAS 2 : Ouvrir pour ÉDITER (Modifier)
const openEdit = (trait: any) => {
    traitToEdit.value = trait // On met le trait dans la mémoire => La modale va pré-remplir les champs
    showModal.value = true    // On allume l'interrupteur
}

// CAS 3 : Quand la sauvegarde est finie
const handleSuccess = () => {
    refresh() // On recharge la liste pour voir les changements
    // Pas besoin de fermer la modale ici, elle le fait toute seule via le v-model
    console.log("C'est sauvegardé chef ! 🎉")
}
</script>

<template>
    <div class="admin-page">
        
        <header>
            <h1>Gestion des Traits</h1>
            <button @click="openCreate" class="btn-create">+ Nouveau Trait</button>
        </header>

        <div class="traits-grid">
            <div v-for="trait in traits" :key="trait.id" class="trait-card">
                <img :src="trait.imageUrl" class="trait-icon" />
                <div class="info">
                    <h3>{{ trait.name }}</h3>
                    <p>{{ trait.breakpoints.length }} paliers</p>
                </div>
                <button @click="openEdit(trait)" class="btn-edit">✏️</button>
            </div>
        </div>

        <TraitModal 
            v-model="showModal" 
            :trait-to-edit="traitToEdit" 
            @success="handleSuccess"
        />

    </div>
</template>

<style scoped>
/* Un peu de style pour que ce soit pas moche */
.admin-page { padding: 2rem; color: white; }
header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }

.btn-create { background: #6E5A8B; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; }
.btn-create:hover { background: #846b9e; }

.traits-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
.trait-card { background: #1e1e2e; padding: 1rem; border-radius: 8px; display: flex; align-items: center; gap: 1rem; border: 1px solid #444; }
.trait-icon { width: 40px; height: 40px; border-radius: 4px; object-fit: cover; background: #333; }
.info { flex: 1; }
.info h3 { margin: 0; font-size: 1rem; }
.info p { margin: 0; font-size: 0.8rem; color: #888; }
.btn-edit { background: transparent; border: 1px solid #555; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-edit:hover { background: white; color: black; }
</style>