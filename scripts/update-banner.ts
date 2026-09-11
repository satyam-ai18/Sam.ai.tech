import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.heroSlide.updateMany({
    data: {
      backgroundImage: '/uploads/hero-banner.jpg',
      overlayIntensity: 40,
    },
  })
  console.log('Successfully updated hero slides to /uploads/hero-banner.jpg')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
