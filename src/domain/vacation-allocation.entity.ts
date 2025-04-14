/**
 * Represents a vacation allocation for a user in a specific year
 */
export interface VacationAllocation {
  /**
   * User ID of the allocation owner
   */
  userId: string;

  /**
   * User name for display
   */
  userName: string;

  /**
   * Year of the vacation allocation
   */
  year: number;

  /**
   * Total number of days allocated for this year
   * Includes base allocation plus any carried over days
   */
  totalDays: number;

  /**
   * Days already used from this allocation
   */
  usedDays: number;

  /**
   * Days requested but not yet approved
   */
  pendingDays: number;

  /**
   * Days carried over from previous year
   */
  carryOverFromPreviousYear: number;

  /**
   * Expiry date for carried over days
   * Some organizations require carried over days to be used by a certain date
   */
  expiryDate?: Date;
}

/**
 * Class that handles vacation allocation logic
 */
export class VacationAllocationService {
  /**
   * Get the remaining available days for a user in a specific year
   */
  static getRemainingDays(allocation: VacationAllocation): number {
    return allocation.totalDays - allocation.usedDays - allocation.pendingDays;
  }

  /**
   * Check if user has enough days for a request
   */
  static hasEnoughDays(
    allocation: VacationAllocation,
    requestedDays: number
  ): boolean {
    return this.getRemainingDays(allocation) >= requestedDays;
  }

  /**
   * Get allocations for multiple years, sorted by most recent first
   */
  static getYearsSortedByPriority(
    allocations: VacationAllocation[]
  ): VacationAllocation[] {
    // Sort oldest years first - we want to use up expiring days first
    return [...allocations].sort((a, b) => a.year - b.year);
  }

  /**
   * Suggest optimal allocation years for a vacation request
   * @returns Array of year allocations to use and how many days from each
   */
  static suggestAllocationYears(
    userAllocations: VacationAllocation[],
    requestedDays: number
  ): Array<{ year: number; days: number }> {
    const result: Array<{ year: number; days: number }> = [];

    // Get allocations sorted by priority (oldest first to use expiring days)
    const sortedAllocations = this.getYearsSortedByPriority(userAllocations);

    let remainingDays = requestedDays;

    for (const allocation of sortedAllocations) {
      const availableDays = this.getRemainingDays(allocation);

      if (availableDays <= 0) continue;

      const daysToUse = Math.min(availableDays, remainingDays);

      if (daysToUse > 0) {
        result.push({
          year: allocation.year,
          days: daysToUse,
        });

        remainingDays -= daysToUse;
      }

      if (remainingDays <= 0) break;
    }

    return result;
  }
}

export interface IVacationAllocation {
  year?: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  carryOverDays?: number;
  expiryDate?: Date;
}
