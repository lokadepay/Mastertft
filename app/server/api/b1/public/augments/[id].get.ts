import { defineEventHandler, createError, getRouterParam } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const augmentId = getRouterParam(event, "id")

    if (!augmentId) {
        throw createError({ statusCode: 400, message: "ID de l'augment manquant" })
    }

    try {
        const augmentDetails = await prisma.mtftAugment.findUnique({
            where: { id: augmentId },
            include: {
                compositionAugmentPriorities: {
                    select: {
                        displayOrder: true,
                        composition: {
                            select: {
                                id: true,
                                name: true,
                                playRate: true,
                                top4Rate: true,
                                averagePlace: true,
                            }
                        }
                    },
                    orderBy: {
                        composition: {
                            averagePlace: 'asc'
                        }
                    }
                }
            }
        })

        if (!augmentDetails) {
            throw createError({ statusCode: 404, message: "Augment non trouvé" })
        }

        // NETTOYAGE
        const cleanedAugmentDetails = {
            ...augmentDetails,

            bestCompostition: augmentDetails.compositionAugmentPriorities.map(cap => ({
                priorityOrder: cap.displayOrder,
                ...cap.composition
            })),

            compositionAugmentPriorities: undefined,
        }

        return cleanedAugmentDetails

    } catch (error) {
        console.error(`Erreur lors du chargement des détails de l'augment ${augmentId}:`, error)
        throw createError({
            statusCode: 500,
            message: "Erreur serveur lors de la récupération des détails de l'augment"
        })
    }
})