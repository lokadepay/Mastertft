import { defineEventHandler, createError, readBody, getRouterParam } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: "ID de la compo manquant"
        })
    }

    const body = await readBody(event)
    const existingCompo = await prisma.mtftComposition.findUnique({
        where: { id }
    })

    if (!existingCompo) {
        throw createError({
            statusCode: 404,
            message: "Compo non trouvée"
        })
    }

    try {
        const updatedCompo = await prisma.mtftComposition.update({
            where: { id },
            data: {
                ...(body.name && { name: body.name }),
                ...(body.augmentPriority && { augmentPriority: body.augmentPriority }),

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

                // --- COMPSTYLE ---
                ...(body.compStyleId !== undefined && { compStyleId: body.compStyleId }),

                // --- FEATURED UNITS & TRAITS ---
                ...(body.featuredUnits && {
                    featuredUnits: {
                        deleteMany: {},
                        create: body.featuredUnits.map((u: any) => ({
                            unitId: u.id,
                            displayOrder: u.order
                        }))
                    }
                }),
                ...(body.featuredTraits && {
                    featuredTraits: {
                        deleteMany: {},
                        create: body.featuredTraits.map((t: any) => ({
                            traitId: t.id,
                            displayOrder: t.order,
                            activationLevel: t.activationLevel,
                            unitCount: t.unitCount
                        }))
                    }
                }),

                // --- UNITS ---
                ...(body.coreUnits && {
                    coreUnits: {
                        deleteMany: {},
                        create: body.coreUnits.map((u: any) => ({
                            unitId: u.id,
                            displayOrder: u.order
                        }))
                    }
                }),
                ...(body.flexUnits && {
                    flexUnits: {
                        deleteMany: {},
                        create: body.flexUnits.map((u: any) => ({
                            unitId: u.id,
                            displayOrder: u.order
                        }))
                    }
                }),

                // --- ITEMS ---
                ...(body.coreItems && {
                    coreItems: {
                        deleteMany: {},
                        create: body.coreItems.map((i: any) => ({
                            itemId: i.id,
                            displayOrder: i.order
                        }))
                    }
                }),
                ...(body.specialItems && {
                    specialItems: {
                        deleteMany: {},
                        create: body.specialItems.map((i: any) => ({
                            itemId: i.id,
                            displayOrder: i.order
                        }))
                    }
                }),
                ...(body.priorityComponents && {
                    priorityComponents: {
                        deleteMany: {},
                        create: body.priorityComponents.map((c: any) => ({
                            itemId: c.id,
                            displayOrder: c.order
                        }))
                    }
                }),

                // --- AUGMENT ---
                ...(body.augmentsPriority && {
                    augmentsPriority: {
                        deleteMany: {},
                        create: body.augmentsPriority.map((a: any) => ({
                            augmentId: a.id,
                            displayOrder: a.order
                        }))
                    }
                }),
            },
            include: {
                compStyle: true,
                featuredUnits: { include: { unit: true } },
                featuredTraits: { include: { trait: true } },
                coreUnits: { include: { unit: true } },
                flexUnits: { include: { unit: true } },
                coreItems: { include: { item: true } },
                priorityComponents: { include: { item: true } },
                specialItems: { include: { item: true } },
                augmentsPriority: { include: { augment: true } },

            }
        })

        return {
            success: true,
            message: `La composition "${updatedCompo.name}" a été mise à jour`,
            data: updatedCompo
        }

    } catch (error) {
        console.error("Erreur update composition", error)
        const prismaError = error as any
        if (prismaError.code === 'P2002') {
            throw createError({
                statusCode: 409,
                message: "Nom ou Riot ID déjà utilisé"
            })
        }
        if (prismaError.code === 'P2025') {
            throw createError({
                statusCode: 404,
                message: "Ressources référencés introuvable"
            })
        }
        throw createError({
            statusCode: 500,
            message: "Erreur serveur"
        })
    }
})