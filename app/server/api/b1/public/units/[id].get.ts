import { defineEventHandler, createError, getRouterParam } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const unitId = getRouterParam(event, "id")

    if (!unitId) {
        throw createError({ statusCode: 400, message: "ID de l'unit manquant" })
    }

    try {
        const unitDetails = await prisma.mtftUnit.findUnique({
            where: { id: unitId },
            include: {

                // --- ABILITY & SCALINGSTATS ---
                ability: {
                    select: {
                        id: true,
                        name: true,
                        passive: true,
                        active: true,

                        scalingStats: {
                            orderBy: { id: 'asc' },
                            select: {
                                statName: true,
                                statValue: true
                            }
                        }
                    }
                },

                // --- TRAITS ---
                traits: {
                    include: {
                        trait: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                            }
                        }
                    }
                },

                // --- ITEMS ---
                recommendedItems: {
                    orderBy: { priority: 'asc' },
                    include: {
                        item: true,
                    }
                },
                itemStats: {
                    orderBy: { averagePlace: 'asc' },
                    select: {
                        averagePlace: true,
                        item: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                            }
                        }
                    }
                },
            },
        })

        if (!unitDetails) {
            throw createError({ statusCode: 404, message: "Unit non trouvée" })
        }

        // NETTOYAGE
        const cleanedUnitDetails = {
            ...unitDetails,

            // Désimbriquer les traits
            traits: unitDetails?.traits.map(ut => ut.trait),

            // Désimbriquer les items
            recommendedItems: unitDetails?.recommendedItems.map(uri => ({
                priority: uri.priority,
                ...uri.item
            })),

            // Désimbriquer les stats d'items
            itemStats: unitDetails?.itemStats.map(uis => ({
                averagePlace: uis.averagePlace,
                ...uis.item
            }))
        }

        return cleanedUnitDetails

    } catch (error) {
        console.error(`Erreur lors du chargement des détails de l'unit ${unitId}:`, error);
        throw createError({ statusCode: 500, message: "Erreur serveur lors de la récupération des détails de l'unit" })
    }
})