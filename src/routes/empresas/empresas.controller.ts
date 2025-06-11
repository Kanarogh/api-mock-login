import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { AuthGuard } from '@nestjs/passport';

// Adicionamos o AuthGuard no nível do controller.
// Isso significa que apenas usuários autenticados (com um token válido) 
// podem acessar qualquer uma dessas rotas.
@UseGuards(AuthGuard('jwt'))
@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  /**
   * Rota para criar uma nova empresa.
   * Rota: POST /empresas
   * Body: { "nome": "Nova Empresa LTDA", "cnpj": "33.333.333/0001-33" }
   * OBS: Em um app real, esta rota deveria ser protegida por um "AdminGuard"
   * para que apenas administradores possam criar empresas.
   */
  @Post()
  create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresasService.create(createEmpresaDto);
  }

  /**
   * Rota para listar todas as empresas cadastradas.
   * Rota: GET /empresas
   */
  @Get()
  findAll() {
    return this.empresasService.findAll();
  }

  /**
   * Rota para buscar uma única empresa pelo seu ID.
   * Rota: GET /empresas/:id (ex: /empresas/1)
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    // O '+' na frente do 'id' converte a string da URL para um número.
    return this.empresasService.findOne(+id);
  }

  /**
   * Rota para atualizar os dados de uma empresa.
   * Rota: PATCH /empresas/:id (ex: /empresas/1)
   * OBS: Em um app real, esta rota também deveria ser protegida por um "AdminGuard".
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmpresaDto: UpdateEmpresaDto) {
    return this.empresasService.update(+id, updateEmpresaDto);
  }

  /**
   * Rota para deletar uma empresa.
   * Rota: DELETE /empresas/:id (ex: /empresas/1)
   * OBS: Em um app real, esta rota também deveria ser protegida por um "AdminGuard".
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empresasService.remove(+id);
  }
}