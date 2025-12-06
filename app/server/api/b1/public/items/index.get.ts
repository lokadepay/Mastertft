import { defineEventHandler, createError } from 'h3';
import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
    try {
        const allItems = await prisma.mtftItem.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                type: true, // Component, Item de base, Darkin etc.
                stats: true,
                imageUrl: true,
                riotApiId: true,
                playRate: true,
                top4Rate: true,
                averagePlace: true
            },
            orderBy: {
                name: 'asc' // On trie par nom par défaut
            }
        })

        return {
            success: true,
            data: allItems,
            count: allItems.length
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des items")

        throw createError({
            statusCode: 500,
            message: "Impossible de charger la liste des items",
        })
    }
})