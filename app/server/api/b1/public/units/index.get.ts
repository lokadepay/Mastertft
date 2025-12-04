import { defineEventHandler, createError } from 'h3';
import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
    try {
        const allUnits = await prisma.mtftUnit.findMany({
            select: {
                id: true,
                name: true,
                cost: true,
                imageUrl: true,
                riotApiId: true,
            },
            orderBy: {
                cost: 'asc' // On trie les champions par coûts par défaut
            }
        })

        return {
            success: true,
            data: allUnits,
            count: allUnits.length
        }

    } catch (error) {
        console.error("Erreur lors de la récupération des units", error)

        throw createError({
            statusCode: 500,
            message: "Impossible de charger la liste des champions",
        })
    }
})