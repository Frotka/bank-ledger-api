import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransfersService } from './transfers.service.js';
import { TransfersController } from './transfers.controller.js';
import { Transfer } from './transfer.entity.js';
import { AccountsModule } from '../accounts/accounts.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transfer]),
    AccountsModule,
  ],
  controllers: [TransfersController],
  providers: [TransfersService],
})
export class TransfersModule {}