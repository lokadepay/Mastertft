import { defineEventHandler, getQuery, createError } from 'h3'
import { searchContent } from '~/server/utils/ddragon'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const q = query.q as string
    const type = query.type as 'units' | 'augments' | 'items' | 'traits'

    if (!q || q.length < 2) {
        return []
    }

    if (!type || !['units', 'augments', 'items', 'traits'].includes(type)) {
        throw createError({
            statusCode: 400,
            message: "Type invalide"
        })
    }

    try {
        const results = await searchContent(q, type)
        return results

    } catch (error: any) {
        console.error("API DDragon Error:", error)
        throw createError({
            statusCode: 500,
            message: "Erreur interne lors de la recherche DDragon"
        })
    }
})