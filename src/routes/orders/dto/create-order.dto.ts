export class CreateOrderDto {
  clienteId: number;
  itens: {
    produtoId: number;
    quantidade: number;
    icms?: number;
  }[];
  dataEntrega?: string;
  formaPagamento?: string;
  vendedor?: string;
  comissao?: string;
}