import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.OWNER_EMAIL ?? 'owner@edu.com';
  const senha = process.env.OWNER_PASSWORD ?? 'owner123';
  const nome = process.env.OWNER_NOME ?? 'Owner';

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    // eslint-disable-next-line no-console
    console.log(`Owner ${email} já existe — pulando seed.`);
    return;
  }
  await prisma.user.create({
    data: {
      nome,
      email,
      senhaHash: await bcrypt.hash(senha, 10),
      role: 'owner',
      percentualComissao: 0,
    },
  });
  // eslint-disable-next-line no-console
  console.log(`Owner criado: ${email} / ${senha}`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
