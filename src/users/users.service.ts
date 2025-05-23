import { Injectable, OnModuleInit, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface User {
  id: number;
  email: string;
  nome: string;
  password: string;
}

const USERS_FILE = path.resolve(__dirname, '../../src/mock/users.json');

@Injectable()
export class UsersService implements OnModuleInit {
  private users: User[] = [];

  async onModuleInit() {
    this.loadUsers();
    if (this.users.length === 0) {
      const hash = await bcrypt.hash('123456', 10);
      const defaultUser: User = {
        id: 1,
        email: 'teste@teste.com',
        nome: 'Usuário Teste',
        password: hash,
      };
      this.users.push(defaultUser);
      this.saveUsers();
    }
  }

  private loadUsers() {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      this.users = JSON.parse(data);
    }
  }

  private saveUsers() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2), 'utf-8');
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async create(email: string, password: string, nome: string): Promise<UserDto> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new BadRequestException('E-mail já está cadastrado.');
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: this.users.length > 0 ? this.users[this.users.length - 1].id + 1 : 1,
      email,
      nome,
      password: hash,
    };

    this.users.push(newUser);
    this.saveUsers();
    return new UserDto(newUser);
  }

  async deleteById(id: number): Promise<boolean> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      throw new NotFoundException('Usuário não encontrado para exclusão.');
    }

    this.users.splice(index, 1);
    this.saveUsers();
    return true;
  }

  findAll(): UserDto[] {
    return this.users.map(({ password, ...user }) => new UserDto(user));
  }

  async findById(id: number): Promise<UserDto> {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const { password, ...safeUser } = user;
    return new UserDto(safeUser);
  }



async updateById(id: number, updates: Partial<UpdateUserDto>): Promise<UserDto>
 {
  const index = this.users.findIndex(user => user.id === id);
  if (index === -1) {
    throw new NotFoundException('Usuário não encontrado para atualização.');
  }

  const current = this.users[index];

  // Verifica se o e-mail será alterado e se já existe
  if (updates.email && updates.email !== current.email) {
    const emailExists = this.users.find(u => u.email === updates.email);
    if (emailExists) {
      throw new BadRequestException('E-mail já está em uso por outro usuário.');
    }
  }

  // Atualiza os campos, incluindo a senha se necessário
  const updatedUser = {
    ...current,
    ...updates,
    password: updates.password
      ? await bcrypt.hash(updates.password, 10)
      : current.password,
  };

  this.users[index] = updatedUser;
  this.saveUsers();

  const { password, ...safeUser } = updatedUser;
  return new UserDto(safeUser);
}

}
