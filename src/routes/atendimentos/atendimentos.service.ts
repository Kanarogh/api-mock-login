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

  private readAtendimentos(): Atendimento[] {
    if (!fs.existsSync(ATENDIMENTOS_FILE)) {
      this.writeAtendimentos([]);
      return [];
    }
    const content = fs.readFileSync(ATENDIMENTOS_FILE, 'utf-8');
    return JSON.parse(content || '[]');
  }

  private writeAtendimentos(data: Atendimento[]) {
    fs.writeFileSync(ATENDIMENTOS_FILE, JSON.stringify(data, null, 2));
  }

  private readEventos(): EventoAtendimento[] {
    if (!fs.existsSync(EVENTOS_FILE)) {
      this.writeEventos([]);
      return [];
    }
    const content = fs.readFileSync(EVENTOS_FILE, 'utf-8');
    return JSON.parse(content || '[]');
  }

  private writeEventos(data: EventoAtendimento[]) {
    fs.writeFileSync(EVENTOS_FILE, JSON.stringify(data, null, 2));
  }

  async checkin(
    dto: CreateCheckinDto,
    usuarioId: number,
    empresaId: number,
  ): Promise<any> {
    const cliente = await this.clientsService.findById(dto.clienteId, empresaId);
    const atendimentos = this.readAtendimentos();

    const atendimentoAberto = atendimentos.find(
      (att) => att.usuarioId === usuarioId && att.status !== 'finalizado',
    );
    if (atendimentoAberto) {
      throw new BadRequestException('Já existe um atendimento em andamento para este usuário.');
    }

    const newId = atendimentos.length ? Math.max(...atendimentos.map((a) => a.id)) + 1 : 1;
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

    const eventos = this.readEventos();
    const newEventId = eventos.length ? Math.max(...eventos.map((e) => e.id)) + 1 : 1;
    eventos.push({
      id: newEventId,
      atendimentoId: newId,
      tipo: 'check-in',
      timestamp: now,
    });
    this.writeEventos(eventos);

    // O check-in já usa 'horaCheckin', que é o que precisamos.
    // Não precisa de mudança aqui, pois o Flutter já sabe como tratar.
    return { ...novoAtendimento, clienteNome: cliente.nome };
  }

  async pausar(atendimentoId: number, usuarioId: number): Promise<any> {
    const atendimentos = this.readAtendimentos();
    const atendimentoIndex = atendimentos.findIndex((att) => att.id === atendimentoId && att.usuarioId === usuarioId);
    if (atendimentoIndex === -1) {
      throw new NotFoundException('Atendimento não encontrado ou não pertence a este usuário.');
    }

    const atendimento = atendimentos[atendimentoIndex];
    if (atendimento.status !== 'em_andamento') {
      throw new BadRequestException(`Este atendimento não pode ser pausado, pois seu status atual é '${atendimento.status}'.`);
    }

    atendimento.status = 'pausado';
    atendimentos[atendimentoIndex] = atendimento;
    this.writeAtendimentos(atendimentos);

    const eventos = this.readEventos();
    const newEventId = eventos.length ? Math.max(...eventos.map((e) => e.id)) + 1 : 1;
    const timestampPausa = new Date().toISOString();
    eventos.push({
      id: newEventId,
      atendimentoId: atendimentoId,
      tipo: 'pausa',
      timestamp: timestampPausa,
    });
    this.writeEventos(eventos);

    const cliente = await this.clientsService.findById(atendimento.clienteId, atendimento.empresaId);
    
    // ✅ AQUI: Retornamos o timestamp exato da pausa para o Flutter
    return { ...atendimento, clienteNome: cliente.nome, timestamp: timestampPausa };
  }

  async retomar(atendimentoId: number, usuarioId: number): Promise<any> {
    const atendimentos = this.readAtendimentos();
    const atendimentoIndex = atendimentos.findIndex((att) => att.id === atendimentoId && att.usuarioId === usuarioId);
    if (atendimentoIndex === -1) {
      throw new NotFoundException('Atendimento não encontrado ou não pertence a este usuário.');
    }

    const atendimento = atendimentos[atendimentoIndex];
    if (atendimento.status !== 'pausado') {
      throw new BadRequestException(`Este atendimento não pode ser retomado, pois seu status atual é '${atendimento.status}'.`);
    }

    atendimento.status = 'em_andamento';
    atendimentos[atendimentoIndex] = atendimento;
    this.writeAtendimentos(atendimentos);

    const eventos = this.readEventos();
    const newEventId = eventos.length ? Math.max(...eventos.map((e) => e.id)) + 1 : 1;
    const timestampRetomada = new Date().toISOString();
    eventos.push({
      id: newEventId,
      atendimentoId: atendimentoId,
      tipo: 'retomada',
      timestamp: timestampRetomada,
    });
    this.writeEventos(eventos);

    const cliente = await this.clientsService.findById(atendimento.clienteId, atendimento.empresaId);
    
    // ✅ AQUI: Retornamos o timestamp exato da retomada para o Flutter
    return { ...atendimento, clienteNome: cliente.nome, timestamp: timestampRetomada };
  }

  async checkout(dto: CreateCheckoutDto, atendimentoId: number, usuarioId: number): Promise<any> {
    const atendimentos = this.readAtendimentos();
    const atendimentoIndex = atendimentos.findIndex((att) => att.id === atendimentoId && att.usuarioId === usuarioId);
    if (atendimentoIndex === -1) {
      throw new NotFoundException('Atendimento não encontrado ou não pertence a este usuário.');
    }

    const atendimento = atendimentos[atendimentoIndex];
    if (atendimento.status === 'finalizado') {
      throw new BadRequestException('Este atendimento já foi finalizado.');
    }

    const now = new Date();
    const eventos = this.readEventos();

    const newEventId = eventos.length ? Math.max(...eventos.map((e) => e.id)) + 1 : 1;
    eventos.push({
      id: newEventId,
      atendimentoId: atendimentoId,
      tipo: 'check-out',
      timestamp: now.toISOString(),
    });
    this.writeEventos(eventos);

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
        ultimoInicio = null;
      }
    }

    const duracaoEmMinutos = duracaoTotalMs / (1000 * 60);
    atendimento.status = 'finalizado';
    atendimento.horaCheckout = now.toISOString();
    atendimento.observacoes = dto.observacoes;
    atendimento.duracaoMinutos = Number(duracaoEmMinutos.toFixed(2));
    atendimentos[atendimentoIndex] = atendimento;
    this.writeAtendimentos(atendimentos);

    const cliente = await this.clientsService.findById(atendimento.clienteId, atendimento.empresaId);
    // O checkout já retorna 'horaCheckout', que o Flutter usará.
    return { ...atendimento, clienteNome: cliente.nome };
  }

  async getStatusAtual(usuarioId: number): Promise<any | null> {
    const atendimentos = this.readAtendimentos();
    const atendimentoAberto = atendimentos.find((att) => att.usuarioId === usuarioId && att.status !== 'finalizado');
    if (!atendimentoAberto) {
      return null;
    }

    const cliente = await this.clientsService.findById(atendimentoAberto.clienteId, atendimentoAberto.empresaId);
    return { ...atendimentoAberto, clienteNome: cliente.nome };
  }

  async getHistorico(usuarioId: number, page: number, limit: number): Promise<any> {
    const atendimentos = this.readAtendimentos();
    const todosClientes = this.clientsService.findAllWithAllData();

    const historicoDoUsuario = atendimentos.filter((att) => att.usuarioId === usuarioId && att.status === 'finalizado');

    const historicoOrdenado = historicoDoUsuario.sort((a, b) => {
      const timeB = b.horaCheckout ? new Date(b.horaCheckout).getTime() : 0;
      const timeA = a.horaCheckout ? new Date(a.horaCheckout).getTime() : 0;
      return timeB - timeA;
    });

    const total = historicoOrdenado.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const dataPaginada = historicoOrdenado.slice(startIndex, startIndex + limit);

    const dataEnriquecida = dataPaginada.map(att => {
      const cliente = todosClientes.find(c => c.id === att.clienteId);
      return { ...att, clienteNome: cliente?.nome ?? 'Cliente não encontrado' };
    });

    return {
      data: dataEnriquecida,
      total,
      page,
      totalPages,
    };
  }

  async getEventosDoDia(usuarioId: number): Promise<any[]> {
    const todosAtendimentos = this.readAtendimentos();
    const todosEventos = this.readEventos();
    const todosClientes = this.clientsService.findAllWithAllData();

    const atendimentosDoUsuario = todosAtendimentos.filter((att) => att.usuarioId === usuarioId);
    const idsAtendimentosDoUsuario = new Set(atendimentosDoUsuario.map((att) => att.id));

    const hoje = new Date();
    const inicioDoDia = new Date(hoje.setHours(0, 0, 0, 0));
    const fimDoDia = new Date(hoje.setHours(23, 59, 59, 999));

    const eventosDeHoje = todosEventos
      .filter((evento) => {
        if (!idsAtendimentosDoUsuario.has(evento.atendimentoId)) return false;
        const dataEvento = new Date(evento.timestamp);
        return dataEvento >= inicioDoDia && dataEvento <= fimDoDia;
      })
      .map((evento) => {
        const atendimentoAssociado = atendimentosDoUsuario.find((att) => att.id === evento.atendimentoId);
        const clienteAssociado = todosClientes.find((c) => c.id === atendimentoAssociado?.clienteId);
        return {
          atendimentoId: evento.atendimentoId,
          clienteId: atendimentoAssociado?.clienteId ?? 0,
          clienteNome: clienteAssociado?.nome ?? 'Cliente não encontrado',
          tipo: evento.tipo,
          timestamp: evento.timestamp,
        };
      });

    return eventosDeHoje.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}