import { Holiday, HolidayCalendar } from "../domain/holiday-calendar.entity";
import { IHolidayCalendarRepository } from "../repositories/holiday-calendar.repository";

export interface ICreateHolidayCalendarDto {
  name: string;
  country: string;
  region?: string;
  locality?: string;
}

export interface IAddHolidayDto {
  date: Date;
  name: string;
  isLocal: boolean;
}

export interface IHolidayCalendarService {
  createHolidayCalendar(
    dto: ICreateHolidayCalendarDto
  ): Promise<HolidayCalendar>;
  getHolidayCalendars(): Promise<HolidayCalendar[]>;
  getHolidayCalendar(id: string): Promise<HolidayCalendar>;
  addHolidayToCalendar(
    calendarId: string,
    holiday: IAddHolidayDto
  ): Promise<HolidayCalendar>;
  removeHolidayFromCalendar(
    calendarId: string,
    holidayId: string
  ): Promise<HolidayCalendar>;
  fetchHolidaysFromApi(country: string, year: number): Promise<Holiday[]>;
}

export class HolidayCalendarService implements IHolidayCalendarService {
  constructor(private holidayCalendarRepository: IHolidayCalendarRepository) {}

  async createHolidayCalendar(
    dto: ICreateHolidayCalendarDto
  ): Promise<HolidayCalendar> {
    const calendar = new HolidayCalendar({
      id: this.generateId(),
      name: dto.name,
      country: dto.country,
      region: dto.region,
      locality: dto.locality,
      holidays: [],
    });

    return this.holidayCalendarRepository.save(calendar);
  }

  async getHolidayCalendars(): Promise<HolidayCalendar[]> {
    return this.holidayCalendarRepository.findAll();
  }

  async getHolidayCalendar(id: string): Promise<HolidayCalendar> {
    const calendar = await this.holidayCalendarRepository.findById(id);
    if (!calendar) {
      throw new Error(`Holiday calendar with id ${id} not found`);
    }
    return calendar;
  }

  async addHolidayToCalendar(
    calendarId: string,
    holidayDto: IAddHolidayDto
  ): Promise<HolidayCalendar> {
    const calendar = await this.getHolidayCalendar(calendarId);

    const holiday = new Holiday({
      id: this.generateId(),
      date: holidayDto.date,
      name: holidayDto.name,
      isLocal: holidayDto.isLocal,
    });

    calendar.addHoliday(holiday);

    return this.holidayCalendarRepository.update(calendarId, {
      holidays: calendar.holidays,
    });
  }

  async removeHolidayFromCalendar(
    calendarId: string,
    holidayId: string
  ): Promise<HolidayCalendar> {
    const calendar = await this.getHolidayCalendar(calendarId);

    calendar.removeHoliday(holidayId);

    return this.holidayCalendarRepository.update(calendarId, {
      holidays: calendar.holidays,
    });
  }

  async fetchHolidaysFromApi(
    country: string,
    year: number
  ): Promise<Holiday[]> {
    try {
      const response = await fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch holidays: ${response.statusText}`);
      }

      const data = await response.json();

      return data.map(
        (item: any) =>
          new Holiday({
            id: this.generateId(),
            date: new Date(item.date),
            name: item.name,
            isLocal: false,
          })
      );
    } catch (error) {
      console.error("Error fetching holidays from API:", error);
      return [];
    }
  }

  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
