import { Holiday, HolidayCalendar } from "../domain/holiday-calendar.entity";
import {
  VacationRequest,
  type VacationRequestStatus,
} from "../domain/vacation-request.entity";

export interface CalendarDay {
  date: Date;
  day: number | null;
  type: "empty" | "regular" | "nonworking" | "holiday" | "approved" | "pending";
  isWeekend: boolean;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Array<{
    title: string;
    user?: string;
    requestId?: string;
    type: "approved" | "pending" | "holiday";
    eventId?: string; // ID for grouping events across days
    isFirst?: boolean; // Is this the first day of the event?
    isLast?: boolean; // Is this the last day of the event?
    year?: number; // Year of the event (when it happens)
    allocationYear?: number; // Year the vacation days are allocated from
  }>;
}

export class CalendarService {
  // Get days in a month for the calendar grid
  public getDaysInMonth(
    year: number,
    month: number,
    filterYear?: number
  ): CalendarDay[] {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = (firstDayOfMonth.getDay() - 1 + 7) % 7; // Convert Sunday (0) to 6, Monday (1) to 0

    const today = new Date();
    const days: CalendarDay[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: new Date(year, month, -startingDayOfWeek + i + 1),
        day: null,
        type: "empty",
        isWeekend: false,
        isCurrentMonth: false,
        isToday: false,
        events: [],
      });
    }

    // Predefined vacation periods for sample data with unique IDs
    const vacationPeriods = [
      // 2024 Vacations
      // John's summer vacation (5 days)
      {
        start: 15,
        end: 19,
        user: "John Smith",
        type: "approved" as const,
        eventId: "john-summer-1-2024",
        year: 2024,
        allocationYear: 2024, // Using current year allocation
      },
      // Maria's pending request (3 days)
      {
        start: 8,
        end: 10,
        user: "Maria Garcia",
        type: "pending" as const,
        eventId: "maria-pending-1-2024",
        year: 2024,
        allocationYear: 2023, // Using previous year's remaining days
      },
      // Alex's approved time off (2 days)
      {
        start: 22,
        end: 23,
        user: "Alex Johnson",
        type: "approved" as const,
        eventId: "alex-timeoff-1-2024",
        year: 2024,
        allocationYear: 2024,
      },

      // 2025 Vacations
      // John's summer vacation (different dates)
      {
        start: 20,
        end: 24,
        user: "John Smith",
        type: "approved" as const,
        eventId: "john-summer-1-2025",
        year: 2025,
        allocationYear: 2024, // Using previous year's remaining days
      },
      // Lisa's approved day off
      {
        start: 4,
        end: 4,
        user: "Lisa Chen",
        type: "approved" as const,
        eventId: "lisa-day-1-2025",
        year: 2025,
        allocationYear: 2025,
      },
      // David's pending request
      {
        start: 22,
        end: 24,
        user: "David Kim",
        type: "pending" as const,
        eventId: "david-pending-1-2025",
        year: 2025,
        allocationYear: 2025,
      },
      // Additional data: multiple people on the same day
      {
        start: 15,
        end: 15,
        user: "Emily Wang",
        type: "approved" as const,
        eventId: "emily-day-1-2025",
        year: 2025,
        allocationYear: 2024, // Using previous year's remaining days
      },
      {
        start: 15,
        end: 17,
        user: "Carlos Rodriguez",
        type: "pending" as const,
        eventId: "carlos-pending-1-2025",
        year: 2025,
        allocationYear: 2025,
      },
      // Consecutive vacation periods for the same person
      {
        start: 5,
        end: 7,
        user: "John Smith",
        type: "approved" as const,
        eventId: "john-early-1-2025",
        year: 2025,
        allocationYear: 2024, // First part uses 2024 days
      },
      {
        start: 25,
        end: 28,
        user: "John Smith",
        type: "pending" as const,
        eventId: "john-late-1-2025",
        year: 2025,
        allocationYear: 2025, // Second part uses 2025 days
      },
      // More overlapping vacations
      {
        start: 10,
        end: 12,
        user: "Sarah Miller",
        type: "approved" as const,
        eventId: "sarah-approved-1-2025",
        year: 2025,
        allocationYear: 2025,
      },
      {
        start: 11,
        end: 13,
        user: "James Wilson",
        type: "approved" as const,
        eventId: "james-approved-1-2025",
        year: 2025,
        allocationYear: 2024, // Using previous year's remaining days
      },
      // Adding more overlapping vacations for the 15th day
      {
        start: 15,
        end: 16,
        user: "Michelle Lee",
        type: "approved" as const,
        eventId: "michelle-approved-1-2025",
        year: 2025,
        allocationYear: 2025,
      },
      {
        start: 15,
        end: 15,
        user: "Robert Johnson",
        type: "pending" as const,
        eventId: "robert-pending-1-2025",
        year: 2025,
        allocationYear: 2025,
      },
      // Heavy overlap day - 4 different people on day 18
      {
        start: 18,
        end: 19,
        user: "Jennifer Lopez",
        type: "approved" as const,
        eventId: "jennifer-approved-1-2025",
        year: 2025,
        allocationYear: 2025,
      },
      {
        start: 18,
        end: 18,
        user: "Michael Brown",
        type: "approved" as const,
        eventId: "michael-approved-1-2025",
        year: 2025,
        allocationYear: 2024,
      },
      {
        start: 18,
        end: 20,
        user: "Sophia Garcia",
        type: "pending" as const,
        eventId: "sophia-pending-1-2025",
        year: 2025,
        allocationYear: 2025,
      },
      {
        start: 17,
        end: 18,
        user: "Daniel Martinez",
        type: "pending" as const,
        eventId: "daniel-pending-1-2025",
        year: 2025,
        allocationYear: 2025,
      },
      // Multi-day events overlapping with single days
      {
        start: 8,
        end: 12,
        user: "Emma Wilson",
        type: "approved" as const,
        eventId: "emma-approved-1-2025",
        year: 2025,
        allocationYear: 2025,
      },
      {
        start: 10,
        end: 10,
        user: "Noah Anderson",
        type: "pending" as const,
        eventId: "noah-pending-1-2025",
        year: 2025,
        allocationYear: 2025,
      },
    ];

    // Holidays
    const holidays = [
      { day: 1, name: "National Holiday" },
      { day: 25, name: "Company Day" },
    ];

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

      const isToday =
        today.getDate() === i &&
        today.getMonth() === month &&
        today.getFullYear() === year;

      let type: CalendarDay["type"] = "regular";
      if (isWeekend) {
        type = "nonworking";
      }

      // Generate events for this day
      const events = [];

      // Check if this day is a holiday
      const holiday = holidays.find((h) => h.day === i);
      if (holiday) {
        type = "holiday";
        events.push({
          title: "Holiday",
          user: holiday.name,
          type: "holiday" as const,
        });
      }

      // Check if this day is part of any vacation period
      for (const period of vacationPeriods) {
        // Skip events that don't match the filter year if one is provided
        if (filterYear && period.year !== filterYear) {
          continue;
        }

        if (i >= period.start && i <= period.end) {
          // Set the day type based on the first vacation found
          if (type === "regular") {
            type = period.type;
          }

          // Add an event for this vacation with first/last day markers
          events.push({
            title: period.type === "approved" ? "Vacation" : "Pending",
            user: period.user,
            requestId: `req-${period.user.split(" ")[0].toLowerCase()}-${i}`,
            type: period.type,
            eventId: period.eventId,
            isFirst: i === period.start,
            isLast: i === period.end,
            year: period.year,
            allocationYear: period.allocationYear,
          });
        }
      }

      days.push({
        date,
        day: i,
        type,
        isWeekend,
        isCurrentMonth: true,
        isToday,
        events,
      });
    }

    return days;
  }

  // In a real application, this would fetch from a database
  public getVacationRequestsForMonth(
    year: number,
    month: number
  ): VacationRequest[] {
    // Mock data
    return [];
  }

  // In a real application, this would fetch from a database
  public getHolidaysForMonth(year: number, month: number): Holiday[] {
    // Mock data
    return [];
  }

  // Check if a day is within a vacation request
  public isDayInVacationRequest(date: Date, request: VacationRequest): boolean {
    const day = date.getTime();
    return (
      day >= request.startDate.getTime() && day <= request.endDate.getTime()
    );
  }
}

export default new CalendarService();
