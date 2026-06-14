import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Já existe usuário com este e-mail');
    const senhaHash = await AuthService.hash(dto.senha);
    const user = await this.prisma.user.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senhaHash,
        role: dto.role,
        percentualComissao: dto.percentualComissao,
      },
    });
    return this.strip(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({ orderBy: { criadoEm: 'desc' } });
    return users.map((u) => this.strip(u));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.strip(user);
  }

  private strip<T extends { senhaHash: string }>(u: T) {
    const { senhaHash, ...rest } = u;
    void senhaHash;
    return rest;
  }
}
