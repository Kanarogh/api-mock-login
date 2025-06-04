import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import * as fs from 'fs';
import * as path from 'path';


const PRODUCTS_FILE = path.resolve(process.cwd(), 'src/mock/products.json');



@Injectable()
export class ProductsService {
  private readProducts() {
    try {
      return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
    } catch {
      throw new BadRequestException('Erro ao ler a base de produtos');
    }
  }

  private writeProducts(data: any) {
    try {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
    } catch {
      throw new BadRequestException('Erro ao salvar os produtos');
    }
  }

  findAll() {
    return this.readProducts();
  }

  create(product: CreateProductDto) {
    if (!product.nome || !product.preco) {
      throw new BadRequestException('Nome e preço são obrigatórios');
    }

    const products = this.readProducts();
    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;

    const newProduct = {
      id: newId,
      ...product,
      jaFoiComprado: false,
      quantidade: 0,
    };
    products.push(newProduct);
    this.writeProducts(products);
    return newProduct;
  }

  update(id: number, update: Partial<CreateProductDto>) {
    const products = this.readProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    products[index] = { ...products[index], ...update };
    this.writeProducts(products);
    return products[index];
  }

  delete(id: number) {
    const products = this.readProducts();
    const exists = products.find(p => p.id === id);
    if (!exists) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    const updated = products.filter(p => p.id !== id);
    this.writeProducts(updated);
    return { deleted: true };
  }
}
