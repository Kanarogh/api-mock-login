import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CreatePreorderDto } from './dto/create-preorder.dto';

const PREORDERS_FILE = path.resolve(process.cwd(), 'src/mock/preorders.json');

@Injectable()
export class PreordersService {
  private readPreorders() {
    if (!fs.existsSync(PREORDERS_FILE)) this.writePreorders([]);
    return JSON.parse(fs.readFileSync(PREORDERS_FILE, 'utf-8') || '[]');
  }

  private writePreorders(data: any) {
    fs.writeFileSync(PREORDERS_FILE, JSON.stringify(data, null, 2));
  }

  findAll() {
    return this.readPreorders();
  }

  findById(id: number) {
    const preorders = this.readPreorders();
    const preorder = preorders.find(p => p.id === id);
    if (!preorder) throw new NotFoundException(`Pré-pedido ${id} não encontrado`);
    return preorder;
  }

  create(dto: CreatePreorderDto) {
    const preorders = this.readPreorders();
    const newPreorder = {
      id: Date.now(),
      ...dto,
      status: 'confirmado',
      dataCriacao: new Date().toISOString()
    };
    preorders.push(newPreorder);
    this.writePreorders(preorders);
    return newPreorder;
  }

  delete(id: number) {
    const preorders = this.readPreorders();
    const updated = preorders.filter(p => p.id !== id);
    this.writePreorders(updated);
    return { deleted: true };
  }
}