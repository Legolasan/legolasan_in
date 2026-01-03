// Simple script to check and set admin role
// Usage: node scripts/check-user-role.js <email>

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAndSetAdminRole() {
  const email = process.argv[2]

  if (!email) {
    console.error('Usage: node scripts/check-user-role.js <email>')
    console.error('Example: node scripts/check-user-role.js user@example.com')
    process.exit(1)
  }

  try {
    // Check all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    console.log('\n📋 All users in database:')
    console.log('─'.repeat(80))
    allUsers.forEach((user, index) => {
      const isFirst = index === 0
      const isAdmin = user.role === 'admin'
      const marker = isFirst ? '👑' : isAdmin ? '✅' : '❌'
      console.log(`${marker} ${user.email} - Role: ${user.role} ${isFirst ? '(First user)' : ''}`)
    })
    console.log('─'.repeat(80))

    // Find the specific user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.error(`\n❌ User with email ${email} not found`)
      process.exit(1)
    }

    console.log(`\n👤 User: ${user.email}`)
    console.log(`   Current role: ${user.role}`)

    // Check if this is the first user
    const userCount = await prisma.user.count()
    const isFirstUser = allUsers[0]?.id === user.id

    if (user.role !== 'admin') {
      if (isFirstUser) {
        console.log(`\n🔧 Setting admin role (this is the first user)...`)
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'admin' },
        })
        console.log(`✅ User ${email} has been set as admin`)
      } else {
        console.log(`\n⚠️  This user is not the first user.`)
        console.log(`   To set this user as admin, run:`)
        console.log(`   node scripts/check-user-role.js ${email} --force`)
        
        if (process.argv[3] === '--force') {
          console.log(`\n🔧 Force setting admin role...`)
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'admin' },
          })
          console.log(`✅ User ${email} has been set as admin`)
        }
      }
    } else {
      console.log(`\n✅ User already has admin role`)
    }
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndSetAdminRole()

