import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ClienteSemaforoDto } from './dto/cliente-semaforo.dto';

const ORDERS_FILE = path.resolve(process.cwd(), 'src/mock/orders.json');
const CLIENTS_FILE = path.resolve(process.cwd(), 'src/mock/clients.json');

@Injectable()
export class ClienteSemaforoService {
  private readOrders() {
    return fs.existsSync(ORDERS_FILE)
      ? JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'))
      : [];
  }

  private readClients() {
    return fs.existsSync(CLIENTS_FILE)
      ? JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf-8'))
      : [];
  }

  private diasEntre(date: string) {
    const hoje = new Date();
    const d = new Date(date);
    const diff = hoje.getTime() - d.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  findStatusClientes(): ClienteSemaforoDto[] {
    const pedidos = this.readOrders();
    const clientes = this.readClients();

    return clientes.map(cliente => {
      const pedidosDoCliente = pedidos
        .filter(p => p.clienteId === cliente.id)
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

      const totalPedidos = pedidosDoCliente.length;
      const ultimoPedido = pedidosDoCliente[0];
      const diasUltimoPedido = ultimoPedido ? this.diasEntre(ultimoPedido.data) : null;
      const valorUltimoPedido = ultimoPedido?.valorPedido || null;

      let status: 'verde' | 'amarelo' | 'vermelho' | 'cinza' = 'cinza';
        if (diasUltimoPedido !== null) {
        if (diasUltimoPedido <= 30) status = 'verde';
        else if (diasUltimoPedido <= 60) status = 'amarelo';
        else status = 'vermelho';
      }


      return {
        clienteId: cliente.id,
        nome: cliente.nome,
        status,
        diasUltimoPedido,
        valorUltimoPedido,
        totalPedidos
      };
    });
  }
}
