import { Injectable, OnModuleInit, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
// Importar o DTO de criação

// A interface agora inclui o campo empresaId
export interface User {
  id: number;
  empresaId: number;
  email: string;
  nome: string;
  password: string;
  refreshToken?: string | null; // ✅ ADICIONE ESTA LINHA
}

const USERS_FILE = path.resolve(process.cwd(), 'src/mock/users.json');

@Injectable()
export class UsersService implements OnModuleInit {
  private users: User[] = [];

  onModuleInit() {
    this.loadUsers();
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

  // O método `create` agora usa um DTO e associa o usuário a uma empresa
  async create(dto: CreateUserDto): Promise<UserDto> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('E-mail já está cadastrado.');
    }

    const hash = await bcrypt.hash(dto.password, 10);
    const newUser: User = {
      id: this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1,
      email: dto.email,
      nome: dto.nome,
      empresaId: dto.empresaId, // <-- Associa à empresa
      password: hash,
    };

    this.users.push(newUser);
    this.saveUsers();

    const { password, ...safeUser } = newUser;
    return new UserDto(safeUser);
  }

  // Em src/routes/users/users.service.ts

  // ... (depois do findByEmail)

  async findById(id: number, empresaId: number): Promise<User | undefined> {
    // Procura por um usuário que tenha o ID E a empresaId correspondentes.
    const user = this.users.find(u => u.id === id && u.empresaId === empresaId);
    return user;
  }

  // ...
  // O método delete agora verifica se o usuário a ser deletado pertence à mesma empresa
  async deleteById(id: number, empresaId: number): Promise<boolean> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (this.users[index].empresaId !== empresaId) {
      throw new ForbiddenException('Ação não permitida.');
    }

    this.users.splice(index, 1);
    this.saveUsers();
    return true;
  }

  // Novo método para listar apenas usuários da mesma empresa
  findAllByCompany(empresaId: number): UserDto[] {
    const companyUsers = this.users.filter(user => user.empresaId === empresaId);
    return companyUsers.map(({ password, ...user }) => new UserDto(user));
  }

  // O método update agora também verifica a permissão por empresa
  async updateById(id: number, updates: Partial<UpdateUserDto>, empresaId: number): Promise<UserDto> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const current = this.users[index];
    if (current.empresaId !== empresaId) {
      throw new ForbiddenException('Ação não permitida.');
    }

    if (updates.email && updates.email !== current.email) {
      const emailExists = this.users.find(u => u.email === updates.email);
      if (emailExists) {
        throw new BadRequestException('E-mail já está em uso.');
      }
    }

    const updatedUser: User = {
      ...current,
      ...updates,
      password: updates.password ? await bcrypt.hash(updates.password, 10) : current.password,
    };

    this.users[index] = updatedUser;
    this.saveUsers();

    const { password, ...safeUser } = updatedUser;
    return new UserDto(safeUser);
  }

  // findById e findAll foram combinados/substituídos pela nova lógica 
}
