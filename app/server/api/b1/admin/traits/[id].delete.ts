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
        const deletedTrait = await prisma.mtftTrait.delete({
            where: { id }
        })

        return {
            success: true,
            message: `Le trait "${deletedTrait.name}" a été supprimé ave succès`
        }

    } catch (error) {
        const prismaError = error as any

        if (prismaError.code === 'P2025') {
            throw createError({
                statusCode: 404,
                message: "Trait introuvable"
            })
        }
        console.error("Erreur delete trait", error)
        throw createError({
            statusCode: 500,
            message: "Erreur serveur"
        })
    }
})