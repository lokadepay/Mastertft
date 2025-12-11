import { create } from 'domain'
import { defineEventHandler, createError, getRouterParam } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: "ID manquant"
        })
    }

    try {
        const unitToDelete = await prisma.mtftUnit.findUnique({
            where: { id },
            select: {
                abilityId: true,
                name: true,
            }
        })

        if (!unitToDelete) {
            throw createError({
                statusCode: 404,
                message: "Unité introuvable"
            })
        }

        await prisma.$transaction(async (tx) => {
            await tx.mtftUnit.delete({
                where: { id }
            })

            if (unitToDelete.abilityId) {
                await tx.mtftAbility.delete({
                    where: { id: unitToDelete.abilityId }
                })
            }
        })

        return {
            success: true,
            message: `L'unité "${unitToDelete.name}" et son abilité ont été supprimé`,
        }
    } catch (error) {
        console.error("Erreur delete unit", error)
        throw createError({
            statusCode: 500,
            message: "Erreur serveur"
        })
    }
})