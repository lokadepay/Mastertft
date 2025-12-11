import { defineEventHandler, createError, readBody, getRouterParam } from 'h3'
import { prisma } from "~/server/utils/prisma"

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({
            statusCode: 400,
            message: "ID de l'uité manquant"
        })
    }

    const body = await readBody(event)
    const existingUnit = await prisma.mtftUnit.findUnique({
        where: { id }
    })

    if (!existingUnit) {
        throw createError({
            statusCode: 404,
            message: "Unité non trouvée"
        })
    }

    try {
        const updatedUnit = await prisma.mtftUnit.update({
            where: { id },
            data: {
                ...(body.name && { name: body.name }),
                ...(body.riotApiId && { riotApiId: body.riotApiId }),
                ...(body.cost && { cost: body.cost }),
                ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),

                // --- STATS INGAME ---
                ...(body.health && { health: body.health }),
                ...(body.startMana !== undefined && { startMana: parseInt(body.startMana) }),
                ...(body.maxMana !== undefined && { maxMana: parseInt(body.maxMana) }),
                ...(body.armor !== undefined && { armor: parseInt(body.armor) }),
                ...(body.magicResist !== undefined && { magicResist: parseInt(body.magicResist) }),
                ...(body.attackDamage && { attackDamage: body.attackDamage }),
                ...(body.attackSpeed !== undefined && { attackSpeed: parseFloat(body.attackSpeed) }),
                ...(body.attackRange !== undefined && { attackRange: parseInt(body.attackRange) }),

                // --- STATS META ---
                ...(body.playRate !== undefined && {
                    playRate: body.playRate ? parseFloat(body.playRate) : null
                }),
                ...(body.top4Rate !== undefined && {
                    top4Rate: body.top4Rate ? parseFloat(body.top4Rate) : null
                }),
                ...(body.averagePlace !== undefined && {
                    averagePlace: body.averagePlace ? parseFloat(body.averagePlace) : null
                }),

                // --- TRAITS ---
                ...(body.traits && {
                    traits: {
                        deleteMany: {},
                        create: body.traits.map((traitId: string) => ({
                            traitId: traitId
                        }))
                    }
                }),

                // --- ITEMS RECOMMANDE ---
                ...(body.recommendedItems && {
                    recommendedItems: {
                        deleteMany: {},
                        create: body.recommendedItems.map((item: any) => ({
                            itemId: item.id,
                            priority: item.priority
                        }))
                    }
                }),
            },
            include: {
                ability: {
                    include: {
                        scalingStats: true
                    }
                },
                traits: {
                    include: {
                        trait: true,
                    }
                },
                recommendedItems: {
                    include: {
                        item: true
                    }
                }
            }
        })

        return {
            success: true,
            message: `L'unité "${updatedUnit.name}" a été mise à jour`,
            data: updatedUnit
        }
    } catch (error) {
        console.error("Erreur update unit", error)

        const prismaError = error as any
        if (prismaError.code === 'P2002') {
            throw createError({
                statusCode: 409,
                message: "Nom ou Riot ID déjà utilisé"
            })
        }
        throw createError({
            statusCode: 500,
            message: "Erreur serveur"
        })
    }
})