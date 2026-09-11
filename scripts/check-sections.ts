import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const about = await prisma.aboutSection.findMany()
  console.log('ABOUT SECTIONS:', JSON.stringify(about, null, 2))
}
main().finally(async () => { await prisma.$disconnect() })
