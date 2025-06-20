import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientsService } from '../clients/clients.service';
import { Client } from 'src/common/models/client.model';


@Injectable()
export class ClientesProximosService {
  // Injetamos o ClientsService para reutilizar a busca de clientes
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * Calcula a distância em KM entre dois pontos de coordenadas.
   * Utiliza a fórmula de Haversine.
   */
  private calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distância final em km
  }

  async findProximos(
    clienteId: number,
    empresaId: number,
    raioKm: number,
  ): Promise<(Client & { distanciaKm: number })[]> {
    // Busca o cliente principal que será o centro da busca
    const clientePrincipal = await this.clientsService.findById(
      clienteId,
      empresaId,
    );

    if (!clientePrincipal || !clientePrincipal.latitude || !clientePrincipal.longitude) {
      throw new NotFoundException(
        'Cliente principal não encontrado ou não possui coordenadas.',
      );
    }

    // Busca todos os clientes que pertencem à mesma empresa
    const todosOsClientesDaEmpresa = await this.clientsService.findAll(empresaId);

    // Filtra para encontrar os clientes próximos
    const clientesProximos = todosOsClientesDaEmpresa
      .filter((cliente) => {
        // Garante que não é o próprio cliente principal e que ele possui coordenadas
        if (
          cliente.id === clientePrincipal.id ||
          !cliente.latitude ||
          !cliente.longitude
        ) {
          return false;
        }

        const distancia = this.calcularDistancia(
          clientePrincipal.latitude,
          clientePrincipal.longitude,
          cliente.latitude,
          cliente.longitude,
        );

        // Retorna true apenas se a distância for menor ou igual ao raio
        return distancia <= raioKm;
      })
      .map((cliente) => {
        // Adiciona o campo 'distanciaKm' ao objeto de cliente retornado
        const distancia = this.calcularDistancia(
          clientePrincipal.latitude,
          clientePrincipal.longitude,
          cliente.latitude,
          cliente.longitude,
        );
        return { ...cliente, distanciaKm: Number(distancia.toFixed(2)) };
      });

    return clientesProximos;
  }
}