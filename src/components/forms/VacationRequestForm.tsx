import React from "react";
import { useState, useEffect } from "react";
import { calculateBusinessDays } from "../../utils/date-utils";
import { vacationAllocationService } from "../../services/vacation-allocation.service";

// Tipos de ausencia
enum TimeOffType {
  VACATION = "vacation",
  PERSONAL = "personal",
  SICK = "sick",
  FAMILY = "family",
  OTHER = "other",
}

interface YearAllocation {
  year: number;
  remainingDays: number;
  totalDays: number;
  usedDays: number;
  daysToUse: number;
  carryOverDays?: number;
  expiryDate?: Date;
}

interface VacationRequestFormProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onSubmit: (request: VacationRequest) => void;
}

interface VacationRequest {
  userId: string;
  userName: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  allocations: Array<{ year: number; days: number }>;
  includeHolidays: boolean;
  type: TimeOffType;
}

export default function VacationRequestForm({
  userId,
  userName,
  onClose,
  onSubmit,
}: VacationRequestFormProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [totalDays, setTotalDays] = useState<number>(0);
  const [validationError, setValidationError] = useState<string>("");
  const [yearAllocations, setYearAllocations] = useState<YearAllocation[]>([]);
  const [allocationError, setAllocationError] = useState<string>("");
  const [includeHolidays, setIncludeHolidays] = useState<boolean>(false);
  const [timeOffType, setTimeOffType] = useState<TimeOffType>(
    TimeOffType.VACATION
  );

  // Load user allocations
  useEffect(() => {
    loadUserAllocations();
  }, []);

  // When dates change, recalculate business days
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        setValidationError("End date cannot be before start date");
        return;
      }

      const days = calculateBusinessDays(start, end, includeHolidays);
      setTotalDays(days);
      setValidationError("");

      // Reset day allocations when dates change
      resetDayAllocations();
    }
  }, [startDate, endDate, includeHolidays]);

  // When total days or year allocations change, check if allocation is valid
  useEffect(() => {
    validateAllocation();
  }, [totalDays, yearAllocations]);

  // Load user allocations from service
  const loadUserAllocations = () => {
    // Get available years for user
    const availableYears = vacationAllocationService.getAvailableYears(userId);

    // Get allocation details for each year
    const allocationDetails = availableYears.map((year) => {
      const allocation = vacationAllocationService.getUserAllocation(
        userId,
        year
      );
      return {
        year,
        remainingDays: allocation.remainingDays,
        totalDays: allocation.totalDays,
        usedDays: allocation.usedDays,
        daysToUse: 0,
        carryOverDays: allocation.carryOverDays,
        expiryDate: allocation.expiryDate,
      };
    });

    // Sort by expiring days first, then by oldest year
    allocationDetails.sort((a, b) => {
      // First priority: has expiry date
      if (a.expiryDate && !b.expiryDate) return -1;
      if (!a.expiryDate && b.expiryDate) return 1;

      // Second priority: earlier expiry date
      if (a.expiryDate && b.expiryDate) {
        return a.expiryDate.getTime() - b.expiryDate.getTime();
      }

      // Third priority: oldest year first
      return a.year - b.year;
    });

    setYearAllocations(allocationDetails);
  };

  // Reset day allocations when dates change
  const resetDayAllocations = () => {
    setYearAllocations((prev: YearAllocation[]) =>
      prev.map((allocation: YearAllocation) => ({
        ...allocation,
        daysToUse: 0,
      }))
    );

    // Auto-allocate days if we have total days
    if (totalDays > 0) {
      autoAllocateDays();
    }
  };

  // Auto allocate days based on best practices (expiring days first, oldest years first)
  const autoAllocateDays = () => {
    let remainingDays = totalDays;
    const newAllocations = [...yearAllocations];

    // First, try to use carryover days that expire soonest
    for (let i = 0; i < newAllocations.length && remainingDays > 0; i++) {
      const allocation = newAllocations[i];

      // Skip if no days remaining in this allocation
      if (allocation.remainingDays <= 0) continue;

      // Calculate how many days to use from this allocation
      const daysToUse = Math.min(allocation.remainingDays, remainingDays);

      // Update allocation
      allocation.daysToUse = daysToUse;
      remainingDays -= daysToUse;
    }

    setYearAllocations(newAllocations);
    validateAllocation();
  };

  // Handle manual allocation change
  const handleAllocationChange = (year: number, days: number) => {
    // Update the specific year allocation
    setYearAllocations((prev: YearAllocation[]) =>
      prev.map((allocation: YearAllocation) => {
        if (allocation.year === year) {
          return {
            ...allocation,
            daysToUse: days,
          };
        }
        return allocation;
      })
    );
  };

  // Validate if allocation is correct
  const validateAllocation = () => {
    // Calculate total allocated days
    const allocatedDays = yearAllocations.reduce(
      (sum: number, allocation: YearAllocation) => sum + allocation.daysToUse,
      0
    );

    // Check if allocated days match total days
    if (totalDays > 0 && allocatedDays !== totalDays) {
      setAllocationError(
        `You need to allocate exactly ${totalDays} days. Currently allocated: ${allocatedDays} days.`
      );
      return false;
    }

    // Check if any allocation exceeds available days
    for (const allocation of yearAllocations) {
      if (allocation.daysToUse > allocation.remainingDays) {
        setAllocationError(
          `You can't allocate more than ${allocation.remainingDays} days from ${allocation.year}.`
        );
        return false;
      }
    }

    setAllocationError("");
    return true;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setValidationError("Please select start and end dates");
      return;
    }

    // Validate allocation
    if (!validateAllocation()) {
      return;
    }

    // Filter allocations to only include those with days to use
    const allocationsToSubmit = yearAllocations
      .filter((allocation: YearAllocation) => allocation.daysToUse > 0)
      .map((allocation: YearAllocation) => ({
        year: allocation.year,
        days: allocation.daysToUse,
      }));

    if (allocationsToSubmit.length === 0) {
      setAllocationError("You need to allocate days from at least one year");
      return;
    }

    // Create request object
    const request: VacationRequest = {
      userId,
      userName,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalDays,
      reason: "",
      allocations: allocationsToSubmit,
      includeHolidays,
      type: timeOffType,
    };

    // Submit the request
    onSubmit(request);
  };

  return (
    <div className="p-5 bg-white rounded-lg border border-gray-100 shadow-md max-w-lg mx-auto">
      <h2 className="mt-0 text-gray-800 border-b border-gray-100 pb-2.5 mb-5 text-xl font-semibold">
        Request Time Off
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Sección 1: Información básica */}
        <section className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-base font-medium text-gray-700 mb-3 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Request Details
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="userName"
                className="block font-medium mb-1.5 text-gray-700 text-sm"
              >
                Employee
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label
                htmlFor="timeOffType"
                className="block font-medium mb-1.5 text-gray-700 text-sm"
              >
                Type of Time Off
              </label>
              <select
                id="timeOffType"
                value={timeOffType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setTimeOffType(e.target.value as TimeOffType)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value={TimeOffType.VACATION}>Vacation</option>
                <option value={TimeOffType.PERSONAL}>Personal Day</option>
                <option value={TimeOffType.SICK}>Sick Leave</option>
                <option value={TimeOffType.FAMILY}>Family Care</option>
                <option value={TimeOffType.OTHER}>Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Sección 2: Selección de fechas */}
        <section className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-base font-medium text-gray-700 mb-3 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Date Selection
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="startDate"
                className="block font-medium mb-1.5 text-gray-700 text-sm"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setStartDate(e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block font-medium mb-1.5 text-gray-700 text-sm"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEndDate(e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                min={startDate || new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          <div className="flex items-center bg-white p-2 rounded-md border border-gray-200">
            <input
              type="checkbox"
              id="includeHolidays"
              checked={includeHolidays}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setIncludeHolidays(e.target.checked)
              }
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label
              htmlFor="includeHolidays"
              className="ml-2 block text-sm text-gray-700"
            >
              Include holidays and non-working days
              <span className="text-xs text-gray-500 ml-1">
                (Check if you work on holidays)
              </span>
            </label>
          </div>
        </section>

        {/* Sección 4: Asignación de días (solo se muestra si hay fechas seleccionadas) */}
        {startDate && endDate && totalDays > 0 && (
          <section className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-base font-medium text-gray-700 mb-3 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Time Off Allocation
            </h3>

            <div className="flex justify-between items-center mb-4 p-3 bg-white rounded-md border border-gray-200">
              <span className="text-gray-700 font-medium">
                Total days requested:
              </span>
              <span className="font-semibold text-lg text-primary-600">
                {totalDays}
              </span>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Allocate Days From Available Years:
                </h4>
                <button
                  type="button"
                  onClick={autoAllocateDays}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Auto-Allocate
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {yearAllocations.map((allocation: YearAllocation) => (
                  <div
                    key={allocation.year}
                    className="p-3 bg-white rounded-md border border-gray-200 transition-all hover:shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                          {allocation.year}
                        </span>
                        <span className="text-xs text-gray-500">
                          {allocation.remainingDays} of {allocation.totalDays}{" "}
                          days available
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 text-sm text-gray-600">
                          Days:
                        </span>
                        <input
                          type="number"
                          id={`year-${allocation.year}`}
                          value={allocation.daysToUse}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleAllocationChange(
                              allocation.year,
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="0"
                          max={allocation.remainingDays}
                          className="px-2 py-1 w-16 text-center border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    {(allocation.carryOverDays &&
                      allocation.carryOverDays > 0) ||
                    allocation.expiryDate ? (
                      <div className="flex flex-wrap gap-2 mt-1 mb-2">
                        {allocation.carryOverDays &&
                          allocation.carryOverDays > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                />
                              </svg>
                              {allocation.carryOverDays} carryover days
                            </span>
                          )}
                        {allocation.expiryDate && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Expires:{" "}
                            {allocation.expiryDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ) : null}

                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary-600 h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            ((allocation.usedDays + allocation.daysToUse) /
                              allocation.totalDays) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Used: {allocation.usedDays} days</span>
                      <span>Selected: {allocation.daysToUse} days</span>
                    </div>
                  </div>
                ))}
              </div>

              {allocationError && (
                <div className="p-2 mt-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  {allocationError}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Errores de validación */}
        {validationError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {validationError}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            disabled={!!validationError || !!allocationError || !totalDays}
          >
            Request Time Off
          </button>
        </div>
      </form>
    </div>
  );
}
