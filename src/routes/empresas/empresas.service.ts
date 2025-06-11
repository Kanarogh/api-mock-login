import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import * as fs from 'fs';
import * as path from 'path';

const EMPRESAS_FILE = path.resolve(process.cwd(), 'src/mock/empresas.json');

@Injectable()
export class EmpresasService {
  private readEmpresas() {
    if (!fs.existsSync(EMPRESAS_FILE)) {
      this.writeEmpresas([]);
    }
    return JSON.parse(fs.readFileSync(EMPRESAS_FILE, 'utf-8') || '[]');
  }

  private writeEmpresas(data: any) {
    fs.writeFileSync(EMPRESAS_FILE, JSON.stringify(data, null, 2));
  }

  create(createEmpresaDto: CreateEmpresaDto) {
    const empresas = this.readEmpresas();
    const newId = empresas.length ? Math.max(...empresas.map(e => e.id)) + 1 : 1;
    const newEmpresa = { id: newId, ...createEmpresaDto };
    
    empresas.push(newEmpresa);
    this.writeEmpresas(empresas);
    return newEmpresa;
  }

  findAll() {
    return this.readEmpresas();
  }

  findOne(id: number) {
    const empresas = this.readEmpresas();
    const empresa = empresas.find(e => e.id === id);
    if (!empresa) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada.`);
    }
    return empresa;
  }

  update(id: number, updateEmpresaDto: UpdateEmpresaDto) {
    const empresas = this.readEmpresas();
    const index = empresas.findIndex(e => e.id === id);
    if (index === -1) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada.`);
    }
    empresas[index] = { ...empresas[index], ...updateEmpresaDto };
    this.writeEmpresas(empresas);
    return empresas[index];
  }

  remove(id: number) {
     const empresas = this.readEmpresas();
     const initialLength = empresas.length;
     const updated = empresas.filter(e => e.id !== id);
     if (initialLength === updated.length) {
         throw new NotFoundException(`Empresa com ID ${id} não encontrada.`);
     }
     this.writeEmpresas(updated);
     return { message: `Empresa com ID ${id} deletada.` };
  }
}