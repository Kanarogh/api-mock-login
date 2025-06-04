import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { EstoqueService } from './estoque.service';
import { CreateEstoqueDto } from './dto/create-estoque.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('estoque')
export class EstoqueController {
  constructor(private readonly service: EstoqueService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':produtoId')
  findByProdutoId(@Param('produtoId') id: string) {
    return this.service.findByProdutoId(Number(id));
  }

  @Post()
  create(@Body() dto: CreateEstoqueDto) {
    return this.service.create(dto);
  }

  @Patch(':produtoId')
  update(@Param('produtoId') id: string, @Body() dto: Partial<CreateEstoqueDto>) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':produtoId')
  delete(@Param('produtoId') id: string) {
    return this.service.delete(Number(id));
  }
}
