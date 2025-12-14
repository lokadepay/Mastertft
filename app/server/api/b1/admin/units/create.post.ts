import { defineEventHandler, createError, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.name || !body.riotApiId || !body.cost || !body.health || !body.startMana || !body.maxMana
        || !body.armor || !body.magicResist || !body.attackDamage || !body.attackSpeed || !body.attackRange
    ) {
        throw createError({
            statusCode: 400,
            message: "Données de l'units incomplètes"
        })
    }

    try {
        const newUnit = await prisma.mtftUnit.create({
            data: {
                name: body.name,
                riotApiId: body.riotApiId,
                cost: Number(body.cost),
                imageUrl: body.imageUrl,

                // --- STATS INGAME ---
                health: String(body.health),
                startMana: Number(body.startMana),
                maxMana: Number(body.maxMana),
                armor: Number(body.armor),
                magicResist: Number(body.magicResist),
                attackDamage: String(body.attackDamage),
                attackSpeed: Number(body.attackSpeed),
                attackRange: Number(body.attackRange),

                // --- UNLOCK (SET 16) ---
                unlockCondition: body.unlockCondition || null,
                unlockIconUrl: body.unlockIconUrl || null,

                // --- STATS META ---
                playRate: body.playRate ? parseFloat(body.playRate) : undefined,
                top4Rate: body.top4Rate ? parseFloat(body.top4Rate) : undefined,
                averagePlace: body.averagePlace ? parseFloat(body.averagePlace) : undefined,

                // --- ABILITY ---
                ability: {
                    create: {
                        name: body.ability.name,
                        active: body.ability.active,
                        passive: body.ability.passive || null,
                        scalingStats: body.ability.scalingStats,
                    }
                }
            },
            include: {
                ability: true // Pour renvoyer l'objet complet au front
            }
        })

        return {
            success: true,
            message: `L'unit "${newUnit.name}" a été créée avec succès (ID: ${newUnit.id})`,
            data: newUnit
        }

    } catch (error) {
        console.error("Erreur lors de la création de l'Unité", error)

        const prismaError = error as any
        if (prismaError.code === 'P2002') {
            throw createError({
                statusCode: 409,
                message: "Une unité avec ce nom ou ce Riot ID existe déjà"
            })
        }

        throw createError({
            statusCode: 500,
            message: "Erreur serveur lors de la création de l'unité"
        })
    }
})