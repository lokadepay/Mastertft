import { defineEventHandler, readBody, createError, getQuery } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    const filter: any = {}

    try {
        const compositions = await prisma.mtftComposition.findMany({
            where: filter,

            orderBy: {
                averagePlace: 'asc',
            },

            select: {
                id: true,
                name: true,
                top4Rate: true,
                playRate: true,
                averagePlace: true,
            }
        })

        return compositions

    } catch (error) {
        console.error("Erreur GET:", error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la récupération des données.'
        })
    }
})