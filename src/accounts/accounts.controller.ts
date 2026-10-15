import {
  Controller,
  Delete,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AccountsService } from './accounts.service.js';

@ApiTags('Accounts & Cards (Счета и карты)')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список всех выпущенных банковских карт' })
  findAll() {
    return this.accountsService.findAll();
  }

  @Get(':cardNumber')
  @ApiOperation({ summary: 'Получить информацию о карте и балансе по 16-значному номеру' })
  findByCardNumber(@Param('cardNumber') cardNumber: string) {
    return this.accountsService.findByCardNumber(cardNumber);
  }

  @Delete(':cardNumber')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Закрыть и удалить карту (владелец или ADMIN)' })
  deleteCard(
    @Param('cardNumber') cardNumber: string,
    @Req() req: { user: { id: string; role: string } },
  ) {
    return this.accountsService.deleteCard(cardNumber, req.user.id, req.user.role);
  }
}