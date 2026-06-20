import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@prisma/client';

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.query();
  }

  async findByUser(userId: string) {
    return this.query({ userId });
  }

  /** Lista comissões já com o nome do vendedor e o apelido do pagamento achatado. */
  private async query(where?: Prisma.CommissionWhereInput) {
    const rows = await this.prisma.commission.findMany({
      where,
      orderBy: { geradoEm: 'desc' },
      include: {
        user: { select: { id: true, nome: true } },
        payment: { select: { apelido: true } },
      },
    });
    return rows.map(({ payment, ...rest }) => ({
      ...rest,
      apelido: payment?.apelido ?? null,
    }));
  }
}
