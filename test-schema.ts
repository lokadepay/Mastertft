// test-schema.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // On nettoie la base pour le test (optionnel)
    // await prisma.mtftUnit.deleteMany() 

    console.log('Création d\'un champion test...')

    // CRÉATION IMBRIQUÉE (Nested Write)
    // On crée le Champion + Sa Capacité + Les Stats de la capacité d'un coup
    const ahri = await prisma.mtftUnit.create({
        data: {
            name: "Ahri",
            riotApiId: "TFT11_Ahri",
            cost: 1,
            imageUrl: "url_de_ahri.png",
            health: 500,
            startMana: 0,
            maxMana: 60,
            armor: 20,
            magicResist: 20,
            attackDamage: 40,
            attackSpeed: 0.75,
            attackRange: 4,

            // Ici on crée la relation 1-to-1 avec l'Ability
            ability: {
                create: {
                    name: "Bisou Cœur",
                    active: "Ahri envoie un bisou qui inflige des dégâts...",
                    // Ici on crée la relation 1-to-Many avec les ScalingStats
                    scalingStats: {
                        create: [
                            { statName: "Dégâts Magiques", statValue: "200 / 300 / 450" },
                            { statName: "Nombre de cibles", statValue: "1" }
                        ]
                    }
                }
            }
        },
        // On demande à Prisma de nous renvoyer l'objet créé AVEC les relations
        include: {
            ability: {
                include: {
                    scalingStats: true
                }
            }
        }
    })

    console.log('Champion créé avec succès !')
    console.dir(ahri, { depth: null }) // Affiche l'objet complet dans la console
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })