import { defineEventHandler, createError, getRouterParam } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: "ID manquant"
        })
    }

    try {
        const deletedAugment = await prisma.mtftAugment.delete({
            where: { id }
        })

        return {
            success: true,
            message: `L'augment "${deletedAugment.name}" a été supprimé avec succès`
        }

    } catch (error) {
        const prismaError = error as any

        if (prismaError.code === 'P2025') {
            throw createError({
                statusCode: 404,
                message: "Augment introuvable"
            })
        }
        console.error("Erreur delete augment", error)
        throw createError({
            statusCode: 500,
            message: "Erreur serveur"
        })
    }
})