import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload, Role } from '../common/types';
import { LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const ok = await bcrypt.compare(dto.senha, user.senhaHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as Role,
    };
    const token = await this.jwt.signAsync(payload);
    const { senhaHash, ...safeUser } = user;
    void senhaHash;
    return { token, user: safeUser };
  }

  static async hash(senha: string) {
    return bcrypt.hash(senha, 10);
  }
}
