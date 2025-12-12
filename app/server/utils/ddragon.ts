const DDRAGON_BASE_URL = "https://ddragon.leagueoflegends.com"

// --- TYPES ---
interface DDragonCheckResult {
    exists: boolean
    data?: any
    name?: string
    imageUrl?: string
}

interface SearchResult {
    label: string
    riotId: string
    imageUrl: string
    stats?: any
}

// --- CACHE SIMPLE ---
let cachedVersion: string | null = null
let cachedData: any = null
let lastFetchTime = 0
const CACHE_DURATION = 1000 * 60 * 60

// --- CORE FONCTIONS ---
// Récupère la dernière version du jeu
export const getLatestVersion = async (): Promise<string> => {
    const now = Date.now()
    if (cachedVersion && (now - lastFetchTime < CACHE_DURATION)) {
        return cachedVersion
    }

    try {
        const versions = await $fetch<string[]>(`${DDRAGON_BASE_URL}/api/versions.json`)
        const latest = versions[0]

        if (latest) {
            cachedVersion = latest
            lastFetchTime = now
            return latest // Retourne le string
        }

        return "latest" // Fallback si tableau vide
    } catch (e) {
        console.error("Erreur récupération version DDragon", e)
        return "latest"
    }
}

// Récupère JSON Data Dragon TFT + gère le cache
export const getTFTData = async () => {
    const version = await getLatestVersion()

    if (cachedData && cachedVersion === version) return cachedData

    try {
        const data = await $fetch<any>(`${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/tft-tft.json`)
        cachedData = data
        return data
    } catch (e) {
        console.error("Erreur fetch TFT Data", e)
        return {}
    }
}

// Helpeur pour trouver le bon set
function getTargetSet(fullData: any) {
    const sets = fullData.sets || {}
    // *** ON CHERCHE EXPLICITEMENT LE BON SET (SET 16) ******************************************************************************************************
    let targetSet = sets['16'] || Object.values(sets).find((s: any) => s?.name === 'TFTSet16')

    // Si on trouve pas, dernier set de la liste
    if (!targetSet) {
        const keys = Object.keys(sets)
        if (keys.length > 0) {
            const lastKey = keys[keys.length - 1]
            if (lastKey && sets[lastKey]) {
                targetSet = sets[lastKey]
            }
        }
    }
    return targetSet
}

// --- UTILITAIRES ---
export const verifyRiotId = async (riotId: string, type: 'units' | 'items' | 'traits' | 'augments'): Promise<DDragonCheckResult> => {
    try {
        const version = await getLatestVersion()
        const fullData = await getTFTData()
        const targetSet = getTargetSet(fullData)

        let foundItem: any = null
        let imageUrl = ""

        // --- UNITS ---
        if (type === 'units') {
            if (targetSet && targetSet.champions) {
                foundItem = targetSet.champions.find((c: any) => c.apiName === riotId)
            }

            if (!foundItem && fullData?.sets) {
                for (const setKey in fullData.sets) {
                    const currentSet = fullData.sets[setKey]
                    if (currentSet?.champions) {
                        const c = currentSet.champions.find((c: any) => c.apiName === riotId)
                        if (c) { foundItem = c; break; }
                    }
                }
            }
            if (foundItem) imageUrl = `${DDRAGON_BASE_URL}/cdn/${version}/img/tft-champion/${foundItem.apiName}.png`
        }

        // --- ITEMS ---
        else if (type === 'items') {
            const items = fullData?.items || []
            foundItem = items.find((i: any) => i.id === riotId || i.apiName === riotId)
            if (foundItem) {
                imageUrl = `${DDRAGON_BASE_URL}/cdn/${version}/img/tft-item/${foundItem.id}.png`
            }
        }

        // --- TRAITS ---
        else if (type === 'traits') {
            if (targetSet && targetSet.traits) {
                foundItem = targetSet.traits.find((t: any) => t.apiName === riotId)
            }
            if (foundItem) {
                const iconName = foundItem.icon ? foundItem.icon.replace('.png', '') : foundItem.apiName
                imageUrl = `${DDRAGON_BASE_URL}/cdn/${version}/img/tft-trait/${iconName}.png`
            }
        }

        // --- AUGMENTS ---
        else if (type === 'augments') {
            const items = fullData?.items || []
            foundItem = items.find((i: any) => i.apiName === riotId || i.id === riotId)
            if (foundItem) {
                const iconName = foundItem.icon ? foundItem.icon.replace('.png', '') : foundItem.apiName
                imageUrl = `${DDRAGON_BASE_URL}/cdn/${version}/img/tft-item/${iconName}.png`
            }
        }

        if (foundItem) {
            return { exists: true, name: foundItem.name, imageUrl, data: foundItem }
        }
        return { exists: false }

    } catch (error) {
        console.error(`Erreur verifyRiotId (${riotId})`, error)
        return { exists: false }
    }
}

// Auto complétion
export const searchContent = async (query: string, type: 'units' | 'items' | 'augments' | 'traits'): Promise<SearchResult[]> => {
    const version = await getLatestVersion()
    const fullData = await getTFTData()
    const targetSet = getTargetSet(fullData)
    const normalizedQuery = query.toLowerCase()
    const results: SearchResult[] = []

    // --- UNITS ---
    if (type === 'units' && targetSet && targetSet.champions) {
        const matches = targetSet.champions.filter((c: any) =>
            (c.name && c.name.toLowerCase().includes(normalizedQuery)) ||
            (c.apiName && c.apiName.toLowerCase().includes(normalizedQuery))
        )

        results.push(...matches.map((c: any) => ({
            label: c.name,
            riotId: c.apiName,
            imageUrl: `${DDRAGON_BASE_URL}/cdn/${version}/img/tft-champion/${c.apiName}.png`,
            stats: {
                cost: c.cost,
                health: c.stats?.hp,
                maxMana: c.stats?.mana,
                startMana: c.stats?.initialMana,
                armor: c.stats?.armor,
                magicResist: c.stats?.magicResist,
                attackDamage: c.stats?.damage,
                attackSpeed: c.stats?.attackSpeed,
                attackRange: c.stats?.attackRange,
                abilityName: c.ability?.name,
                abilityDesc: c.ability?.desc,
                traits: c.traits || []
            }
        })))
    }

    // --- ITEMS ---
    else if (type === 'items') {
        const items = fullData?.items || []
        const matches = items.filter((i: any) =>
            (i.name && i.name.toLowerCase().includes(normalizedQuery)) && i.desc
        )

        results.push(...matches.map((i: any) => ({
            label: i.name,
            riotId: i.id || i.apiName,
            imageUrl: `${DDRAGON_BASE_URL}/cdn/${version}/img/tft-item/${i.id}.png`,
            stats: {
                description: i.desc,
                effects: i.effects
            }
        })))
    }
}