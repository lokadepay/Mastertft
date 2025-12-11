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
        const deletedAbility = await prisma.mtftAbility.delete({
            where: { id }
        })

        return {
            success: true,
            message: `L'abilité "${deletedAbility.name}" a été supprimée`,
        }

    } catch (error) {
        const prismaError = error as any
        if (prismaError.code === 'P2003') {
            throw createError({
                statusCode: 409,
                message: "Impossible de supprimer, cette abilité est liée à un champion existant"
            })
        }
        if (prismaError.code === 'P2025') {
            throw createError({
                statusCode: 404,
                message: "Abilité introuvable"
            })
        }
        console.error("Erreur delete ability", error)
        throw createError({
            statusCode: 500,
            message: "Erreur serveur"
        })
    }
})