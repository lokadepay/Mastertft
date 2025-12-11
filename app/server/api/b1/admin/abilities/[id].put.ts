import { defineEventHandler, createError, readBody, getRouterParam } from 'h3'
import { prisma } from "~/server/utils/prisma"

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: "ID manquant"
        })
    }

    const body = await readBody(event)
    const existingAbility = await prisma.mtftAbility.findUnique({
        where: { id }
    })

    if (!existingAbility) {
        throw createError({
            statusCode: 404,
            message: "Abilité non trouvée"
        })
    }

    try {
        const updatedAbility = await prisma.mtftAbility.update({
            where: { id },
            data: {
                ...(body.name && { name: body.name }),
                ...(body.passive !== undefined && { passive: body.passive }),
                ...(body.active && { active: body.active }),

                // --- SCALING STATS --- 
                ...(body.scalingStats && {
                    scalingStats: {
                        deleteMany: {},
                        create: body.scalingStats.map((stat: any) => ({
                            statName: stat.statName,
                            statValue: stat.statValue
                        }))
                    }
                })
            },
            include: {
                scalingStats: true,
                champion: true,
            }
        })

        return {
            success: true,
            message: `L'ability "${updatedAbility.name}" a été mise à jour avec succès`,
            data: updatedAbility
        }

    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'ability", error)
        throw createError({
            statusCode: 500,
            message: "Erreur serveur lors de la mise à jour de l'ability"
        })
    }

})