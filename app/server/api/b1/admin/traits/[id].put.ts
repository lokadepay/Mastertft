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
            }
        })
    }
})