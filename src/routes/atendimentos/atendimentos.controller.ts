import { Controller, Post, Body, UseGuards, Req,  Param,ParseIntPipe, Get, Query, DefaultValuePipe} from '@nestjs/common';
import { AtendimentosService } from './atendimentos.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('atendimentos')
export class AtendimentosController {
  constructor(private readonly atendimentosService: AtendimentosService) {}

  @Post('checkin')
  checkin(@Body() createCheckinDto: CreateCheckinDto, @Req() req) {
    const usuarioId = req.user.id;
    const empresaId = req.user.empresaId;
    return this.atendimentosService.checkin(createCheckinDto, usuarioId, empresaId);
  }

   // ✅ NOVO MÉTODO PARA PAUSAR O ATENDIMENTO
  @Post(':id/pausar')
  pausar(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const usuarioId = req.user.id;
    return this.atendimentosService.pausar(id, usuarioId);
  }

   // ✅ NOVO MÉTODO PARA RETOMAR O ATENDIMENTO
  @Post(':id/retomar')
  retomar(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const usuarioId = req.user.id;
    return this.atendimentosService.retomar(id, usuarioId);
  }

   // ✅ NOVO MÉTODO PARA FINALIZAR O ATENDIMENTO
  @Post(':id/checkout')
  checkout(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCheckoutDto: CreateCheckoutDto,
    @Req() req,
  ) {
    const usuarioId = req.user.id;
    return this.atendimentosService.checkout(createCheckoutDto, id, usuarioId);
  }

    // ✅ NOVO MÉTODO PARA BUSCAR O ATENDIMENTO ATUAL
  @Get('atual')
  getStatusAtual(@Req() req) {
    const usuarioId = req.user.id;
    return this.atendimentosService.getStatusAtual(usuarioId);
  }

    // ✅ NOVO MÉTODO PARA BUSCAR O HISTÓRICO
  @Get('historico')
  getHistorico(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const usuarioId = req.user.id;
    return this.atendimentosService.getHistorico(usuarioId, page, limit);
  }

    // ✅ NOVO MÉTODO PARA BUSCAR OS EVENTOS DO DIA
  @Get('eventos-do-dia')
  getEventosDoDia(@Req() req) {
    const usuarioId = req.user.id;
    return this.atendimentosService.getEventosDoDia(usuarioId);
  }

}