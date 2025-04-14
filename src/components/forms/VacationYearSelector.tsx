import { useState, useEffect } from "react";
import { vacationAllocationService } from "../services/vacation-allocation.service";
import { formatDate } from "../utils/date-utils";

interface VacationYearSelectorProps {
  userId: string;
  onYearSelected: (year: string) => void;
  className?: string;
}

interface AllocationInfo {
  year: number;
  remaining: number;
  expiryDate?: Date;
  hasCarryOver: boolean;
  carryOverDays: number;
}

export default function VacationYearSelector({
  userId,
  onYearSelected,
  className = "",
}: VacationYearSelectorProps) {
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [allocations, setAllocations] = useState<AllocationInfo[]>([]);

  useEffect(() => {
    // Get available years (years with vacation days remaining)
    const years = vacationAllocationService
      .getAvailableYears(userId)
      .map((year) => year.toString());

    setAvailableYears(years);

    // Select the first year by default
    if (years.length > 0) {
      setSelectedYear(years[0]);
      onYearSelected(years[0]);
    }

    // Get all allocations information
    const userAllocations =
      vacationAllocationService.getAllocationsByUserId(userId);

    // Map to our component format
    const allocationInfo: AllocationInfo[] = userAllocations
      .filter((a) => a.remaining > 0)
      .map((allocation) => ({
        year: allocation.year,
        remaining: allocation.remaining,
        expiryDate: allocation.expiryDate,
        hasCarryOver: !!allocation.carryOverFromPreviousYear,
        carryOverDays: allocation.carryOverFromPreviousYear || 0,
      }));

    setAllocations(allocationInfo);
  }, [userId, onYearSelected]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value;
    setSelectedYear(year);
    onYearSelected(year);
  };

  // Get the selected year's allocation information
  const selectedAllocation = allocations.find(
    (a) => a.year.toString() === selectedYear
  );

  if (availableYears.length === 0) {
    return <p className="text-red-500">No vacation days available</p>;
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <label
        htmlFor="vacation-year"
        className="text-sm font-medium text-gray-700 mb-1"
      >
        Year to allocate vacation days
      </label>

      <div className="flex flex-col space-y-2">
        <select
          id="vacation-year"
          value={selectedYear}
          onChange={handleYearChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {selectedAllocation && (
          <div className="allocation-info text-sm">
            <div className="flex justify-between text-gray-600">
              <span>
                Available:{" "}
                <strong className="text-gray-800">
                  {selectedAllocation.remaining} days
                </strong>
              </span>

              {selectedAllocation.hasCarryOver && (
                <span className="badge-carryover bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs">
                  Includes {selectedAllocation.carryOverDays} carryover days
                </span>
              )}
            </div>

            {selectedAllocation.expiryDate && (
              <div className="expiry-warning mt-1 text-xs text-red-600">
                Carryover days expire on{" "}
                {formatDate(selectedAllocation.expiryDate)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
