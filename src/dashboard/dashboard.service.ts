import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InstallmentsService } from '../installments/installments.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private installments: InstallmentsService,
  ) {}

  async stats() {
    await this.installments.refreshVencidas();

    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const [parcelas, pagamentosMes, commissions] = await Promise.all([
      this.prisma.installment.findMany({
        select: { valor: true, status: true, vencimento: true, pagaEm: true },
      }),
      this.prisma.payment.count({ where: { criadoEm: { gte: inicioMes } } }),
      this.prisma.commission.aggregate({ _sum: { valorReceber: true } }),
    ]);

    const totalPago = parcelas.filter((p) => p.status === 'pago').reduce((s, p) => s + p.valor, 0);
    const aReceber = parcelas
      .filter((p) => p.status !== 'pago')
      .reduce((s, p) => s + p.valor, 0);
    const vencidas = parcelas.filter((p) => p.status === 'vencido');
    const totalVencidas = vencidas.reduce((s, p) => s + p.valor, 0);

    // Histograma mensal do ano corrente (pagamentos × pendentes)
    const ano = new Date().getFullYear();
    const meses = Array.from({ length: 12 }, () => ({ pagamentos: 0, pendente: 0 }));
    for (const p of parcelas) {
      const ref = p.pagaEm ?? p.vencimento;
      const d = new Date(ref);
      if (d.getFullYear() !== ano) continue;
      if (p.status === 'pago') meses[d.getMonth()].pagamentos += p.valor;
      else meses[d.getMonth()].pendente += p.valor;
    }

    return {
      totalPago,
      aReceber,
      vencidas: {
        quantidade: vencidas.length,
        total: totalVencidas,
      },
      comissoes: {
        total: commissions._sum.valorReceber ?? 0,
      },
      pagamentosMes,
      grafico: meses.map((m, i) => ({
        mes: i + 1,
        pagamentos: m.pagamentos,
        pendente: m.pendente,
      })),
    };
  }
}
