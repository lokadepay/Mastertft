import { defineEventHandler, createError } from 'h3'
import { prisma } from "~/server/utils/prisma"

export default defineEventHandler(async (event) => {
    try {
        const allCompositions = await prisma.mtftComposition.findMany({
            select: {
                id: true,
                name: true,
                playRate: true,
                top4Rate: true,
                averagePlace: true,
                augmentPriority: true,

                // Inclure le style de la compo
                compStyle: {
                    select: {
                        name: true
                    }
                },

                // Inclure les traits clés 
                featuredTraits: {
                    select: {
                        trait: {
                            select: {
                                name: true,
                                imageUrl: true,
                            }
                        }
                    }
                },

                // Inclure les unités clés
                featuredUnits: {
                    select: {
                        unit: {
                            select: {
                                name: true,
                                imageUrl: true,
                                cost: true,
                            }
                        }
                    }
                },
            },
            orderBy: [
                { averagePlace: 'asc' }, //Les compos seront triés d'abord le placement moyen
                { playRate: 'desc' } // Si égalité, elles seront triés selon les plus populaires
            ]
        });

        // Désimbrication des units et traits
        const formattedCompositions = allCompositions.map(comp => ({
            ...comp,
            featuredTraits: comp.featuredTraits.map(ft => ft.trait),
            featuredUnits: comp.featuredUnits.map(ft => ft.unit),
            compStyle: comp.compStyle ? comp.compStyle.name : null,
        }));

        return {
            success: true,
            data: formattedCompositions,
            count: formattedCompositions.length
        };

    } catch (error) {
        console.error("Erreur lors de la récupération des compositions", error);
        throw createError({
            statusCode: 500,
            message: "Impossible de charger la liste des compositions"
        })
    }
})