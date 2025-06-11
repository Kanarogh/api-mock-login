import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { EstoqueService } from './estoque.service';
import { CreateEstoqueDto } from './dto/create-estoque.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('estoque')
export class EstoqueController {
  constructor(private readonly service: EstoqueService) {}

  @Get()
  findAll(@Req() req) {
    // CORREÇÃO: Usando req.user.empresaId para pegar o ID da empresa
    const empresaId = req.user.empresaId;
    return this.service.findAll(empresaId);
  }

  @Get(':produtoId')
  findByProdutoId(@Param('produtoId') produtoId: string, @Req() req) {
    // CORREÇÃO: Usando req.user.empresaId
    const empresaId = req.user.empresaId;
    return this.service.findByProdutoId(Number(produtoId), empresaId);
  }

  @Post()
  create(@Body() dto: CreateEstoqueDto, @Req() req) {
    // CORREÇÃO: Usando req.user.empresaId
    const empresaId = req.user.empresaId;
    return this.service.create(dto, empresaId);
  }

  @Patch(':produtoId')
  update(@Param('produtoId') produtoId: string, @Body() dto: Partial<CreateEstoqueDto>, @Req() req) {
    // CORREÇÃO: Usando req.user.empresaId
    const empresaId = req.user.empresaId;
    return this.service.update(Number(produtoId), dto, empresaId);
  }

  @Delete(':produtoId')
  delete(@Param('produtoId') produtoId: string, @Req() req) {
    // CORREÇÃO: Usando req.user.empresaId
    const empresaId = req.user.empresaId;
    return this.service.delete(Number(produtoId), empresaId);
  }
}
