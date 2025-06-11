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

  findAll(empresaId: number) {
    const estoque = this.readEstoque().filter(item => item.empresaId === empresaId);
    const produtos = this.readProducts();
    
    return estoque.map(itemEstoque => {
      const produto = produtos.find(p => p.id === itemEstoque.produtoId && p.empresaId === empresaId);
      
      // Monta o objeto de resposta exatamente como você sugeriu
      return {
        empresaId: itemEstoque.empresaId, // <-- Mantido no nível principal
        quantidadeEstoque: itemEstoque.quantidadeEstoque,
        dataReposicao: itemEstoque.dataReposicao,
        estadoMaisVendido: itemEstoque.estadoMaisVendido,
        estadoMenosVendido: itemEstoque.estadoMenosVendido,
        produto: produto || { id: itemEstoque.produtoId, nome: 'Produto não encontrado ou de outra empresa' }
      };
    });
  }

  findByProdutoId(produtoId: number, empresaId: number) {
    const estoque = this.readEstoque();
    const itemEstoque = estoque.find(e => e.produtoId === produtoId && e.empresaId === empresaId);
    if (!itemEstoque) throw new NotFoundException(`Estoque do produto ${produtoId} não encontrado para esta empresa`);
    
    const produtos = this.readProducts();
    const produto = produtos.find(p => p.id === produtoId && p.empresaId === empresaId);

    // Ajustado aqui também
    return {
        empresaId: itemEstoque.empresaId, // <-- Mantido no nível principal
        quantidadeEstoque: itemEstoque.quantidadeEstoque,
        dataReposicao: itemEstoque.dataReposicao,
        estadoMaisVendido: itemEstoque.estadoMaisVendido,
        estadoMenosVendido: itemEstoque.estadoMenosVendido,
        produto: produto || null
    };
  }

  // O resto dos métodos (create, update, delete, darBaixaEstoque) continuam iguais
  // e não precisam de alteração.

  create(dto: CreateEstoqueDto, empresaId: number) {
    const estoque = this.readEstoque();
    const exists = estoque.find(e => e.produtoId === dto.produtoId && e.empresaId === empresaId);
    if (exists) throw new BadRequestException('Estoque para este produto já existe nesta empresa');
    
    const novoEstoque = { empresaId: empresaId, ...dto };
    estoque.push(novoEstoque);
    this.writeEstoque(estoque);
    return novoEstoque;
  }

  update(produtoId: number, update: Partial<CreateEstoqueDto>, empresaId: number) {
    const estoque = this.readEstoque();
    const index = estoque.findIndex(e => e.produtoId === produtoId && e.empresaId === empresaId);
    if (index === -1) throw new NotFoundException('Estoque não encontrado para esta empresa');
    
    estoque[index] = { ...estoque[index], ...update };
    this.writeEstoque(estoque);
    return estoque[index];
  }

  delete(produtoId: number, empresaId: number) {
    const estoque = this.readEstoque();
    const initialLength = estoque.length;
    const updated = estoque.filter(e => !(e.produtoId === produtoId && e.empresaId === empresaId));
    if (initialLength === updated.length) throw new NotFoundException('Estoque não encontrado para esta empresa');
    
    this.writeEstoque(updated);
    return { deleted: true };
  }

  darBaixaEstoque(items: { produtoId: number; quantidade: number }[], empresaId: number) {
    const estoque = this.readEstoque();
    for (const item of items) {
      const index = estoque.findIndex(e => e.produtoId === item.produtoId && e.empresaId === empresaId);
      if (index === -1) {
        throw new BadRequestException(`Produto ${item.produtoId} não possui registro de estoque para esta empresa.`);
      }
      
      const estoqueAtual = estoque[index].quantidadeEstoque;
      if (estoqueAtual < item.quantidade) {
        throw new BadRequestException(`Estoque insuficiente para o produto ${item.produtoId}. Em estoque: ${estoqueAtual}, Pedido: ${item.quantidade}`);
      }
      
      estoque[index].quantidadeEstoque -= item.quantidade;
    }
    this.writeEstoque(estoque);
  }
}