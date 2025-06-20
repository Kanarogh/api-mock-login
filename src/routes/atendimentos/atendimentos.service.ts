import {
  BadRequestException,
  Injectable,
  NotFoundException,
 
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Atendimento } from 'src/common/models/atendimento.model';
import { EventoAtendimento } from 'src/common/models/evento-atendimento.model';
import { ClientsService } from '../clients/clients.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';


const ATENDIMENTOS_FILE = path.resolve(
  process.cwd(),
  'src/mock/atendimentos.json',
);
const EVENTOS_FILE = path.resolve(
  process.cwd(),
  'src/mock/eventos_atendimento.json',
);

@Injectable()
export class AtendimentosService {
  constructor(private readonly clientsService: ClientsService) {}

  // Métodos privados para ler e escrever nos arquivos JSON
  private readAtendimentos(): Atendimento[] {
    if (!fs.existsSync(ATENDIMENTOS_FILE)) {
      this.writeAtendimentos([]);
      return [];
    }
    return JSON.parse(fs.readFileSync(ATENDIMENTOS_FILE, 'utf-8'));
  }

  private writeAtendimentos(data: Atendimento[]) {
    fs.writeFileSync(ATENDIMENTOS_FILE, JSON.stringify(data, null, 2));
  }

  private readEventos(): EventoAtendimento[] {
    if (!fs.existsSync(EVENTOS_FILE)) {
      this.writeEventos([]);
      return [];
    }
    return JSON.parse(fs.readFileSync(EVENTOS_FILE, 'utf-8'));
  }

  private writeEventos(data: EventoAtendimento[]) {
    fs.writeFileSync(EVENTOS_FILE, JSON.stringify(data, null, 2));
  }

  // --- MÉTODOS PÚBLICOS DA API ---

  /**
   * ✅ Inicia um novo atendimento (Check-in).
   * Valida se o cliente pertence à empresa e se não há outro atendimento ativo.
   */
  async checkin(
    dto: CreateCheckinDto,
    usuarioId: number,
    empresaId: number,
  ): Promise<Atendimento> {
    // 1. Valida se o cliente existe e pertence à empresa do usuário
    await this.clientsService.findById(dto.clienteId, empresaId);

    const atendimentos = this.readAtendimentos();

    // 2. Valida se já existe um atendimento em aberto para este usuário
    const atendimentoAberto = atendimentos.find(
      (att) => att.usuarioId === usuarioId && att.status !== 'finalizado',
    );

    if (atendimentoAberto) {
      throw new BadRequestException(
        'Já existe um atendimento em andamento para este usuário.',
      );
    }

    const newId = atendimentos.length
      ? Math.max(...atendimentos.map((a) => a.id)) + 1
      : 1;
    const now = new Date().toISOString();

    const novoAtendimento: Atendimento = {
      id: newId,
      usuarioId,
      clienteId: dto.clienteId,
      empresaId,
      status: 'em_andamento',
      horaCheckin: now,
      latitudeCheckin: dto.latitude,
      longitudeCheckin: dto.longitude,
    };

    atendimentos.push(novoAtendimento);
    this.writeAtendimentos(atendimentos);

    // 3. Cria o primeiro evento de log
    const eventos = this.readEventos();
    const newEventId = eventos.length
      ? Math.max(...eventos.map((e) => e.id)) + 1
      : 1;
    const novoEvento: EventoAtendimento = {
      id: newEventId,
      atendimentoId: newId,
      tipo: 'check-in',
      timestamp: now,
    };
    eventos.push(novoEvento);
    this.writeEventos(eventos);

    return novoAtendimento;
  }

  /**
   * 🚧 Pausa um atendimento em andamento.
   * (A ser implementado)
   */
  async pausar(atendimentoId: number, usuarioId: number): Promise<Atendimento> {
    const atendimentos = this.readAtendimentos();

    // 1. Encontra o atendimento específico que pertence ao usuário logado
    const atendimentoIndex = atendimentos.findIndex(
      (att) => att.id === atendimentoId && att.usuarioId === usuarioId,
    );

    if (atendimentoIndex === -1) {
      throw new NotFoundException(
        'Atendimento não encontrado ou não pertence a este usuário.',
      );
    }

    // 2. Valida se o atendimento pode ser pausado
    const atendimento = atendimentos[atendimentoIndex];
    if (atendimento.status !== 'em_andamento') {
      throw new BadRequestException(
        `Este atendimento não pode ser pausado, pois seu status atual é '${atendimento.status}'.`,
      );
    }

    // 3. Atualiza o status do atendimento para 'pausado'
    atendimento.status = 'pausado';
    atendimentos[atendimentoIndex] = atendimento;
    this.writeAtendimentos(atendimentos);

    // 4. Registra o evento de 'pausa'
    const eventos = this.readEventos();
    const newEventId = eventos.length ? Math.max(...eventos.map((e) => e.id)) + 1 : 1;
    eventos.push({
      id: newEventId,
      atendimentoId: atendimentoId,
      tipo: 'pausa',
      timestamp: new Date().toISOString(),
    });
    this.writeEventos(eventos);

    return atendimento;
  }

