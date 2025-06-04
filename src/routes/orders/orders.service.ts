import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CreateOrderDto } from './dto/create-order.dto';

const PRODUCTS_FILE = path.resolve(process.cwd(), 'src/mock/products.json');
const CLIENTS_FILE = path.resolve(process.cwd(), 'src/mock/clients.json');
const ORDERS_FILE = path.resolve(process.cwd(), 'src/mock/orders.json');
const PREORDERS_FILE = path.resolve(process.cwd(), 'src/mock/preorders.json');
@Injectable()
export class OrdersService {
  private readFile(file: string) {
    if (!fs.existsSync(file)) this.writeFile(file, []);
    return JSON.parse(fs.readFileSync(file, 'utf-8') || '[]');
  }

  private writeFile(file: string, data: any) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }

  findAll() {
    return this.readFile(ORDERS_FILE);
  }

  findById(id: number) {
    const orders = this.readFile(ORDERS_FILE);
    const order = orders.find(o => o.id === id);
    if (!order) throw new NotFoundException(`Pedido ${id} não encontrado`);
    return order;
  }

  create(dto: CreateOrderDto) {
    const clients = this.readFile(CLIENTS_FILE);
    const products = this.readFile(PRODUCTS_FILE);

    const client = clients.find(c => c.id === dto.clienteId);
    if (!client) throw new BadRequestException('Cliente não encontrado');

    let total = 0;
    const itensDetalhados = dto.itens.map(item => {
      const produto = products.find(p => p.id === item.produtoId);
      if (!produto) throw new BadRequestException(`Produto ${item.produtoId} inválido`);

      const subtotal = produto.preco * item.quantidade;
      total += subtotal;

      return {
        ...item,
        nome: produto.nome,
        preco: produto.preco,
        subtotal,
        precoFinal: subtotal
      };
    });

    const orders = this.readFile(ORDERS_FILE);
    const newOrder = {
      id: Date.now(),
      clienteId: dto.clienteId,
      clienteNome: client.nome,
      status: 'finalizado',
      data: new Date().toISOString(),
      dataEntrega: dto.dataEntrega || new Date().toISOString().split('T')[0],
      formaPagamento: dto.formaPagamento || null,
      vendedor: dto.vendedor || null,
      comissao: dto.comissao || null,
      valorPedido: total,
      total,
      itens: itensDetalhados
    };

    orders.push(newOrder);
    this.writeFile(ORDERS_FILE, orders);

    return newOrder;
  }

  createFromPreorder(preorderId: number, dto: { formaPagamento: string; comissao: string; vendedor: string }) {
    const preorders = this.readFile(PREORDERS_FILE);
    const clients = this.readFile(CLIENTS_FILE);
    const products = this.readFile(PRODUCTS_FILE);

    const preorder = preorders.find(p => p.id === preorderId);
    if (!preorder) throw new NotFoundException('Pré-pedido não encontrado');

    const client = clients.find(c => c.id === preorder.clienteId);
    if (!client) throw new NotFoundException('Cliente não encontrado');

    let total = 0;
    const itensDetalhados = preorder.produtos.map(item => {
      const produto = products.find(p => p.id === item.produtoId);
      if (!produto) throw new BadRequestException(`Produto ${item.produtoId} inválido`);

      const subtotal = produto.preco * item.quantidade;
      total += subtotal;

      return {
        ...item,
        nome: produto.nome,
        preco: produto.preco,
        subtotal,
        precoFinal: subtotal
      };
    });

    const orders = this.readFile(ORDERS_FILE);
    const newOrder = {
      id: Date.now(),
      clienteId: preorder.clienteId,
      clienteNome: client.nome,
      status: 'finalizado',
      data: new Date().toISOString(),
      dataEntrega: preorder.dataEntrega || new Date().toISOString().split('T')[0],
      formaPagamento: dto.formaPagamento,
      vendedor: dto.vendedor,
      comissao: dto.comissao,
      valorPedido: total,
      total,
      itens: itensDetalhados
    };

    orders.push(newOrder);
    this.writeFile(ORDERS_FILE, orders);
    return newOrder;
  }

  delete(id: number) {
    const orders = this.readFile(ORDERS_FILE);
    const exists = orders.find(o => o.id === id);
    if (!exists) throw new NotFoundException(`Pedido ${id} não encontrado`);

    const updated = orders.filter(o => o.id !== id);
    this.writeFile(ORDERS_FILE, updated);
    return { deleted: true };
  }

  update(id: number, update: Partial<{ status: string; dataEntrega: string }>) {
    const orders = this.readFile(ORDERS_FILE);
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new NotFoundException(`Pedido ${id} não encontrado`);

    orders[index] = {
      ...orders[index],
      ...update,
    };

    this.writeFile(ORDERS_FILE, orders);
    return orders[index];
  }
}