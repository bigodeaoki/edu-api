import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { InstallmentsModule } from '../installments/installments.module';

@Module({
  imports: [InstallmentsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