  /**
   * 🚧 Retoma um atendimento pausado.
   * (A ser implementado)
   */
 async retomar(atendimentoId: number, usuarioId: number): Promise<Atendimento> {
    const atendimentos = this.readAtendimentos();

    // 1. Encontra o atendimento específico que pertence ao usuário logado
    const atendimentoIndex = atendimentos.findIndex(
      (att) => att.id === atendimentoId && att.usuarioId === usuarioId,
    );

    if (atendimentoIndex === -1) {
      throw new NotFoundException(
        'Atendimento não encontrado ou não pertence a este usuário.',
      );
    }

    // 2. Valida se o atendimento pode ser retomado
    const atendimento = atendimentos[atendimentoIndex];
    if (atendimento.status !== 'pausado') {
      throw new BadRequestException(
        `Este atendimento não pode ser retomado, pois seu status atual é '${atendimento.status}'.`,
      );
    }

    // 3. Atualiza o status do atendimento para 'em_andamento'
    atendimento.status = 'em_andamento';
    atendimentos[atendimentoIndex] = atendimento;
    this.writeAtendimentos(atendimentos);

    // 4. Registra o evento de 'retomada'
    const eventos = this.readEventos();
    const newEventId = eventos.length ? Math.max(...eventos.map((e) => e.id)) + 1 : 1;
    eventos.push({
      id: newEventId,
      atendimentoId: atendimentoId,
      tipo: 'retomada',
      timestamp: new Date().toISOString(),
    });
    this.writeEventos(eventos);

    return atendimento;
  }
  /**
   * 🚧 Finaliza um atendimento (Checkout).
   * (A ser implementado)
   */
 async checkout(
    dto: CreateCheckoutDto,
    atendimentoId: number,
    usuarioId: number,
  ): Promise<Atendimento> {
    const atendimentos = this.readAtendimentos();

    // 1. Encontra o atendimento específico que pertence ao usuário
    const atendimentoIndex = atendimentos.findIndex(
      (att) => att.id === atendimentoId && att.usuarioId === usuarioId,
    );

    if (atendimentoIndex === -1) {
      throw new NotFoundException(
        'Atendimento não encontrado ou não pertence a este usuário.',
      );
    }

    const atendimento = atendimentos[atendimentoIndex];

    // 2. Valida se o atendimento pode ser finalizado
    if (atendimento.status === 'finalizado') {
      throw new BadRequestException('Este atendimento já foi finalizado.');
    }

    const now = new Date();
    const eventos = this.readEventos();
    
    // 3. Adiciona o evento final de 'check-out' para o cálculo
    const newEventId = eventos.length ? Math.max(...eventos.map((e) => e.id)) + 1 : 1;
    eventos.push({
      id: newEventId,
      atendimentoId: atendimentoId,
      tipo: 'check-out',
      timestamp: now.toISOString(),
    });
    this.writeEventos(eventos);

    // 4. Lógica para calcular a duração total em minutos
    const eventosDoAtendimento = eventos
      .filter((e) => e.atendimentoId === atendimentoId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let duracaoTotalMs = 0;
    let ultimoInicio: Date | null = null;

    for (const evento of eventosDoAtendimento) {
      if (evento.tipo === 'check-in' || evento.tipo === 'retomada') {
        ultimoInicio = new Date(evento.timestamp);
      } else if ((evento.tipo === 'pausa' || evento.tipo === 'check-out') && ultimoInicio) {
        const diff = new Date(evento.timestamp).getTime() - ultimoInicio.getTime();
        duracaoTotalMs += diff;
        ultimoInicio = null; // Reseta o início após calcular um período
      }
    }

    const duracaoEmMinutos = duracaoTotalMs / (1000 * 60);


    atendimento.status = 'finalizado';
    atendimento.horaCheckout = now.toISOString();
    atendimento.observacoes = dto.observacoes;
atendimento.duracaoMinutos = Number(duracaoEmMinutos.toFixed(2));
    atendimentos[atendimentoIndex] = atendimento;
    this.writeAtendimentos(atendimentos);

    return atendimento;
  }

  /**
   * 🚧 Busca o atendimento atual (em andamento ou pausado) do usuário.
   * (A ser implementado)
   */
   async getStatusAtual(usuarioId: number): Promise<Atendimento | null> {
    const atendimentos = this.readAtendimentos();

    // Encontra o último atendimento do usuário que NÃO esteja finalizado
    const atendimentoAberto = atendimentos.find(
      (att) => att.usuarioId === usuarioId && att.status !== 'finalizado',
    );

    // Retorna o atendimento encontrado ou null se não houver nenhum
    return atendimentoAberto || null;
  }
 
  /**
   * ✅ Busca o histórico de atendimentos finalizados do usuário, com paginação.
   */
async getHistorico(
    usuarioId: number,
    page: number,
    limit: number,
  ): Promise<{ data: Atendimento[]; total: number; page: number; totalPages: number }> {
    const atendimentos = this.readAtendimentos();

    const historicoDoUsuario = atendimentos.filter(
      (att) => att.usuarioId === usuarioId && att.status === 'finalizado',
    );

    // ✅ CORREÇÃO APLICADA AQUI DENTRO DO SORT
    const historicoOrdenado = historicoDoUsuario.sort((a, b) => {
      // Verificamos se horaCheckout existe. Se não, usamos 0 como fallback para o sort.
      const timeB = b.horaCheckout ? new Date(b.horaCheckout).getTime() : 0;
      const timeA = a.horaCheckout ? new Date(a.horaCheckout).getTime() : 0;
      
      // Ordena do mais recente (maior tempo) para o mais antigo (menor tempo)
      return timeB - timeA;
    });

    const total = historicoOrdenado.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = historicoOrdenado.slice(startIndex, endIndex);

    return {
      data,
      total,
      page,
      totalPages,
    };
  }

  async getEventosDoDia(
    usuarioId: number,
  ): Promise<{ clienteNome: string; tipo: string; timestamp: string }[]> {
    // 1. Lê todos os dados necessários
    const todosAtendimentos = this.readAtendimentos();
    const todosEventos = this.readEventos();
    // Reutiliza o serviço de clientes para não ler o arquivo de novo
    const todosClientes = await this.clientsService.findAllWithAllData(); 
    // ^ Assumindo que criaremos um método auxiliar em ClientsService para buscar todos os clientes

    // 2. Filtra para encontrar todos os atendimentos do usuário logado
    const atendimentosDoUsuario = todosAtendimentos.filter(
      (att) => att.usuarioId === usuarioId,
    );
    // Cria um Set com os IDs para uma busca mais rápida
    const idsAtendimentosDoUsuario = new Set(atendimentosDoUsuario.map((att) => att.id));

    // 3. Define o intervalo de hoje (do início ao fim do dia)
    const hoje = new Date();
    const inicioDoDia = new Date(hoje.setHours(0, 0, 0, 0));
    const fimDoDia = new Date(hoje.setHours(23, 59, 59, 999));

    // 4. Filtra e enriquece os eventos
    const eventosDeHoje = todosEventos
      .filter((evento) => {
        // Filtra para pegar apenas eventos dos atendimentos do nosso usuário
        if (!idsAtendimentosDoUsuario.has(evento.atendimentoId)) {
          return false;
        }
        // Filtra para pegar apenas os eventos de hoje
        const dataEvento = new Date(evento.timestamp);
        return dataEvento >= inicioDoDia && dataEvento <= fimDoDia;
      })
      .map((evento) => {
        // Para cada evento, encontra o atendimento correspondente para pegar o clienteId
        const atendimentoAssociado = atendimentosDoUsuario.find(
          (att) => att.id === evento.atendimentoId,
        );
        // E então encontra o nome do cliente
        const clienteAssociado = todosClientes.find(
          (c) => c.id === atendimentoAssociado?.clienteId,
        );

        return {
          clienteNome: clienteAssociado?.nome ?? 'Cliente não encontrado',
          tipo: evento.tipo,
          timestamp: evento.timestamp,
        };
      });

    // 5. Ordena os eventos do mais recente para o mais antigo
    const eventosOrdenados = eventosDeHoje.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return eventosOrdenados;
  }

  
}