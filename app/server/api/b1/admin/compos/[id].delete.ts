import { de } from '@nuxt/ui/runtime/locale/index.js'
import { defineEventHandler, createError, getRouterParam } from 'h3'
import { prisma } from "~/server/utils/prisma"

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: "ID manquant"
        })
    }

    try {
        const deletedCompo = await prisma.mtftComposition.delete({
            where: { id }
        })

        return {
            success: true,
            message: `La compo "${deletedCompo.name}" a été supprimée avec succès`
        }

    } catch (error) {
        const prismaError = error as any

        if (prismaError.code === 'P2025') {
            throw createError({
                statusCode: 404,
                message: "Compo introuvable"
            })
        }
        console.error("Erreur delete compo", error)
        throw createError({
            statusCode: 500,
            message: "Erreur serveur"
        })
    }
})