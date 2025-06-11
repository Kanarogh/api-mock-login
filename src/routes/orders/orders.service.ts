import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { EstoqueService } from '../estoque/estoque.service';
import * as fs from 'fs';
import * as path from 'path';

const PRODUCTS_FILE = path.resolve(process.cwd(), 'src/mock/products.json');
const CLIENTS_FILE = path.resolve(process.cwd(), 'src/mock/clients.json');
const ORDERS_FILE = path.resolve(process.cwd(), 'src/mock/orders.json');
const PREORDERS_FILE = path.resolve(process.cwd(), 'src/mock/preorders.json');

@Injectable()
export class OrdersService {
  constructor(private readonly estoqueService: EstoqueService) {}

  private readFile(file: string) {
    if (!fs.existsSync(file)) this.writeFile(file, []);
    return JSON.parse(fs.readFileSync(file, 'utf-8') || '[]');
  }

  private writeFile(file: string, data: any) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }

  async create(dto: CreateOrderDto, empresaId: number, vendedorId: number) {
    const clients = this.readFile(CLIENTS_FILE);
    const products = this.readFile(PRODUCTS_FILE);

    const client = clients.find(c => c.id === dto.clienteId && c.empresaId === empresaId);
    if (!client) throw new BadRequestException('Cliente não encontrado ou não pertence a esta empresa');

    let total = 0;
    const itensDetalhados = dto.itens.map(item => {
      const produto = products.find(p => p.id === item.produtoId && p.empresaId === empresaId);
      if (!produto) throw new BadRequestException(`Produto ${item.produtoId} inválido ou não pertence a esta empresa`);
      const subtotal = produto.preco * item.quantidade;
      total += subtotal;
      return { ...item, nome: produto.nome, preco: produto.preco, subtotal, precoFinal: subtotal };
    });

    await this.estoqueService.darBaixaEstoque(dto.itens, empresaId);

    const orders = this.readFile(ORDERS_FILE);
    const newOrder = {
      id: Date.now(),
      empresaId: empresaId,
      vendedorId: vendedorId, // <-- MELHORIA: Salvando o ID do vendedor
      clienteId: dto.clienteId,
      clienteNome: client.nome,
      status: 'pendente',
      data: new Date().toISOString(),
      dataEntrega: dto.dataEntrega || null,
      formaPagamento: dto.formaPagamento || null,
      vendedor: dto.vendedor || null,
      comissao: dto.comissao || null,
      valorPedido: total,
      total,
      itens: itensDetalhados,
    };

    orders.push(newOrder);
    this.writeFile(ORDERS_FILE, orders);
    return newOrder;
  }

  async createFromPreorder(preorderId: number, dto: { formaPagamento: string; comissao: string; vendedor: string }, empresaId: number, vendedorId: number) {
    const preorders = this.readFile(PREORDERS_FILE);
    const clients = this.readFile(CLIENTS_FILE);
    const products = this.readFile(PRODUCTS_FILE);

    const preorder = preorders.find(p => p.id === preorderId && p.empresaId === empresaId);
    if (!preorder) throw new NotFoundException('Pré-pedido não encontrado ou não pertence a esta empresa');

    const client = clients.find(c => c.id === preorder.clienteId && c.empresaId === empresaId);
    if (!client) throw new NotFoundException('Cliente do pré-pedido não encontrado');

    let total = 0;
    const itensDetalhados = preorder.produtos.map(item => {
      const produto = products.find(p => p.id === item.produtoId && p.empresaId === empresaId);
      if (!produto) throw new BadRequestException(`Produto ${item.produtoId} inválido`);
      const subtotal = produto.preco * item.quantidade;
      total += subtotal;
      return { ...item, nome: produto.nome, preco: produto.preco, subtotal, precoFinal: subtotal };
    });
    
    await this.estoqueService.darBaixaEstoque(preorder.produtos, empresaId);

    const orders = this.readFile(ORDERS_FILE);
    const newOrder = {
      id: Date.now(),
      empresaId: empresaId,
      vendedorId: vendedorId, // <-- MELHORIA: Salvando o ID do vendedor
      clienteId: preorder.clienteId,
      clienteNome: client.nome,
      status: 'pendente',
      data: new Date().toISOString(),
      dataEntrega: preorder.dataEntrega || null,
      formaPagamento: dto.formaPagamento,
      vendedor: dto.vendedor,
      comissao: dto.comissao,
      valorPedido: total,
      total,
      itens: itensDetalhados,
    };

    orders.push(newOrder);
    this.writeFile(ORDERS_FILE, orders);
    return newOrder;
  }

  findAll(empresaId: number) {
    const orders = this.readFile(ORDERS_FILE);
    return orders.filter(o => o.empresaId === empresaId);
  }

  findById(id: number, empresaId: number) {
    const orders = this.readFile(ORDERS_FILE);
    const order = orders.find(o => o.id === id);
    if (!order || order.empresaId !== empresaId) {
      throw new NotFoundException(`Pedido ${id} não encontrado`);
    }
    return order;
  }

  update(id: number, update: Partial<{ status: string; dataEntrega: string }>, empresaId: number) {
    const orders = this.readFile(ORDERS_FILE);
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new NotFoundException(`Pedido ${id} não encontrado`);
    if (orders[index].empresaId !== empresaId) {
      throw new ForbiddenException('Você não tem permissão para alterar este pedido.');
    }
    orders[index] = { ...orders[index], ...update };
    this.writeFile(ORDERS_FILE, orders);
    return orders[index];
  }

  delete(id: number, empresaId: number) {
    const orders = this.readFile(ORDERS_FILE);
    const orderToDelete = orders.find(o => o.id === id && o.empresaId === empresaId);
    if (!orderToDelete) {
      throw new NotFoundException(`Pedido ${id} não encontrado ou não pertence a esta empresa`);
    }
    const updated = orders.filter(o => o.id !== id);
    this.writeFile(ORDERS_FILE, updated);
    return { message: `Pedido ${id} deletado com sucesso.`, deleted: true };
  }
}