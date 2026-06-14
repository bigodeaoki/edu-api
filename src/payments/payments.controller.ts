import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  findAll() {
    return this.payments.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payments.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: JwtPayload) {
    return this.payments.create(dto, user.sub);
  }
}
