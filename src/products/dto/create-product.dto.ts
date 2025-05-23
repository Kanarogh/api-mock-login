export class CreateProductDto {
  nome: string;
  preco: number;
  imposto1: number;
  imposto2: number;
  custo: number;
  jaFoiComprado?: boolean;
  quantidade?: number;
}
