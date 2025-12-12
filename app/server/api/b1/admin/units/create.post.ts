import { defineEventHandler, createError, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {

    // On lit les données
    const body = await readBody(event)

    // On vérifie les champs requis
    if (!body.name || !body.riotApiId || !body.cost || !body.health || !body.startMana || !body.maxMana
        || !body.armor || !body.magicResist || !body.attackDamage || !body.attackSpeed || !body.attackRange
    ) {
        throw createError({
            statusCode: 400,
            message: "Données de l'units incomplètes"
        })
    }

    // On vérifie que l'ability de l'unit existe
    const abilityExists = await prisma.mtftAbility.findUnique({
        where: { id: body.abilityId },
        select: { id: true }
    })

    if (!abilityExists) {
        throw createError({
            statusCode: 404,
            message: "l'Id de la capacité fournie n'existe pas"
        })
    }

    try {
        const newUnit = await prisma.mtftUnit.create({
            data: {
                name: body.name,
                riotApiId: body.riotApiId,
                cost: parseInt(body.cost),
                imageUrl: body.imageUrl,
                abilityId: body.abilityId,

                // --- STATS INGAME ---
                health: body.health,
                startMana: parseInt(body.startMana),
                maxMana: parseInt(body.maxMana),
                armor: parseInt(body.armor),
                magicResist: parseInt(body.magicResist),
                attackDamage: body.attackDamage,
                attackSpeed: parseFloat(body.attackSpeed),
                attackRange: parseInt(body.attackRange),

                // --- UNLOCK (SET 16) ---
                unlockCondition: body.unlockCondition || null,
                unlockIconUrl: body.unlockIconUrl || null,

                // --- STATS META ---
                playRate: body.playRate ? parseFloat(body.playRate) : undefined,
                top4Rate: body.top4Rate ? parseFloat(body.top4Rate) : undefined,
                averagePlace: body.averagePlace ? parseFloat(body.averagePlace) : undefined,
            }
        })

        return {
            success: true,
            message: `L'unit "${newUnit.name}" a été créée avec succès (ID: ${newUnit.id})`,
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