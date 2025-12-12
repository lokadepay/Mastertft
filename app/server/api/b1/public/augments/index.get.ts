import { defineEventHandler, createError } from 'h3';
import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
    try {
        const allAugments = await prisma.mtftAugment.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                tier: true,
                availableAt: true,
                playRate: true,
                top4Rate: true,
                averagePlace: true,
                imageUrl: true,
                riotApiId: true
            },
            orderBy: [
                { tier: 'asc' }, // Trier d'abord par le tier
                { name: 'asc' } // Trier ensuite par le nom si les tiers sont égaux
            ]
        })

        return {
            success: true,
            data: allAugments,
            count: allAugments.length
        }

    } catch (error) {
        console.error("Erreur lors de la récupération de l'augment")

        throw createError({
            statusCode: 500,
            message: "Impossible de charger la liste des augments"
        })
    }
})