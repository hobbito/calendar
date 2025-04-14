export enum UserRole {
  EMPLOYEE = "employee",
  ADMIN = "admin",
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  roles: UserRole[];
  holidayCalendarId: string;
  vacationDaysPerYear: number;
  vacationDaysTaken: number;
}

export class User implements IUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  roles: UserRole[];
  holidayCalendarId: string;
  vacationDaysPerYear: number;
  vacationDaysTaken: number;

  constructor(data: IUser) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.phone = data.phone;
    this.roles = data.roles;
    this.holidayCalendarId = data.holidayCalendarId;
    this.vacationDaysPerYear = data.vacationDaysPerYear;
    this.vacationDaysTaken = data.vacationDaysTaken;
  }

  get isAdmin(): boolean {
    return this.roles.includes(UserRole.ADMIN);
  }

  get isEmployee(): boolean {
    return this.roles.includes(UserRole.EMPLOYEE);
  }

  get vacationDaysRemaining(): number {
    return this.vacationDaysPerYear - this.vacationDaysTaken;
  }
}
