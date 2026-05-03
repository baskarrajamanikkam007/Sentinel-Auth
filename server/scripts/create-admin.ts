import 'dotenv/config';
import { PrismaClient, Role } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import argon2 from 'argon2';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function createAdmin(): Promise<void> {
  const [, , email, password, name] = process.argv;

  if (!email || !password) {
    console.error('Usage: ts-node scripts/create-admin.ts <email> <password> [name]');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { role: Role.ADMIN } });
    console.log(`Updated existing user ${email} to ADMIN role.`);
    return;
  }

  const hashed = await argon2.hash(password, { memoryCost: 2 ** 16, timeCost: 3, parallelism: 1 });
  const user = await prisma.user.create({
    data: { email, password: hashed, name: name ?? null, role: Role.ADMIN, isEmailVerified: true },
  });

  console.log(`Admin created: ${user.email} (id: ${user.id})`);
}

createAdmin()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
