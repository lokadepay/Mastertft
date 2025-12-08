import { defineEventHandler, getRouterParam, createError } from 'h3'
import { prisma } from "~/server/utils/prisma"

export default defineEventHandler(async (event) => {
    const traitId = getRouterParam(event, "id")

    if (!traitId) {
        throw createError({ statusCode: 400, message: "ID du trait manquant" })
    }

    try {
        const traitDetails = await prisma.mtftTrait.findUnique({
            where: { id: traitId },
            include: {

                // --- BREAKPOINTS ---
                breakpoints: {
                    orderBy: { unitsNeeded: 'asc' } // Palier dans l'ordre croissant
                },

                // --- UNITS ---
                units: {
                    select: {
                        unit: {
                            select: {
                                id: true,
                                name: true,
                                cost: true,
                                imageUrl: true,
                            }
                        }
                    }
                }
            }
        })

        if (!traitDetails) {
            throw createError({ statusCode: 404, message: "Trait non trouvé" })
        }

        // NETTOYAGE
        const cleanedTraitDetails = {
            ...traitDetails,

            units: traitDetails?.units.map(ut => ut.unit),
        }

        return cleanedTraitDetails

    } catch (error) {
        console.error(`Erreur lors du chargement des détails du trait ${traitId}:`, error)
        throw createError({ statusCode: 500, message: "Erreur serveur lors de la récupération du trait" })
    }
})