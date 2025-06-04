import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CreateEstoqueDto } from './dto/create-estoque.dto';

const ESTOQUE_FILE = path.resolve(process.cwd(), 'src/mock/estoque.json');
const PRODUCTS_FILE = path.resolve(process.cwd(), 'src/mock/products.json');

@Injectable()
export class EstoqueService {
  private readEstoque() {
    if (!fs.existsSync(ESTOQUE_FILE)) this.writeEstoque([]);
    return JSON.parse(fs.readFileSync(ESTOQUE_FILE, 'utf-8') || '[]');
  }

  private writeEstoque(data: any) {
    fs.writeFileSync(ESTOQUE_FILE, JSON.stringify(data, null, 2));
  }

  private readProducts() {
    if (!fs.existsSync(PRODUCTS_FILE)) return [];
    return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8') || '[]');
  }

  findAll() {
    const estoque = this.readEstoque();
    const produtos = this.readProducts();

    return estoque.map(item => {
      const produto = produtos.find(p => p.id === item.produtoId);
      return {
        quantidadeEstoque: item.quantidadeEstoque,
        dataReposicao: item.dataReposicao,
        estadoMaisVendido: item.estadoMaisVendido,
        estadoMenosVendido: item.estadoMenosVendido,
        imagemUrl: item.imagemUrl,
        produto: produto || null
      };
    });
  }

  findByProdutoId(produtoId: number) {
    const estoque = this.readEstoque();
    const produtos = this.readProducts();
    const item = estoque.find(e => e.produtoId === produtoId);
    if (!item) throw new NotFoundException(`Estoque do produto ${produtoId} não encontrado`);
    const produto = produtos.find(p => p.id === produtoId);
    return {
      quantidadeEstoque: item.quantidadeEstoque,
      dataReposicao: item.dataReposicao,
      estadoMaisVendido: item.estadoMaisVendido,
      estadoMenosVendido: item.estadoMenosVendido,
      imagemUrl: item.imagemUrl,
      produto: produto || null
    };
  }

  create(dto: CreateEstoqueDto) {
    const estoque = this.readEstoque();
    const exists = estoque.find(e => e.produtoId === dto.produtoId);
    if (exists) throw new BadRequestException('Estoque para este produto já existe');
    estoque.push(dto);
    this.writeEstoque(estoque);
    return dto;
  }

  update(produtoId: number, update: Partial<CreateEstoqueDto>) {
    const estoque = this.readEstoque();
    const index = estoque.findIndex(e => e.produtoId === produtoId);
    if (index === -1) throw new NotFoundException('Estoque não encontrado');
    estoque[index] = { ...estoque[index], ...update };
    this.writeEstoque(estoque);
    return estoque[index];
  }

  delete(produtoId: number) {
    const estoque = this.readEstoque();
    const updated = estoque.filter(e => e.produtoId !== produtoId);
    this.writeEstoque(updated);
    return { deleted: true };
  }
}
