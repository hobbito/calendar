import { HolidayCalendar } from "../domain/holiday-calendar.entity";
import type { IHolidayCalendar } from "../domain/holiday-calendar.entity";

export interface IHolidayCalendarRepository {
  findById(id: string): Promise<HolidayCalendar | null>;
  findByCountry(country: string): Promise<HolidayCalendar[]>;
  findAll(): Promise<HolidayCalendar[]>;
  save(holidayCalendar: HolidayCalendar): Promise<HolidayCalendar>;
  update(
    id: string,
    holidayCalendar: Partial<IHolidayCalendar>
  ): Promise<HolidayCalendar>;
  delete(id: string): Promise<void>;
}

export class MockHolidayCalendarRepository
  implements IHolidayCalendarRepository
{
  private holidayCalendars: HolidayCalendar[] = [];

  constructor() {
    this.holidayCalendars = [];
  }

  async findById(id: string): Promise<HolidayCalendar | null> {
    const calendar = this.holidayCalendars.find((c) => c.id === id);
    return calendar ? calendar : null;
  }

  async findByCountry(country: string): Promise<HolidayCalendar[]> {
    return this.holidayCalendars.filter((c) => c.country === country);
  }

  async findAll(): Promise<HolidayCalendar[]> {
    return [...this.holidayCalendars];
  }

  async save(holidayCalendar: HolidayCalendar): Promise<HolidayCalendar> {
    this.holidayCalendars.push(holidayCalendar);
    return holidayCalendar;
  }

  async update(
    id: string,
    calendarData: Partial<IHolidayCalendar>
  ): Promise<HolidayCalendar> {
    const index = this.holidayCalendars.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Holiday calendar with id ${id} not found`);
    }

    const updatedCalendar = {
      ...this.holidayCalendars[index],
      ...calendarData,
      id,
    };

    this.holidayCalendars[index] = new HolidayCalendar(updatedCalendar);
    return this.holidayCalendars[index];
  }

  async delete(id: string): Promise<void> {
    const index = this.holidayCalendars.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.holidayCalendars.splice(index, 1);
    }
  }
}
