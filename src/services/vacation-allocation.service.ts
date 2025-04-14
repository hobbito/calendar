import { IVacationAllocation } from "../domain/vacation-allocation.entity";

interface IUserAllocation {
  userId: string;
  year: number;
  totalDays: number;
  usedDays: number;
  expiryDate?: Date; // Optional expiry date for carried over days
  carryOverFromPreviousYear?: number; // Days carried over from previous year
}

/**
 * Result of an allocation suggestion
 */
interface IAllocationSuggestion {
  year: number;
  days: number;
  isCarryOver: boolean;
  expiryDate?: Date;
}

/**
 * Service for managing vacation allocations by year for users
 */
export class VacationAllocationService {
  private static instance: VacationAllocationService;
  private allocations: IUserAllocation[] = [];

  constructor() {
    // Initialize with some test data
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    const nextYear = currentYear + 1;

    // Add three months to today for expiry date
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    this.allocations = [
      // User 1 allocations
      {
        userId: "user1",
        year: lastYear,
        totalDays: 22,
        usedDays: 20,
        carryOverFromPreviousYear: 0,
      },
      {
        userId: "user1",
        year: currentYear,
        totalDays: 25,
        usedDays: 5,
        carryOverFromPreviousYear: 2, // Carried over 2 days from last year
        expiryDate: threeMonthsFromNow, // These carry-over days expire soon
      },
      {
        userId: "user1",
        year: nextYear,
        totalDays: 25,
        usedDays: 0,
        carryOverFromPreviousYear: 0,
      },

      // User 2 allocations
      {
        userId: "user2",
        year: lastYear,
        totalDays: 24,
        usedDays: 23,
        carryOverFromPreviousYear: 0,
      },
      {
        userId: "user2",
        year: currentYear,
        totalDays: 24,
        usedDays: 12,
        carryOverFromPreviousYear: 1, // Carried over 1 day
        expiryDate: threeMonthsFromNow,
      },

      // User 3 allocations
      {
        userId: "user3",
        year: currentYear,
        totalDays: 30,
        usedDays: 7,
        carryOverFromPreviousYear: 0,
      },
      {
        userId: "user3",
        year: nextYear,
        totalDays: 30,
        usedDays: 0,
        carryOverFromPreviousYear: 0,
      },
    ];
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): VacationAllocationService {
    if (!VacationAllocationService.instance) {
      VacationAllocationService.instance = new VacationAllocationService();
    }
    return VacationAllocationService.instance;
  }

  /**
   * Get all vacation allocations
   */
  public getAllAllocations(): IUserAllocation[] {
    return this.allocations;
  }

  /**
   * Get available years for a specific user
   * (years with remaining vacation days)
   */
  public getAvailableYears(userId: string): number[] {
    const userAllocations = this.allocations.filter(
      (a) => a.userId === userId && this.getRemainingDaysForAllocation(a) > 0
    );

    return [...new Set(userAllocations.map((a) => a.year))].sort(
      (a, b) => b - a
    );
  }

  /**
   * Calculate remaining days for a specific allocation
   */
  private getRemainingDaysForAllocation(allocation: IUserAllocation): number {
    return allocation.totalDays - allocation.usedDays;
  }

  /**
   * Get allocation for specific user
   */
  public getUserAllocation(userId: string, year: number): IVacationAllocation {
    const allocation = this.allocations.find(
      (a) => a.userId === userId && a.year === year
    );

    if (!allocation) {
      // Create a default allocation if it doesn't exist
      const newAllocation = {
        userId,
        year,
        totalDays: 22, // Default value
        usedDays: 0,
      };
      this.allocations.push(newAllocation);
      return {
        year: year.toString(),
        totalDays: newAllocation.totalDays,
        usedDays: newAllocation.usedDays,
        remainingDays: newAllocation.totalDays - newAllocation.usedDays,
      };
    }

    return {
      year: allocation.year.toString(),
      totalDays: allocation.totalDays,
      usedDays: allocation.usedDays,
      remainingDays: allocation.totalDays - allocation.usedDays,
      expiryDate: allocation.expiryDate,
      carryOverDays: allocation.carryOverFromPreviousYear,
    };
  }

  /**
   * Get all allocations for a specific user
   */
  public getUserAllocations(userId: string): IVacationAllocation[] {
    return this.getAvailableYears(userId).map((year) =>
      this.getUserAllocation(userId, year)
    );
  }

  /**
   * Get all allocations by user ID including detailed information
   */
  public getAllocationsByUserId(userId: string): Array<{
    year: number;
    remaining: number;
    expiryDate?: Date;
    carryOverFromPreviousYear: number;
  }> {
    const userAllocations = this.allocations.filter((a) => a.userId === userId);

    return userAllocations.map((allocation) => ({
      year: allocation.year,
      remaining: this.getRemainingDaysForAllocation(allocation),
      expiryDate: allocation.expiryDate,
      carryOverFromPreviousYear: allocation.carryOverFromPreviousYear || 0,
    }));
  }

