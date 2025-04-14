export type VacationRequestStatus = "pending" | "approved" | "rejected";

export interface VacationRequest {
  id: string;
  userId: string;
  userName?: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  status: VacationRequestStatus;
  requestDate: Date;
  notes?: string;
  allocationYear: number; // The year these vacation days are allocated from
}

export class VacationRequest implements VacationRequest {
  id: string;
  userId: string;
  userName?: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  status: VacationRequestStatus;
  requestDate: Date;
  notes?: string;
  allocationYear: number;

  constructor(data: VacationRequest) {
    this.id = data.id;
    this.userId = data.userId;
    this.userName = data.userName;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.totalDays = data.totalDays;
    this.status = data.status;
    this.requestDate = data.requestDate;
    this.notes = data.notes;
    this.allocationYear = data.allocationYear;
  }

  get isPending(): boolean {
    return this.status === "pending";
  }

  get isApproved(): boolean {
    return this.status === "approved";
  }

  get isRejected(): boolean {
    return this.status === "rejected";
  }

  get durationInDays(): number {
    const diffTime = Math.abs(
      this.endDate.getTime() - this.startDate.getTime()
    );
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }
}
