import { defineEventHandler, createError, readBody } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.name) {
        throw createError({
            statusCode: 400,
            message: "Le nom de la composition est obligatoire"
        })
    }

    if (body.augmentPriority) {
        const validPriorities = ['ECO', 'ITEMS', 'FIGHT']
        const invalidPriorities = body.augmentPriority.filter((p: string) => !validPriorities.includes(p))

        if (invalidPriorities.length > 0) {
            throw createError({
                statusCode: 400,
                message: `Priorités d'augment invalides: ${invalidPriorities.join(', ')}. 
                Valeurs autorisées: ${validPriorities.join(', ')}`
            })
        }
    }

    try {
        const newComp = await prisma.mtftComposition.create({
            data: {
                // --- Champs Simples ---
                name: body.name,
                playRate: body.playRate ? parseFloat(body.playRate) : undefined,
                top4Rate: body.top4Rate ? parseFloat(body.top4Rate) : undefined,
                averagePlace: body.averagePlace ? parseFloat(body.averagePlace) : undefined,
                augmentPriority: body.augmentPriority || [], // Tableau "Eco", "Fight", "Items"

                // --- Relation compStyle ---
                ...(body.compStyleId && {
                    compStyle: {
                        connect: { id: body.compStyleId }
                    }
                }),

                // --- Relations Units ---
                ...(body.featuredUnits && body.featuredUnits.length > 0 && {
                    featuredUnits: {
                        create: body.featuredUnits.map((u: any) => ({
                            unitId: u.id,
                            displayOrder: u.order
                        }))
                    }
                }),

                ...(body.coreUnits && body.coreUnits.length > 0 && {
                    coreUnits: {
                        create: body.coreUnits.map((u: any) => ({
                            unitId: u.id,
                            displayOrder: u.order
                        }))
                    }
                }),

                ...(body.flexUnits && body.flexUnits.length > 0 && {
                    flexUnits: {
                        create: body.flexUnits.map((u: any) => ({
                            unitId: u.id,
                            displayOrder: u.order
                        }))
                    }
                }),

                // --- Relations Traits ---
                ...(body.featuredTraits && body.featuredTraits.length > 0 && {
                    featuredTraits: {
                        create: body.featuredTraits.map((t: any) => ({
                            traitId: t.id,
                            displayOrder: t.order,
                            // Ajout des infos pour la modale au cas où
                            activationLevel: t.activationLevel || undefined,
                            unitCount: t.unitCount ? parseInt(t.unitCount) : undefined

                        }))
                    }
                }),

                // --- Relations Items ---
                ...(body.coreItems && body.coreItems.length > 0 && {
                    coreItems: {
                        create: body.coreItems.map((i: any) => ({
                            itemId: i.id,
                            displayOrder: i.order
                        }))
                    }
                }),

                ...(body.specialItems && body.specialItems.length > 0 && {
                    specialItems: {
                        create: body.specialItems.map((i: any) => ({
                            itemId: i.id,
                            displayOrder: i.order
                        }))
                    }
                }),

                ...(body.priorityComponents && body.priorityComponents.length > 0 && {
                    priorityComponents: {
                        create: body.priorityComponents.map((c: any) => ({
                            itemId: c.id,
                            displayOrder: c.order
                        }))
                    }
                }),

                // --- Relations augments ---
                ...(body.augmentsPriority && body.augmentsPriority.length > 0 && {
                    augmentsPriority: {
                        create: body.augmentsPriority.map((a: any) => ({
                            augmentId: a.id,
                            displayOrder: a.order
                        }))
                    }
                })
            }
        })

        return {
            success: true,
            message: `La composition "${newComp.name}" a été créée avec succès}`,
            data: newComp
        }

    } catch (error) {
        console.error("Erreur lors de la création de la composition", error)

        const prismaError = error as any
        if (prismaError.code === 'P2002') {
            throw createError({
                statusCode: 409,
                message: "Une composition avec ce nom existe déjà"
            })
        }

        if (prismaError.code === 'P2025') {
            throw createError({
                statusCode: 404,
                message: "Une des ressources référencées (unit, item, trait, style) n'existe pas"
            })
        }

        throw createError({
            statusCode: 500,
            message: "Erreur serveur lors de la création de la composition"
        })
    }
})