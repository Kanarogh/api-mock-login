import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  findAll(@Req() req) {
    // CORREÇÃO: Usando req.user.empresaId para pegar o ID da empresa
    const empresaId = req.user.empresaId;
    return this.service.findAll(empresaId);
  }

  @Post()
  create(@Body() dto: CreateProductDto, @Req() req) {
    // CORREÇÃO: Usando req.user.empresaId
    const empresaId = req.user.empresaId;
    return this.service.create(dto, empresaId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>, @Req() req) {
    // CORREÇÃO: Usando req.user.empresaId
    const empresaId = req.user.empresaId;
    return this.service.update(Number(id), dto, empresaId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    // CORREÇÃO: Usando req.user.empresaId
    const empresaId = req.user.empresaId;
    return this.service.delete(Number(id), empresaId);
  }
}
