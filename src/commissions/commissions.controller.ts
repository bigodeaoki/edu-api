import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

@Controller('commissions')
@UseGuards(JwtAuthGuard)
export class CommissionsController {
  constructor(private readonly commissions: CommissionsService) {}

  @Get()
  findAll(@Query('userId') userId?: string) {
    return userId ? this.commissions.findByUser(userId) : this.commissions.findAll();
  }
}
