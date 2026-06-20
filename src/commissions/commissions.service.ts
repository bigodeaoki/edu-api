import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.commission.findMany({
      orderBy: { geradoEm: 'desc' },
      include: { user: { select: { id: true, nome: true } } },
    });
  }

  findByUser(userId: string) {
    return this.prisma.commission.findMany({
      where: { userId },
      orderBy: { geradoEm: 'desc' },
      include: { user: { select: { id: true, nome: true } } },
    });
  }
}
