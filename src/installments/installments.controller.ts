import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { InstallmentsService } from './installments.service';
import { ListQueryDto, UpdateStatusDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

@Controller('installments')
@UseGuards(JwtAuthGuard)
export class InstallmentsController {
  constructor(private readonly installments: InstallmentsService) {}

  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.installments.findAll(query.status);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.installments.updateStatus(id, dto.status);
  }
}
