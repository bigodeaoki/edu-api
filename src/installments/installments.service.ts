import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ParcelaStatus, JwtPayload } from '../common/types';

@Injectable()
export class InstallmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: ParcelaStatus, user?: JwtPayload) {
    await this.refreshVencidas();
    // Owner vê todas as parcelas; vendedor vê só as dos próprios pagamentos.
    const scoped =
      user && user.role !== 'owner' ? { payment: { userId: user.sub } } : {};
    return this.prisma.installment.findMany({
      where: {
        ...(status ? { status } : {}),
        ...scoped,
      },
      orderBy: { vencimento: 'asc' },
    });
  }

  /**
   * Atualiza status da parcela. Se virar 'pago', gera Commission
   * com base no % do User dono do Payment (uma vez só por parcela).
   */
  async updateStatus(id: string, status: ParcelaStatus, user?: JwtPayload) {
    const parcela = await this.prisma.installment.findUnique({
      where: { id },
      include: { payment: { include: { user: true } } },
    });
    if (!parcela) throw new NotFoundException('Parcela não encontrada');
    // Vendedor só altera parcelas dos próprios pagamentos.
    if (user && user.role !== 'owner' && parcela.payment.userId !== user.sub) {
      throw new NotFoundException('Parcela não encontrada');
    }

    const becamePago = status === 'pago' && parcela.status !== 'pago';

    const updated = await this.prisma.$transaction(async (tx) => {
      const p = await tx.installment.update({
        where: { id },
        data: {
          status,
          pagaEm: status === 'pago' ? parcela.pagaEm ?? new Date() : parcela.pagaEm,
        },
      });

      if (becamePago) {
        const existing = await tx.commission.findUnique({ where: { parcelaId: id } });
        if (!existing) {
          const pct = parcela.payment.user.percentualComissao;
          const valorReceber = Math.round(parcela.valor * (pct / 100) * 100) / 100;
          await tx.commission.create({
            data: {
              paymentId: parcela.paymentId,
              userId: parcela.payment.userId,
              parcelaId: parcela.id,
              valorParcela: parcela.valor,
              valorReceber,
            },
          });
        }
      }
      return p;
    });

    return updated;
  }

  /** Marca como 'vencido' todas as parcelas pendentes com vencimento < hoje (data, sem hora). */
  async refreshVencidas() {
    const inicioHoje = new Date();
    inicioHoje.setHours(0, 0, 0, 0);
    await this.prisma.installment.updateMany({
      where: { status: 'pendente', vencimento: { lt: inicioHoje } },
      data: { status: 'vencido' },
    });
  }
}
