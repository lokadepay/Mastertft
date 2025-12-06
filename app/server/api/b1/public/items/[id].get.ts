import { defineEventHandler, createError, getRouterParam } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const itemId = getRouterParam(event, 'id')

    if (!itemId) {
        throw createError({ statusCode: 400, message: "ID de l'item manquant" })
    }

    try {
        const itemDetails = await prisma.mtftItem.findUnique({
            where: { id: itemId },
            include: {
                // --- RECETTES ---
                component1: true,
                component2: true,
                builtFrom1: true,
                builtFrom2: true,


                // --- UNITS ---
                unitStats: {
                    orderBy: { averagePlace: 'asc' }, // On trie avec le score le plus faible en premier pour faire apparaître que les meilleurs
                    select: {
                        averagePlace: true,
                        unit: {
                            select: {
                                name: true,
                                imageUrl: true,
                                riotApiId: true,
                            }
                        }
                    }
                },
            }
        })

        if (!itemDetails) {
            throw createError({ statusCode: 400, message: "Item non trouvé" })
        }

        // NETTOYAGE
        const cleanedItemDetails = {
            ...itemDetails,

            // Renommer et désimbriquer unitStats en topUsers
            topUsers: itemDetails.unitStats.map(us => ({
                averagePlace: us.averagePlace,
                ...us.unit,
            })),

            unitStats: undefined,
        }

        return cleanedItemDetails;

    } catch (error) {
        console.error("Erreur base de données lors du chargement de l'item", error)
        throw createError({
            statusCode: 500,
            message: "Erreur serveur lors de la récupération de l'item",
        })
    }
})