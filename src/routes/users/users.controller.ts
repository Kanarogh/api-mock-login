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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.usersService.deleteById(id);
    if (!deleted) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return { message: 'Usuário removido com sucesso' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put()
  async update(@Body() body: UpdateUserDto) {
    return this.usersService.updateById(body.id, body);
  }
}
