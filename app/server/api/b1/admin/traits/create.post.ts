import { defineEventHandler, createError, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {

    //On lit les données
    const body = await readBody(event)

    // On vérifie les champs requis
    if (!body.name || !body.riotApiId || !body.description) {
        throw createError({
            statusCode: 400,
            message: "Données icomplètes, champs requis: name, RiotApiId, description."
        })
    }

    try {
        const newTrait = await prisma.mtftTrait.create({
            data: {
                name: body.name,
                riotApiId: body.riotApiId,
                description: body.description,
                imageUrl: body.imageUrl || null,
            }
        })

        return {
            success: true,
            message: `Le trait "${newTrait.name}" a été créé avec succès`,
            data: newTrait
        }

    } catch (error) {
        console.error("Erreur lors de la création du Trait", error)

        const prismaError = error as any
        if (prismaError.code === 'P2002') {
            throw createError({
                statusCode: 409,
                message: "Un trait avec ce nom ou ce riot API ID existe déjà"
            })
        }

        throw createError({
            statusCode: 500,
            message: "Erreur serveur lors de la création du Trait"
        })
    }
})