  /**
   * Get remaining days for a user in a specific year
   */
  public getRemainingDays(userId: string, year: number): number {
    const allocation = this.allocations.find(
      (a) => a.userId === userId && a.year === year
    );

    if (!allocation) {
      return 0;
    }

    return this.getRemainingDaysForAllocation(allocation);
  }

  /**
   * Check if user has enough days available for the specified year
   */
  public hasEnoughDaysAvailable(
    userId: string,
    year: number,
    daysRequested: number
  ): boolean {
    const allocation = this.getUserAllocation(userId, year);
    return allocation.remainingDays >= daysRequested;
  }

  /**
   * Update allocation after vacation request is approved
   * @returns true if successful, false if not enough days available
   */
  public updateAllocation(
    userId: string,
    year: number,
    daysUsed: number
  ): boolean {
    const allocation = this.allocations.find(
      (a) => a.userId === userId && a.year === year
    );

    if (!allocation) {
      // Create a new allocation if it doesn't exist
      const newAllocation = {
        userId,
        year,
        totalDays: 22, // Default value
        usedDays: daysUsed,
      };

      // Don't allow using more days than available
      if (daysUsed > newAllocation.totalDays) {
        return false;
      }

      this.allocations.push(newAllocation);
      return true;
    }

    // Check if user has enough days available
    if (allocation.totalDays < allocation.usedDays + daysUsed) {
      return false;
    }

    allocation.usedDays += daysUsed;
    return true;
  }

  /**
   * Set total days for a specific user
   */
  public setTotalDays(
    userId: string,
    year: number,
    totalDays: number
  ): boolean {
    const allocation = this.allocations.find(
      (a) => a.userId === userId && a.year === year
    );

    if (!allocation) {
      this.allocations.push({
        userId,
        year,
        totalDays,
        usedDays: 0,
      });
      return true;
    }

    // Don't allow setting total days below what's already used
    if (totalDays < allocation.usedDays) {
      return false;
    }

    allocation.totalDays = totalDays;
    return true;
  }

  /**
   * Suggest allocation years for a vacation request with smart distribution
   * Prioritizes:
   * 1. Expiring carryover days first
   * 2. Oldest allocations first
   * 3. Tries to avoid leaving small unusable balances
   */
  public suggestAllocationYears(
    userId: string,
    daysRequested: number
  ): IAllocationSuggestion[] {
    const userAllocations = this.allocations
      .filter(
        (a) => a.userId === userId && this.getRemainingDaysForAllocation(a) > 0
      )
      .sort((a, b) => {
        // First priority: has expiry date (carryover with expiry)
        if (a.expiryDate && !b.expiryDate) return -1;
        if (!a.expiryDate && b.expiryDate) return 1;

        // If both have expiry dates, sort by earliest expiry
        if (a.expiryDate && b.expiryDate) {
          return a.expiryDate.getTime() - b.expiryDate.getTime();
        }

        // Second priority: oldest allocation first
        return a.year - b.year;
      });

    const result: IAllocationSuggestion[] = [];
    let remainingDays = daysRequested;

    // First pass: use carryover days that are expiring
    for (const allocation of userAllocations) {
      if (remainingDays <= 0) break;

      // Skip if not carryover or no expiry date
      if (!allocation.expiryDate || !allocation.carryOverFromPreviousYear)
        continue;

      const carryoverDays = Math.min(
        allocation.carryOverFromPreviousYear,
        this.getRemainingDaysForAllocation(allocation),
        remainingDays
      );

      if (carryoverDays > 0) {
        result.push({
          year: allocation.year,
          days: carryoverDays,
          isCarryOver: true,
          expiryDate: allocation.expiryDate,
        });

        remainingDays -= carryoverDays;
      }
    }

    // Second pass: use remaining days from oldest to newest
    for (const allocation of userAllocations) {
      if (remainingDays <= 0) break;

      // Calculate how many days we can use from this allocation
      // (excluding any days we've already allocated from carryover)
      const alreadyAllocated =
        result.find((r) => r.year === allocation.year)?.days || 0;
      const availableDays =
        this.getRemainingDaysForAllocation(allocation) - alreadyAllocated;

      if (availableDays <= 0) continue;

      const daysToUse = Math.min(availableDays, remainingDays);

      if (daysToUse > 0) {
        // Check if we already have an entry for this year
        const existingEntry = result.find((r) => r.year === allocation.year);

        if (existingEntry) {
          existingEntry.days += daysToUse;
        } else {
          result.push({
            year: allocation.year,
            days: daysToUse,
            isCarryOver: false,
          });
        }

        remainingDays -= daysToUse;
      }
    }

    return result;
  }
}

// Export a singleton instance
export const vacationAllocationService =
  VacationAllocationService.getInstance();
