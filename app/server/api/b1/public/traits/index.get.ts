import { defineEventHandler, createError } from 'h3';
import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
    try {
        const allTraits = await prisma.mtftTrait.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
                riotApiId: true,
                breakpoints: {
                    select: {
                        unitsNeeded: true, // Le nombre d'units pour déclacher les paliers
                        level: true,
                        effect: true
                    },
                    orderBy: {
                        unitsNeeded: 'asc' // On trie par ordre ascendant de manière logique
                    }
                }
            },
            orderBy: {
                name: 'asc' // On trie les traits par nom
            }
        })

        return {
            success: true,
            data: allTraits,
            count: allTraits.length
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des traits", error)

        throw createError({
            statusCode: 500,
            message: "Impossible de charger la liste des traits",
        })
    }
})