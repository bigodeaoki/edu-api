import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { InstallmentsService } from './installments.service';
import { ListQueryDto, UpdateStatusDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types';

@Controller('installments')
@UseGuards(JwtAuthGuard)
export class InstallmentsController {
  constructor(private readonly installments: InstallmentsService) {}

  @Get()
  findAll(@Query() query: ListQueryDto, @CurrentUser() user: JwtPayload) {
    return this.installments.findAll(query.status, user);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.installments.updateStatus(id, dto.status, user);
  }
}
