// src/common/models/client.model.ts

export class Client {
  id: number;
  empresaId: number;
  nome: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  latitude?: number;
  longitude?: number;
}