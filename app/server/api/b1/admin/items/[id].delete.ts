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
        const deletedItem = await prisma.mtftItem.delete({
            where: { id }
        })

        return {
            success: true,
            message: `L'item "${deletedItem.name} a été supprimé"`,
        }

    } catch (error) {
        const prismaError = error as any

        if (prismaError.code === 'P2003') {
            throw createError({
                statusCode: 409,
                message: "Impossible de supprimer cet item car il est utilisé dans une recette ou une compo "
            })
        }

        if (prismaError.code === 'P2025') {
            throw createError({
                statusCode: 404,
                message: "Item introuvable"
            })
        }

        console.error("Erreur delete item", error)
        throw createError({
            statusCode: 500,
            message: "Erreur serveur"
        })
    }
})