import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ClienteSemaforoDto } from './dto/cliente-semaforo.dto';

const ORDERS_FILE = path.resolve(process.cwd(), 'src/mock/orders.json');
const CLIENTS_FILE = path.resolve(process.cwd(), 'src/mock/clients.json');
const SEMAFORO_FILE = path.resolve(
  process.cwd(),
  'src/mock/clientesemaforo.json',
);

type SemaforoData = ClienteSemaforoDto & { empresaId: number };

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

  // ✅ CORREÇÃO APLICADA AQUI
  // Adicionamos o tipo de retorno ': number' para garantir que a função sempre retorne um número.
  private diasEntre(date: string): number {
    const hoje = new Date();
    const d = new Date(date);
    const diff = hoje.getTime() - d.getTime();
    // Garantimos que a palavra 'return' está aqui.
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private readSemaforoFile(): SemaforoData[] {
    if (!fs.existsSync(SEMAFORO_FILE)) {
      fs.writeFileSync(SEMAFORO_FILE, '[]');
      return [];
    }
    const fileContent = fs.readFileSync(SEMAFORO_FILE, 'utf-8');
    return fileContent ? JSON.parse(fileContent) : [];
  }

  private _calcularEsalvarDadosSemaforo(): SemaforoData[] {
    const todosOsPedidos = this.readOrders();
    const todosOsClientes = this.readClients();

    const dadosCalculados = todosOsClientes.map((cliente) => {
      const pedidosDoCliente = todosOsPedidos
        .filter(
          (p) =>
            p.clienteId === cliente.id && p.empresaId === cliente.empresaId,
        )
        .sort(
          (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
        );

      const totalPedidos = pedidosDoCliente.length;
      const ultimoPedido = pedidosDoCliente[0];
      const diasUltimoPedido = ultimoPedido
        ? this.diasEntre(ultimoPedido.data)
        : null;
      const valorUltimoPedido = ultimoPedido?.valorPedido || null;
      let status: 'verde' | 'amarelo' | 'vermelho' | 'cinza' = 'cinza';

      if (diasUltimoPedido !== null) {
        if (diasUltimoPedido <= 30) status = 'verde';
        else if (diasUltimoPedido <= 60) status = 'amarelo';
        else status = 'vermelho';
      }

      return {
        empresaId: cliente.empresaId,
        clienteId: cliente.id,
        nome: cliente.nome,
        status,
        diasUltimoPedido,
        valorUltimoPedido,
        totalPedidos,
      };
    });

    fs.writeFileSync(SEMAFORO_FILE, JSON.stringify(dadosCalculados, null, 2));
    return dadosCalculados;
  }

  findStatusClientes(empresaId: number): ClienteSemaforoDto[] {
    let todosOsStatus = this.readSemaforoFile();

    if (todosOsStatus.length === 0) {
      todosOsStatus = this._calcularEsalvarDadosSemaforo();
    }

    const statusDaEmpresa = todosOsStatus.filter(
      (s) => s.empresaId === empresaId,
    );

    return statusDaEmpresa.map((item) => {
      const { empresaId, ...dtoData } = item;
      return dtoData;
    });
  }
}