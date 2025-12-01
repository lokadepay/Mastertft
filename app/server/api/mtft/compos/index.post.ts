import { defineEventHandler, readBody, createError } from 'h3';

import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.name) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Le champ Name est obligatoire'
        })
    }

    try {
        const newComposition = await prisma.mtftComposition.create({
            data: {
                name: body.name,
                top4Rate: body.top4Rate ? parseFloat(body.top4Rate) : undefined,
                averagePlace: body.averagePlace ? parseFloat(body.averagePlace) : undefined,
                playRate: body.playRate ? parseFloat(body.playRate) : undefined,
                compDetails: body.compDetails || {},
            },
        })
        return { statut: 201, data: newComposition }

    } catch (error) {
        const prismaError: any = error;

        if (prismaError.code === 'P2002') {
            throw createError({ statusCode: 409, statusMessage: 'Cette composition existe déjà' })
        }

        console.error("Erreur POST:", error)
        throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
    }
})
