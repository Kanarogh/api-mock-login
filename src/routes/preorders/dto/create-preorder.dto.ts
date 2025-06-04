export class CreatePreorderDto {
  clienteId: number;
  produtos: {
    produtoId: number;
    quantidade: number;
    icms?: number;
  }[];
  dataEntrega?: string;
}