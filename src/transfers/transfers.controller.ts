import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TransfersService } from './transfers.service.js';
import { CreateTransferDto } from './dto/create-transfer.dto.js';

@ApiTags('Transfers (Переводы)')
@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Выполнить банковский перевод (только со своей карты)' })
  executeTransfer(
    @Body() dto: CreateTransferDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.transfersService.executeTransfer(dto, req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'История всех переводов' })
  findAll() {
    return this.transfersService.findAll();
  }
}