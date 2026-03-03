import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.employee.upsert({
    where: { email: 'admin@shifttrack.app' },
    update: {},
    create: {
      fullName: 'System Admin',
      phone: '+972000000000',
      email: 'admin@shifttrack.app',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log(`✅ Admin created: ${admin.email} / Admin123!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
