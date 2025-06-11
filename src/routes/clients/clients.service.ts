import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CreateClientDto } from './dto/create.client.dto';

const CLIENTS_FILE = path.resolve(process.cwd(), 'src/mock/clients.json');

@Injectable()
export class ClientsService {
  private readClients() {
    if (!fs.existsSync(CLIENTS_FILE)) {
      this.writeClients([]);
    }
    const content = fs.readFileSync(CLIENTS_FILE, 'utf-8');
    return JSON.parse(content || '[]');
  }

  private writeClients(data: any) {
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(data, null, 2));
  }

  findAll(empresaId: number) {
    const clients = this.readClients();
    return clients.filter(c => c.empresaId === empresaId);
  }

  findById(id: number, empresaId: number) {
    const clients = this.readClients();
    const client = clients.find(c => c.id === id);

    if (!client || client.empresaId !== empresaId) {
      throw new NotFoundException(`Cliente ${id} não encontrado`);
    }
    return client;
  }

  create(dto: CreateClientDto, empresaId: number) {
    if (!dto.nome || !dto.cnpj) {
      throw new BadRequestException('Nome e CNPJ são obrigatórios');
    }
    const clients = this.readClients();
    const newId = clients.length ? Math.max(...clients.map(p => p.id)) + 1 : 1;

    const newClient = { id: newId, empresaId: empresaId, ...dto };
    
    clients.push(newClient);
    this.writeClients(clients);
    return newClient;
  }

  delete(id: number, empresaId: number) {
    const clients = this.readClients();
    
    const clientToDelete = clients.find(c => c.id === id && c.empresaId === empresaId);
    if (!clientToDelete) {
      throw new NotFoundException(`Cliente ${id} não encontrado ou não pertence a esta empresa`);
    }

    const updated = clients.filter(c => c.id !== id);
    this.writeClients(updated);
    return { deleted: true };
  }
}