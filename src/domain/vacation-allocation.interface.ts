/**
 * Interface representing the balance of vacation days for a specific year
 */
export interface IVacationBalance {
  total: number; // Total days allocated for the year
  used: number; // Days already used
  remaining: number; // Days still available
}

/**
 * Interface representing vacation balances indexed by year
 */
export interface IVacationBalanceByYear {
  [year: string]: IVacationBalance;
}

/**
 * Interface representing a user's vacation allocation across multiple years
 */
export interface IVacationAllocation {
  userId: string;
  userName: string;
  balanceByYear: IVacationBalanceByYear;
}
