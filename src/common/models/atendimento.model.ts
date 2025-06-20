export class Atendimento {
  id: number;
  usuarioId: number;
  clienteId: number;
  empresaId: number;
  status: 'em_andamento' | 'pausado' | 'finalizado';
  horaCheckin: string; // Usaremos string no formato ISO (ex: "2025-06-20T15:10:00.000Z")
  horaCheckout?: string;
  duracaoMinutos?: number;
  observacoes?: string;
  latitudeCheckin?: number;
  longitudeCheckin?: number;
}