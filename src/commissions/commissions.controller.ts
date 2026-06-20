import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types';

@Controller('commissions')
@UseGuards(JwtAuthGuard)
export class CommissionsController {
  constructor(private readonly commissions: CommissionsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('userId') userId?: string) {
    // Vendedor só vê as próprias comissões; owner vê todas (ou filtra por userId).
    if (user.role !== 'owner') return this.commissions.findByUser(user.sub);
    return userId ? this.commissions.findByUser(userId) : this.commissions.findAll();
  }
}
