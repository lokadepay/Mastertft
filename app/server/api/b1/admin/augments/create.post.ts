import { defineEventHandler, createError, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {

    // On lit les données envoyées par l'user
    const body = await readBody(event)

    // On vérifie les champs requis
    if (!body.name || !body.riotApiId || !body.description || !body.tier || !body.availableAt) {
        throw createError({
            statusCode: 400,
            message: "Données incomplètes. Champs requis: name, riotApiId, description, tier, availableAt"
        })
    }

    try {
        const newAugment = await prisma.mtftAugment.create({
            data: {
                name: body.name,
                riotApiId: body.riotApiId,
                description: body.description,
                tier: body.tier,
                playRate: body.playRate ? parseFloat(body.playRate) : undefined,
                top4Rate: body.top4Rate ? parseFloat(body.top4Rate) : undefined,
                averagePlace: body.averagePlace ? parseFloat(body.averagePlace) : undefined,

                availableAt: body.availableAt,
                imageUrl: body.imageUrl
            }
        })

        return {
            success: true,
            message: `L'augment "${newAugment.name}" a été créé avec succès`,
            data: newAugment
        }

    } catch (error) {
        console.error("Erreur lors de la création de l'augment", error)

        const prismaError = error as any
        if (prismaError.code === 'P2002') {
            throw createError({
                statusCode: 409,
                message: "Un augment avec ce nom ou ce Riot API ID existe déjà"
            })
        }

        throw createError({
            statusCode: 500,
            message: "Erreur serveur lors de la création de l'augment"
        })
    }
})