const ICONS: Record<string, { src: string }> = {
    'AP': { src: '/icons/AP.svg' },
    'AD': { src: '/icons/AD.svg' },
    'HP': { src: '/icons/HP.svg' }
}

export const formatText = (text: string) => {
    if (!text) return ''

    return text.replace(/@([A-Z]+)/g, (match, key) => {
        const icon = ICONS[key]
        if (!icon) return match

        return `<span class="stat-icon">
                <img src="${icon.src}" alt"${key}" />
                ${key}
                </span>`

    })
}