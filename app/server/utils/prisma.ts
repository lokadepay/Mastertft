import { PrismaClient } from '@prisma/client'

const databaseUrl = process.env.DATABASE_URL

declare global {
    var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient({
    log: ['query'],

    datasources: {
        db: {
            url: databaseUrl,
        },
    },
})

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma
}