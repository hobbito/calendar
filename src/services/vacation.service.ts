import { User } from "../domain/user.entity";
import {
  VacationRequest,
  VacationRequestStatus,
} from "../domain/vacation-request.entity";
import { HolidayCalendar } from "../domain/holiday-calendar.entity";
import { IVacationRequestRepository } from "../repositories/vacation-request.repository";
import { IUserRepository } from "../repositories/user.repository";
import { IHolidayCalendarRepository } from "../repositories/holiday-calendar.repository";

export interface ICreateVacationRequestDto {
  userId: string;
  startDate: Date;
  endDate: Date;
  includeWeekends: boolean;
  includeHolidays: boolean;
}

export interface IVacationService {
  createVacationRequest(
    dto: ICreateVacationRequestDto
  ): Promise<VacationRequest>;
  approveVacationRequest(
    id: string,
    approverId: string
  ): Promise<VacationRequest>;
  rejectVacationRequest(id: string, reason: string): Promise<VacationRequest>;
  calculateEffectiveDays(
    startDate: Date,
    endDate: Date,
    includeWeekends: boolean,
    includeHolidays: boolean,
    holidayCalendarId: string
  ): Promise<number>;
  getVacationRequestsByUser(userId: string): Promise<VacationRequest[]>;
  getPendingVacationRequests(): Promise<VacationRequest[]>;
}

export class VacationService implements IVacationService {
  constructor(
    private vacationRequestRepository: IVacationRequestRepository,
    private userRepository: IUserRepository,
    private holidayCalendarRepository: IHolidayCalendarRepository
  ) {}

  async createVacationRequest(
    dto: ICreateVacationRequestDto
  ): Promise<VacationRequest> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new Error(`User with id ${dto.userId} not found`);
    }

    const effectiveDays = await this.calculateEffectiveDays(
      dto.startDate,
      dto.endDate,
      dto.includeWeekends,
      dto.includeHolidays,
      user.holidayCalendarId
    );

    if (effectiveDays > user.vacationDaysRemaining) {
      throw new Error("Not enough vacation days remaining");
    }

    const vacationRequest = new VacationRequest({
      id: this.generateId(),
      userId: dto.userId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: VacationRequestStatus.PENDING,
      includeWeekends: dto.includeWeekends,
      includeHolidays: dto.includeHolidays,
      effectiveDays,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.vacationRequestRepository.save(vacationRequest);
  }

  async approveVacationRequest(
    id: string,
    approverId: string
  ): Promise<VacationRequest> {
    const request = await this.vacationRequestRepository.findById(id);
    if (!request) {
      throw new Error(`Vacation request with id ${id} not found`);
    }

    if (!request.isPending) {
      throw new Error("Vacation request is not pending");
    }

    const approver = await this.userRepository.findById(approverId);
    if (!approver || !approver.isAdmin) {
      throw new Error("Only administrators can approve vacation requests");
    }

    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new Error(`User with id ${request.userId} not found`);
    }

    await this.userRepository.update(user.id, {
      vacationDaysTaken: user.vacationDaysTaken + request.effectiveDays,
    });

    return this.vacationRequestRepository.update(id, {
      status: VacationRequestStatus.APPROVED,
      approvedBy: approverId,
      updatedAt: new Date(),
    });
  }

  async rejectVacationRequest(
    id: string,
    reason: string
  ): Promise<VacationRequest> {
    const request = await this.vacationRequestRepository.findById(id);
    if (!request) {
      throw new Error(`Vacation request with id ${id} not found`);
    }

    if (!request.isPending) {
      throw new Error("Vacation request is not pending");
    }

    return this.vacationRequestRepository.update(id, {
      status: VacationRequestStatus.REJECTED,
      rejectionReason: reason,
      updatedAt: new Date(),
    });
  }

  async calculateEffectiveDays(
    startDate: Date,
    endDate: Date,
    includeWeekends: boolean,
    includeHolidays: boolean,
    holidayCalendarId: string
  ): Promise<number> {
    const calendar = await this.holidayCalendarRepository.findById(
      holidayCalendarId
    );
    if (!calendar) {
      throw new Error(
        `Holiday calendar with id ${holidayCalendarId} not found`
      );
    }

    let effectiveDays = 0;
    const currentDate = new Date(startDate.getTime());

    while (currentDate <= endDate) {
      const isWeekend =
        currentDate.getDay() === 0 || currentDate.getDay() === 6;
      const isHoliday = calendar.isHoliday(currentDate);

      if ((includeWeekends || !isWeekend) && (includeHolidays || !isHoliday)) {
        effectiveDays++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return effectiveDays;
  }

  async getVacationRequestsByUser(userId: string): Promise<VacationRequest[]> {
    return this.vacationRequestRepository.findByUserId(userId);
  }

  async getPendingVacationRequests(): Promise<VacationRequest[]> {
    return this.vacationRequestRepository.findPending();
  }

  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
