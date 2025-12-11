import { defineEventHandler, createError, readBody, getRouterParam } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: "ID de l'augment manquant"
        })
    }

    const body = await readBody(event)
    const existingAugment = await prisma.mtftAugment.findUnique({
        where: { id }
    })

    if (!existingAugment) {
        throw createError({
            statusCode: 404,
            message: "Augment non trouvé"
        })
    }

    try {
        const updatedAugment = await prisma.mtftAugment.update({
            where: { id },
            data: {
                ...(body.name && { name: body.name }),
                ...(body.riotApiId && { riotApiId: body.riotApiId }),
                ...(body.description && { description: body.description }),
                ...(body.tier && { tier: body.tier }),
                ...(body.availableAt && { availableAt: body.availableAt }),
                ...(body.imageUrl && { imageUrl: body.imageUrl }),

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
            }
        })

        return {
            success: true,
            message: `L'augment "${updatedAugment.name}" a été mis à jour avec succès`,
            data: updatedAugment
        }

    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'augment", error)

        const prismaError = error as any
        if (prismaError.code === 'P2002') {
            throw createError({
                statusCode: 409,
                message: "Un augment avec ce nom ou ce Riot ID existe déjà"
            })
        }

        if (prismaError.code === 'P2025') {
            throw createError({
                statusCode: 404,
                message: "Augment non trouvé"
            })
        }

        throw createError({
            statusCode: 500,
            message: "Erreur serveur lors de la création de l'augment"
        })
    }
})