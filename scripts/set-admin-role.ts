import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setAdminRole() {
  const email = process.argv[2]

  if (!email) {
    console.error('Usage: npx tsx scripts/set-admin-role.ts <email>')
    process.exit(1)
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.error(`User with email ${email} not found`)
      process.exit(1)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'admin' },
    })

    console.log(`✅ User ${email} has been set as admin`)
  } catch (error) {
    console.error('Error setting admin role:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setAdminRole()

