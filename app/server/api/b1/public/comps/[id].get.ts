import { defineEventHandler, createError, getRouterParam } from 'h3'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const compId = getRouterParam(event, 'id')

    if (!compId) {
        throw createError({ statusCode: 400, message: 'ID de la compo manquant' })
    }

    try {
        const compositionDetails = await prisma.mtftComposition.findUnique({
            where: { id: compId },
            include: {
                // --- BASE & STATS ---
                compStyle: { select: { name: true } },

                // --- UNITS & TRAITS ---
                featuredUnits: { include: { unit: true } },     // Units sur la carte
                featuredTraits: { include: { trait: true } },   // Traits sur la carte
                coreUnits: { include: { unit: true } },         // Core units dans la modale
                flexUnits: { include: { unit: true } },         // Flex nits dans la modale

                // --- ITEMS ---
                coreItems: { include: { item: true } },             // Core items dans la modale
                priorityComponents: { include: { item: true } },    // Composants à viser dans la compo
                specialItems: { include: { item: true } },         // Items spéciaux à prendre dans la compo

                // --- AUGMENTS ---
                augmentsPriority: { include: { augment: true } },
            },
        })

        if (!compositionDetails) {
            throw createError({ statusCode: 404, message: 'Composition non trouvée' })
        }

        // NETTOYAGE
        const cleanedCompDetails = {
            ...compositionDetails,

            compStyle: compositionDetails.compStyle?.name || null,

            // Désimbrication des units & traits
            featuredUnits: (compositionDetails.featuredUnits as any[]).map(fu => fu.unit),
            featuredTraits: (compositionDetails.featuredTraits as any[]).map(ft => ft.trait),
            coreUnits: (compositionDetails.coreUnits as any[]).map(cu => cu.unit),
            flexUnits: (compositionDetails.flexUnits as any[]).map(fu => fu.unit),

            // Désimbrication des items
            coreItems: (compositionDetails.coreItems as any[]).map(ci => ci.item),
            priorityComponents: (compositionDetails.priorityComponents as any[]).map(pc => pc.item),
            specialItems: (compositionDetails.specialItems as any[]).map(si => si.item),

            // Désimbrication des augments
            augmentsPriority: (compositionDetails.augmentsPriority as any[]).map(ap => ap.augment),
        }

        return cleanedCompDetails

    } catch (error) {
        console.error("Erreur base de données lors du chargement de la composition", error)
        throw createError({
            status: 500,
            message: "Erreur serveur lors de la récupération des détails de la composition",
        })
    }
})