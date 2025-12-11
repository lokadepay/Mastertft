import { defineEventHandler, createError, readBody, getRouterParam } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: "ID du trait manquant"
        })
    }

    const body = await readBody(event)
    const existingTrait = await prisma.mtftTrait.findUnique({
        where: { id }
    })

    if (!existingTrait) {
        throw createError({
            statusCode: 404,
            message: "Trait non trouvé"
        })
    }

    try {
        const updatedTrait = await prisma.mtftTrait.update({
            where: { id },
            data: {
                ...(body.name && { name: body.name }),
                ...(body.riotApiId && { riotApiId: body.riotApiId }),
                ...(body.description && { description: body.description }),
                ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),

                // --- BREAKPOINTS ---
                ...(body.breakpoints && {
                    breakpoints: {
                        deleteMany: {},
                        create: body.breakpoints.map((bp: any) => ({
                            unitsNeeded: bp.unitsNeeded,
                            level: bp.level,
                            effect: bp.effect
                        }))
                    }
                })
            },
            include: {
                breakpoints: true
            }
        })

        return {
            success: true,
            message: `Le trait "${updatedTrait.name}" a été mis à jour`,
            data: updatedTrait
        }

    } catch (error) {
        console.error("Erreur lros de la mise à jour du trait", error)
        const prismaError = error as any
        if (prismaError.code === 'P2002') {
            throw createError({
                statusCode: 409,
                message: "Nom ou Riot API déjà utilisé"
            })
        }
        throw createError({
            statusCode: 500,
            message: "Erreur serveur"
        })
    }
})