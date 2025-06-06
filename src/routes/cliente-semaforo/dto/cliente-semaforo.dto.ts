export class ClienteSemaforoDto {
  clienteId: number;
  nome: string;
  status: 'verde' | 'amarelo' | 'vermelho' | 'cinza';
  diasUltimoPedido: number | null;
  valorUltimoPedido: number | null;
  totalPedidos: number;
}