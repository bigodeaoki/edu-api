import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { addDays } from 'date-fns';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ClientesService } from '../clientes/clientes.service';
import { CreatePaymentDto, ParteDivisaoDto } from './dto';
import type { Parte, JwtPayload } from '../common/types';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private clientes: ClientesService,
  ) {}

  async findAll(user?: JwtPayload) {
    // Owner vê todos os pagamentos; vendedor vê apenas os seus.
    const where = user && user.role !== 'owner' ? { userId: user.sub } : undefined;
    return this.prisma.payment.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      include: { installments: true, cliente: true },
    });
  }

  async findOne(id: string, user?: JwtPayload) {
    const p = await this.prisma.payment.findUnique({
      where: { id },
      include: { installments: true, cliente: true },
    });
    if (!p) throw new NotFoundException('Pagamento não encontrado');
    if (user && user.role !== 'owner' && p.userId !== user.sub) {
      throw new NotFoundException('Pagamento não encontrado');
    }
    return p;
  }

  async create(dto: CreatePaymentDto, userIdFallback: string) {
    const userId = dto.userId ?? userIdFallback;
    this.validarDivisao(dto);

    const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) throw new BadRequestException('userId não corresponde a usuário existente');

    if (!dto.clienteId && !dto.cliente) {
      throw new BadRequestException(
        'Informe clienteId (cliente existente) ou cliente (novo cadastro).',
      );
    }
    if (dto.clienteId && dto.cliente) {
      throw new BadRequestException(
        'Informe apenas clienteId OU cliente — não ambos.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Resolve o cliente (existente ou novo) dentro da mesma transação
      let cliente;
      if (dto.clienteId) {
        cliente = await tx.cliente.findUnique({ where: { id: dto.clienteId } });
        if (!cliente) throw new BadRequestException('Cliente não encontrado');
      } else {
        const { digitos, tipoPessoa } = this.clientes.validarDocumento(dto.cliente!.documento);
        cliente = await this.clientes.criar(
          { nome: dto.cliente!.nome, documento: digitos, tipoPessoa },
          tx,
        );
      }

      const parcelasA = this.buildParcelas('A', dto.parteA, cliente.nome);
      const parcelasB = this.buildParcelas('B', dto.parteB, cliente.nome);

      return tx.payment.create({
        data: {
          userId,
          clienteId: cliente.id,
          clienteNome: cliente.nome,
          clienteDocumento: cliente.documento,
          apelido: dto.apelido?.trim() || null,
          valorTotal: dto.valorTotal,
          parteAValor: dto.parteA.valor,
          parteAEntrada: dto.parteA.entrada,
          parteAQtd: dto.parteA.qtdParcelas,
          parteADias: dto.parteA.diasEntreParcelas,
          parteAPrimVenc: new Date(dto.parteA.primeiroVencimento),
          parteBValor: dto.parteB.valor,
          parteBEntrada: dto.parteB.entrada,
          parteBQtd: dto.parteB.qtdParcelas,
          parteBDias: dto.parteB.diasEntreParcelas,
          parteBPrimVenc: new Date(dto.parteB.primeiroVencimento),
          installments: { create: [...parcelasA, ...parcelasB] },
        },
        include: { installments: true, cliente: true },
      });
    });
  }

  private validarDivisao(dto: CreatePaymentDto) {
    const somaPartes = dto.parteA.valor + dto.parteB.valor;
    if (Math.abs(somaPartes - dto.valorTotal) > 0.01) {
      throw new BadRequestException('A soma de Parte A + Parte B deve ser igual ao valor total');
    }
    if (dto.parteA.entrada > dto.parteA.valor) {
      throw new BadRequestException('Entrada de A não pode ultrapassar o valor de A');
    }
    if (dto.parteB.entrada > dto.parteB.valor) {
      throw new BadRequestException('Entrada de B não pode ultrapassar o valor de B');
    }
  }

  private buildParcelas(
    parte: Parte,
    d: ParteDivisaoDto,
    clienteNome: string,
  ): Prisma.InstallmentCreateWithoutPaymentInput[] {
    const restante = d.valor - d.entrada;
    if (restante <= 0 || d.qtdParcelas <= 0) return [];
    const valorParcela = Math.round((restante / d.qtdParcelas) * 100) / 100;
    const primeiro = new Date(d.primeiroVencimento);
    return Array.from({ length: d.qtdParcelas }, (_, i) => ({
      parte,
      numero: i + 1,
      valor: valorParcela,
      vencimento: addDays(primeiro, i * d.diasEntreParcelas),
      status: 'pendente',
      clienteNome,
    }));
  }
}
