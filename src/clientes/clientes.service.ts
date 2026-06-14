import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { inspecionarDocumento } from '../common/documento';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Busca de autocomplete: filtra por nome (case-insensitive) ou
   * pelos dígitos do documento.
   * Limitada a 10 resultados; sem `search` retorna últimos 10 criados.
   */
  async search(query: string | undefined) {
    const q = (query ?? '').trim();
    if (!q) {
      return this.prisma.cliente.findMany({
        orderBy: { criadoEm: 'desc' },
        take: 10,
      });
    }
    const digitos = q.replace(/\D/g, '');
    const where: Prisma.ClienteWhereInput = {
      OR: [
        { nome: { contains: q } },
        ...(digitos.length >= 3 ? [{ documento: { contains: digitos } }] : []),
      ],
    };
    return this.prisma.cliente.findMany({
      where,
      orderBy: { nome: 'asc' },
      take: 10,
    });
  }

  findAll() {
    return this.prisma.cliente.findMany({ orderBy: { criadoEm: 'desc' } });
  }

  /**
   * Cria cliente garantindo unicidade do documento.
   * Em caso de conflito, lança ConflictException com nome do existente.
   * Pode receber um tx (transação) externo do PaymentsService.
   */
  async criar(
    data: { nome: string; documento: string; tipoPessoa: 'PF' | 'PJ' },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    const existing = await client.cliente.findUnique({
      where: { documento: data.documento },
    });
    if (existing) {
      throw new ConflictException(
        `Documento já cadastrado para "${existing.nome}". Selecione esse cliente da lista.`,
      );
    }
    return client.cliente.create({ data });
  }

  /**
   * Valida documento (formato + DV) e devolve dígitos + tipoPessoa.
   * Lança ConflictException se inválido (mensagem amigável).
   */
  validarDocumento(input: string) {
    const info = inspecionarDocumento(input);
    if (!info.valido || !info.tipo) {
      throw new ConflictException(
        'Documento inválido. Verifique o CPF (11 dígitos) ou CNPJ (14 dígitos).',
      );
    }
    return { digitos: info.digitos, tipoPessoa: info.tipo };
  }
}
