import { VacationRequest } from "../domain/vacation-request.entity";
import type { IVacationRequest } from "../domain/vacation-request.entity";

export interface IVacationRequestRepository {
  findById(id: string): Promise<VacationRequest | null>;
  findByUserId(userId: string): Promise<VacationRequest[]>;
  findAll(): Promise<VacationRequest[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<VacationRequest[]>;
  findPending(): Promise<VacationRequest[]>;
  save(vacationRequest: VacationRequest): Promise<VacationRequest>;
  update(
    id: string,
    vacationRequest: Partial<IVacationRequest>
  ): Promise<VacationRequest>;
  delete(id: string): Promise<void>;
}

export class MockVacationRequestRepository
  implements IVacationRequestRepository
{
  private vacationRequests: VacationRequest[] = [];

  constructor() {
    this.vacationRequests = [];
  }

  async findById(id: string): Promise<VacationRequest | null> {
    const request = this.vacationRequests.find((r) => r.id === id);
    return request ? request : null;
  }

  async findByUserId(userId: string): Promise<VacationRequest[]> {
    return this.vacationRequests.filter((r) => r.userId === userId);
  }

  async findAll(): Promise<VacationRequest[]> {
    return [...this.vacationRequests];
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<VacationRequest[]> {
    return this.vacationRequests.filter(
      (r) => r.startDate <= endDate && r.endDate >= startDate
    );
  }

  async findPending(): Promise<VacationRequest[]> {
    return this.vacationRequests.filter((r) => r.isPending);
  }

  async save(vacationRequest: VacationRequest): Promise<VacationRequest> {
    this.vacationRequests.push(vacationRequest);
    return vacationRequest;
  }

  async update(
    id: string,
    requestData: Partial<IVacationRequest>
  ): Promise<VacationRequest> {
    const index = this.vacationRequests.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Vacation request with id ${id} not found`);
    }

    const updatedRequest = {
      ...this.vacationRequests[index],
      ...requestData,
      id,
      updatedAt: new Date(),
    };

    this.vacationRequests[index] = new VacationRequest(updatedRequest);
    return this.vacationRequests[index];
  }

  async delete(id: string): Promise<void> {
    const index = this.vacationRequests.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.vacationRequests.splice(index, 1);
    }
  }
}
