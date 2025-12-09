import { defineEventHandler, createError, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.name || !body.active) {
        throw createError({
            statusCode: 400,
            message: "Données de la capacité incomplète"
        })
    }

    if (body.scalingStats && !Array.isArray(body.scalingStats)) {
        throw createError({
            statusCode: 400,
            message: "scalingStats doit être un tableau d'objets"
        })
    }

    try {
        const newAbility = await prisma.mtftAbility.create({
            data: {
                name: body.name,
                passive: body.passive || null,
                active: body.active,
                scalingStats: {
                    create: body.scalingStats || [] // Si le tableau est vide, il n'y a pas de stats
                }
            },

            include: {
                scalingStats: true,
            }
        })

        return {
            success: true,
            message: `La Capacité "${newAbility.name}" a été créée avec succès`,
            data: newAbility,
            unitCreationId: newAbility.id
        }
    } catch (error) {
        console.error("Erreur lors de la création de la Capacité", error)

        const prismaError = error as any
        if (prismaError.code === 'P2002') {
            throw createError({
                statusCode: 409,
                message: "Une Capacité avec ce nom existe déjà"
            })
        }

        throw createError({
            statusCode: 500,
            message: "Erreur serveur lors de la création de la Capacité"
        })
    }
})