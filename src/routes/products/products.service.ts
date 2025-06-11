import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import * as fs from 'fs';
import * as path from 'path';

const PRODUCTS_FILE = path.resolve(process.cwd(), 'src/mock/products.json');

@Injectable()
export class ProductsService {
  private readProducts() {
    if (!fs.existsSync(PRODUCTS_FILE)) {
      this.writeProducts([]);
    }
    return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8') || '[]');
  }

  private writeProducts(data: any) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
  }

  findAll(empresaId: number) {
    const products = this.readProducts();
    return products.filter(p => p.empresaId === empresaId);
  }
  
  // Note que não há findById no seu controller, mas se houvesse,
  // você deveria adicionar a verificação de empresaId nele também.

  create(product: CreateProductDto, empresaId: number) {
    if (!product.nome || !product.preco) {
      throw new BadRequestException('Nome e preço são obrigatórios');
    }

    const products = this.readProducts();
    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;

    const newProduct = {
      id: newId,
      empresaId: empresaId, // <-- Carimba o novo produto com o ID da empresa
      ...product,
      jaFoiComprado: false,
      quantidade: 0,
    };
    products.push(newProduct);
    this.writeProducts(products);
    return newProduct;
  }

  update(id: number, update: Partial<CreateProductDto>, empresaId: number) {
    const products = this.readProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }
    
    // Verifica se o produto pertence à empresa que está tentando editar
    if (products[index].empresaId !== empresaId) {
        throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    products[index] = { ...products[index], ...update };
    this.writeProducts(products);
    return products[index];
  }

  delete(id: number, empresaId: number) {
    const products = this.readProducts();
    const productToDelete = products.find(p => p.id === id && p.empresaId === empresaId);
    
    if (!productToDelete) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    const updated = products.filter(p => p.id !== id);
    this.writeProducts(updated);
    return { deleted: true };
  }
}