import {
  Controller,
  Get,
  UseGuards,
  Delete,
  Param,
  ParseIntPipe,
  NotFoundException,
  Put,
  Body,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Lista todos os usuários DA MESMA EMPRESA do usuário logado.
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Req() req) {
    const empresaId = req.user.empresaId;
    return this.usersService.findAllByCompany(empresaId);
  }

  /**
   * Deleta um usuário. 
   * A lógica no service garante que você só pode deletar usuários da sua própria empresa.
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const empresaId = req.user.empresaId;
    const deleted = await this.usersService.deleteById(id, empresaId);
    if (!deleted) {
      throw new NotFoundException('Usuário não encontrado ou não pertence a esta empresa');
    }
    return { message: 'Usuário removido com sucesso' };
  }

  /**
   * Atualiza um usuário.
   * A lógica no service garante que você só pode atualizar usuários da sua própria empresa.
   */
  @UseGuards(AuthGuard('jwt'))
  @Put(':id') // É mais padrão usar o ID na URL para saber qual recurso atualizar
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto, @Req() req) {
    const empresaId = req.user.empresaId;
    // O id no body não é mais necessário, pois já o temos da URL
    const { id: _, ...updates } = body; 
    return this.usersService.updateById(id, updates, empresaId);
  }
}