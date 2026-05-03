import 'dotenv/config';
import { PrismaClient, Role } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import argon2 from 'argon2';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const USERS = [
  { email: 'admin@sentinelauth.dev', password: 'Admin@123456', name: 'Admin User', role: Role.ADMIN },
  { email: 'alice@sentinelauth.dev', password: 'Alice@123456', name: 'Alice Smith', role: Role.USER },
  { email: 'bob@sentinelauth.dev', password: 'Bob@123456', name: 'Bob Jones', role: Role.USER },
];

async function seed(): Promise<void> {
  console.log('Seeding database...');

  for (const userData of USERS) {
    const existing = await prisma.user.findUnique({ where: { email: userData.email } });
    if (existing) {
      console.log(`  Skipping ${userData.email} — already exists`);
      continue;
    }

    const password = await argon2.hash(userData.password, { memoryCost: 2 ** 16, timeCost: 3, parallelism: 1 });
    await prisma.user.create({
      data: {
        email: userData.email,
        password,
        name: userData.name,
        role: userData.role,
        isEmailVerified: true,
      },
    });
    console.log(`  Created ${userData.role}: ${userData.email}`);
  }

  console.log('Seed complete.');
}

seed()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
