import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

/**
 * Garante que o usuário admin (owner) padrão exista toda vez que o backend sobe.
 *
 * É idempotente — se o admin já existir, não faz nada. Roda no bootstrap da
 * aplicação, então funciona em qualquer ambiente (Docker, local ou Railway),
 * não apenas via o entrypoint do container.
 *
 * Credenciais vêm das envs OWNER_EMAIL / OWNER_PASSWORD / OWNER_NOME.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const email = this.config.get<string>('OWNER_EMAIL') ?? 'owner@edu.com';
    const senha = this.config.get<string>('OWNER_PASSWORD') ?? 'owner123';
    const nome = this.config.get<string>('OWNER_NOME') ?? 'Owner';

    try {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing) {
        this.logger.log(`Admin padrão (${email}) já existe — seed ignorado.`);
        return;
      }

      await this.prisma.user.create({
        data: {
          nome,
          email,
          senhaHash: await AuthService.hash(senha),
          role: 'owner',
          percentualComissao: 0,
        },
      });
      this.logger.log(`Admin padrão criado: ${email}`);
    } catch (err) {
      // Não derruba a API por causa do seed. O caso mais provável de erro aqui
      // é a tabela ainda não existir — rode "prisma db push" antes de subir.
      this.logger.error(
        `Falha ao garantir o admin padrão. As tabelas existem? (prisma db push) — ${
          (err as Error).message
        }`,
      );
    }
  }
}
