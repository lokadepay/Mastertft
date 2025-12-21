<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
library.add(faTrashCan)

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

// --- RESIZE TEXTAREA ---
const autoResize = (event: Event) => {
    const el = event.target as HTMLTextAreaElement
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
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
    <Teleport to="body">
        <div v-if="modelValue" class="modal" @click.self="emit('update:modelValue', false)">
            <div class="modal__content">                

                <div v-if="isLoading" class="modal__content__loading">
                    <div class="spinner"></div>
                </div>

                <form @submit.prevent="onSubmit" class="form">                    
                    <div class="form__section">
                        <h1>Trait</h1>

                        <div class="form__section__general">

                            <div class="form__section__general__grp">
                                <div class="form__section__general__grp__name">
                                    <label>Name*</label>
                                    <input v-model="state.name" placeholder="Ex: Ixtal" :class="{ error: errors.name }" />
                                    <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
                                </div>

                                <div class="form__section__general__grp__riotid">
                                    <label>Riot Id</label>
                                    <input v-model="state.riotApiId" placeholder="Ex: Set16_Ixtal" :class="{ error: errors.riotApiId }" />
                                    <span v-if="errors.riotApiId" class="error-msg">{{ errors.riotApiId }}</span>
                                </div>

                                <div class="form__section__general__grp__img">
                                    <label>Img url</label>
                                    <input v-model="state.imageUrl" placeholder="/images/traits/name.png" />

                                    <div class="img-preview" v-if="state.imageUrl">
                                        <img :src="state.imageUrl" alt="Preview" />
                                    </div>
                                </div>
                            </div>

                            <div class="form__section__general__desc">
                                <label>Description*</label> 
                                <textarea v-model="state.description" rows="1" @input="autoResize"></textarea>
                            </div>

                        </div>

                        <div class="form__section__breakpoint">
                            <h1>breakpoints</h1>
                            <div class="form__section__breakpoint__list">
                                <div v-for="(bp, index) in state.breakpoints" :key="index">    
                                    <div class="form__section__breakpoint__list__number">
                                        <label>Number*</label>
                                        <input type="number" v-model="bp.unitsNeeded" :class="{ error: errors[`breakpoints.${index}.unitsNeeded`] }" />
                                    </div>

                                    <div class="form__section__breakpoint__list__level">
                                        <label>Level*</label>
                                        <select v-model="bp.level" :class="`badge-${bp.level?.toLowerCase()}`">
                                            <option value="Bronze">Bronze</option>
                                            <option value="Silver">Silver</option>
                                            <option value="Gold">Gold</option>
                                            <option value="Prismatic">Prismatic</option>
                                        </select>
                                    </div>

                                    <div class="form__section__breakpoint__list__effect">
                                        <label>Effect*</label>
                                        <textarea v-model="bp.effect" rows="1" :class="{ error: errors[`breakpoints.${index}.effect`] }"></textarea>
                                    </div>

                                    <button type="button" class="del_btn" @click="removeBreakpoint(index)"><FontAwesomeIcon :icon="faTrashCan" /></button>

                                </div>    
                            </div>

                            <button type="button" class="add_btn" @click="addBreakpoint">+ Ajouter un Palier</button>

                        </div>

                        <div class="form__actions">
                            <button type="button" class="cancel_btn" @click="emit('update:modelValue', false)">
                                Cancel
                            </button>
                            <button type="submit" class="save_btn" :disabled="isLoading">
                                {{ isLoading ? '...' : 'Save' }}
                            </button>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    </Teleport>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;

.modal {
    position: fixed;
    inset: 0;
    background: rgba(black, 0.70);
    backdrop-filter: blur(2px);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 200px;
    z-index: 9999;
    overflow-y: auto;
    padding-bottom: 80px;

    &__content {
        position: relative;
        background: $light-purple;
        width: calc(100% - 100px);
        max-width: 1100px;
        padding: 40px;
        /*margin-top:  320px;*/
        border-radius: 16px;
        border: 4px solid $deep-purple;
        box-shadow: 0 0 8px 4px rgba($light-purple, 0.75);
        user-select: none;

        &__loading {
            position: absolute;
            inset: 0;
            z-index: 100;
            background: rgba($deep-purple, 0.6);
            backdrop-filter: blur(2px);
            border-radius: 12px;
            display: flex;
            justify-content: center;
            align-items: center;

            .spinner {
                width: 40px;
                height: 40px;                
                border: 4x solid rgba($light-purple, 0.3);
                border-top: 4px solid $light-purple;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }
        }
    }
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.form {
    &__section {
        h1 {
            font-family: $title-font;
            font-size: 32px;
            color: $deep-purple;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        label {
            font-family: $title-font;
            font-size: 20px;
            color: $deep-purple;
            padding-right: 8px;
        }

        &__general {
            display: grid;
            grid-template-columns: 1fr 1fr;

            &__grp {
                display: flex;
                flex-direction: column;
                gap: 20px;
                input {
                    width: 240px; height: 28px; background-color: $common-text;
                    border: 2px solid $straight-purple; border-radius: 2px; padding: 4px;
                    font-family: $text-font; font-size: 16px; color: $dark-purple;
                }

                &__img {
                    margin-top: 40px;
                }
            }

            &__desc {
                display: flex;
                align-items: center;
                textarea {
                    width: 420px; height: auto; min-height: 28px; background-color: $common-text;
                    border: 2px solid $straight-purple; border-radius: 2px; 
                    font-family: $text-font; font-size: 16px; color: $dark-purple;
                    resize: none; overflow: hidden; padding: 4px;
                }
            }
        }

        &__breakpoint {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 80px;

            .add_btn {
                background-color: $straight-purple;
                border: 2px solid $deep-purple;
                font-family: $text-font; color: $common-text; font-size: 16px;
                border-radius: 4px;
                padding: 4px 8px;
                margin-top: 20px;

                &:hover {
                    background-color: darken($straight-purple, 10%);
                }
            }

            &__list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                width: 100%;

                > div {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .del_btn {
                        color: $straight-purple;
                        font-size: 20px;

                        &:hover {
                            color: darken($straight-purple, 10%);
                        }
                    }
                }

                &__number {
                    input { width: 60px; height: 28px; background-color: $common-text;
                            border: 2px solid $straight-purple; border-radius: 2px; margin-right: 12px;
                            font-family: $text-font; color: $dark-purple; font-size: 16px; text-align: center; 
                            &::-webkit-outer-spin-button,
                            &::-webkit-inner-spin-button {
                                -webkit-appearance: none;
                                margin: 0;
                                }
                    }
                }

                &__level {
                    select {
                        width: 120px; height: 28px; background-color: $common-text;
                        border: 2px solid $straight-purple; border-radius: 2px; margin-right: 12px;
                        font-family: $text-font; color: $dark-purple; font-size: 16px; text-align: center;
                    }
                }

                &__effect {
                    textarea {
                        width: 580px; height: 28px; background-color: $common-text;
                        border: 2px solid $straight-purple; border-radius: 2px; padding-left: 4px; padding-right: 4px;
                        font-family: $text-font; color: $dark-purple; font-size: 16px;
                        vertical-align: middle; resize: none;
                    }
                }
            }
        }
    }

    &__actions {
        display: flex;
        justify-content: flex-end;
        gap: 20px;

        .cancel_btn {
            width: 120px;
            background: $badwr;
            border-radius: 4px;
            border: 2px solid $dark-purple;
            color: $deep-purple;
            font-family: $title-font;
            font-size: 20px;
            &:hover {
                background: darken($badwr, 10%);
            }
        }

        .save_btn {
            width: 120px;
            background: $goodwr;
            border-radius: 4px;
            border: 2px solid $dark-purple;
            color: $deep-purple;
            font-family: $title-font;
            font-size: 20px;
            &:hover {
                background: darken($goodwr, 10%);
            }
        }
    }
}
</style>