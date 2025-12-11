import { defineEventHandler, createError, readBody, getRouterParam } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id")

    if (!id) {
        throw createError({
            statusCode: 400,
            message: "ID manquant"
        })
    }

    const body = await readBody(event)
    const existingItem = await prisma.mtftItem.findUnique({
        where: { id }
    })

    if (!existingItem) {
        throw createError({
            statusCode: 404,
            message: "Item non trouvé"
        })
    }

    try {
        const updatedItem = await prisma.mtftItem.update({
            where: { id },
            data: {
                ...(body.name && { name: body.name }),
                ...(body.riotApiId && { riotApiId: body.riotApiId }),
                ...(body.description && { desscription: body.description }),
                ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
                ...(body.stats && { stats: body.stats }),
                ...(body.type && { type: body.type }),

                // --- COMPOSANTS ---
                ...(body.component1Id !== undefined && { component1Id: body.component1Id }),
                ...(body.component2Id !== undefined && { component2Id: body.component2Id }),

                // --- STATS META ---
                ...(body.playRate !== undefined && {
                    playRate: body.playRate ? parseFloat(body.playRate) : null
                }),
                ...(body.top4Rate !== undefined && {
                    top4Rate: body.top4Rate ? parseFloat(body.top4Rate) : null
                }),
                ...(body.averagePlace !== undefined && {
                    averagePlace: body.averagePlace ? parseFloat(body.averagePlace) : null
                }),
            },
            include: {
                component1: true,
                component2: true,
            }
        })

        return {
            success: true,
            message: `L'item "${updatedItem.name}" a été mis à jour avec succès`,
            data: updatedItem
        }

    } catch (error) {
        console.error("Erreur update item", error)

        const prismaError = error as any
        if (prismaError.code === 'P2002') {
            throw createError({
                statusCode: 409,
                message: "Nom ou Riot ID déjà utilisé"
            })
        }
        throw createError({
            statusCode: 500,
            message: "Erreur serveur"
        })
    }
})