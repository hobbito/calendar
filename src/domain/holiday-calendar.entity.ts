export interface IHoliday {
  id: string;
  date: Date;
  name: string;
  isLocal: boolean;
}

export class Holiday implements IHoliday {
  id: string;
  date: Date;
  name: string;
  isLocal: boolean;

  constructor(data: IHoliday) {
    this.id = data.id;
    this.date = data.date;
    this.name = data.name;
    this.isLocal = data.isLocal;
  }
}

export interface IHolidayCalendar {
  id: string;
  name: string;
  country: string;
  region?: string;
  locality?: string;
  holidays: Holiday[];
}

export class HolidayCalendar implements IHolidayCalendar {
  id: string;
  name: string;
  country: string;
  region?: string;
  locality?: string;
  holidays: Holiday[];

  constructor(data: IHolidayCalendar) {
    this.id = data.id;
    this.name = data.name;
    this.country = data.country;
    this.region = data.region;
    this.locality = data.locality;
    this.holidays = data.holidays;
  }

  isHoliday(date: Date): boolean {
    return this.holidays.some(
      (holiday) =>
        holiday.date.getFullYear() === date.getFullYear() &&
        holiday.date.getMonth() === date.getMonth() &&
        holiday.date.getDate() === date.getDate()
    );
  }

  getHoliday(date: Date): Holiday | undefined {
    return this.holidays.find(
      (holiday) =>
        holiday.date.getFullYear() === date.getFullYear() &&
        holiday.date.getMonth() === date.getMonth() &&
        holiday.date.getDate() === date.getDate()
    );
  }

  addHoliday(holiday: Holiday): void {
    this.holidays.push(holiday);
  }

  removeHoliday(holidayId: string): void {
    this.holidays = this.holidays.filter((holiday) => holiday.id !== holidayId);
  }
}
