export class EventoAtendimento {
  id: number;
  atendimentoId: number;
  tipo: 'check-in' | 'pausa' | 'retomada' | 'check-out';
  timestamp: string; // Data e hora no formato ISO
}