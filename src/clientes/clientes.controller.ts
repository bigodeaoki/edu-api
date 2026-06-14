import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

@Controller('clientes')
@UseGuards(JwtAuthGuard)
export class ClientesController {
  constructor(private readonly clientes: ClientesService) {}

  @Get()
  search(@Query('search') search?: string) {
    return this.clientes.search(search);
  }
}
