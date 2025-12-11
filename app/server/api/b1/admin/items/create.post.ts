import { defineEventHandler, createError, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.name || !body.riotApiId || !body.description || !body.type) {
        throw createError({
            statusCode: 400,
            message: "Données de l'item incomplètes"
        })
    }

    const requiresComponents = (body.type === 'Craftable' || body.type === 'Emblem')

    if (requiresComponents) {
        if (!body.component1Id || !body.component2Id) {
            throw createError({
                statusCode: 400,
                message: `Pour un item de type "${body.type}", 'component1Id' et 'component2Id' sont requis.`
            })
        }

        const components = await prisma.mtftItem.findMany({
            where: { id: { in: [body.component1Id, body.component2Id] } },
            select: { id: true }
        })

        if (components.length !== 2) {
            throw createError({
                statusCode: 404,
                message: "Un ou les deux IDs de composants fournis sont introuvables"
            })
        }
    }

    try {
        const newItem = await prisma.mtftItem.create({
            data: {
                name: body.name,
                riotApiId: body.riotApiId,
                description: body.description,
                type: body.type,
                imageUrl: body.imageUrl || null,
                component1Id: body.component1Id || null,
                component2Id: body.component2Id || null,
                stats: body.stats || null,
                playRate: body.playRate ? parseFloat(body.playRate) : undefined,
                top4Rate: body.top4Rate ? parseFloat(body.top4Rate) : undefined,
                averagePlace: body.averagePlace ? parseFloat(body.averagePlace) : undefined,

            }
        })

        return {
            success: true,
            message: `L'item "${newItem.name}" a été créé avec succès`,
            data: newItem
        }

    } catch (error) {
        console.error("Erreur lors de la création de l'Item", error)

        const prismaError = error as any
        if (prismaError.code === 'P2002') {
            throw createError({
                statusCode: 409,
                message: "Un Item avec de nom ou cet ID existe déjà"
            })
        }

        throw createError({
            statusCode: 500,
            message: "Errur serveur lors de la création de l'item"
        })
    }
})