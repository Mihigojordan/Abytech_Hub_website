import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@abytechhub.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

  const userEmail = process.env.SEED_USER_EMAIL || 'user@abytechhub.com';
  const userPassword = process.env.SEED_USER_PASSWORD || 'User@123';

  // Super admin account
  const admin = await prisma.admin.upsert({
    where: { adminEmail },
    update: {},
    create: {
      adminName: 'Super Admin',
      adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      status: 'ACTIVE',
      isSuperAdmin: true,
      joinedDate: new Date(),
    },
  });

  // Regular user account
  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      name: 'Demo User',
      email: userEmail,
      password: await bcrypt.hash(userPassword, 10),
      initial: 'DU',
      status: 'ACTIVE',
      role: 'USER',
    },
  });

  console.log(`Seeded admin: ${admin.adminEmail}`);
  console.log(`Seeded user:  ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
