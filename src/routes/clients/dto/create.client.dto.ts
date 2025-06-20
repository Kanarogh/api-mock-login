export class CreateClientDto {
  nome: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  latitude?: number;  // ✅ ADICIONADO
  longitude?: number; // ✅ ADICIONADO
}