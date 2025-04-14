import { useState, useEffect } from "react";
import { VacationService } from "../services/vacation.service";
import { VacationAllocationService } from "../services/vacation-allocation.service";
import VacationYearSelector from "./VacationYearSelector";

interface RequestVacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onVacationRequested: () => void;
}

export default function RequestVacationModal({
  isOpen,
  onClose,
  userId,
  onVacationRequested,
}: RequestVacationModalProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [allocationYear, setAllocationYear] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset form on modal open
  useEffect(() => {
    if (isOpen) {
      setStartDate("");
      setEndDate("");
      setReason("");
      setError(null);
    }
  }, [isOpen]);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const vacationService = VacationService.getInstance();

    return vacationService.calculateWorkingDays(start, end);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError("Please select start and end dates");
      return;
    }

    if (!allocationYear) {
      setError("Please select a year for allocation");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validation
    if (end < start) {
      setError("End date cannot be before start date");
      return;
    }

    const days = calculateDays();

    // Check if user has enough days
    const allocationService = VacationAllocationService.getInstance();
    if (
      !allocationService.hasEnoughDaysAvailable(userId, allocationYear, days)
    ) {
      setError(`Not enough vacation days available for ${allocationYear}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create vacation request
      const vacationService = VacationService.getInstance();
      const success = vacationService.requestVacation({
        userId,
        startDate: start,
        endDate: end,
        reason: reason || "Vacation",
        status: "pending",
        allocationYear,
      });

      if (success) {
        // Update the user's allocation
        allocationService.updateAllocation(userId, allocationYear, days);
        onVacationRequested();
        onClose();
      } else {
        setError("Failed to create vacation request");
      }
    } catch (err) {
      setError(
        `An error occurred: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Request Time Off</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="start-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="end-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          {startDate && endDate && (
            <div className="mb-4 p-2 bg-gray-50 rounded">
              <p className="text-sm">
                Working days: <strong>{calculateDays()}</strong>
              </p>
            </div>
          )}

          <VacationYearSelector
            userId={userId}
            onYearSelected={setAllocationYear}
            className="mb-4"
          />

          <div className="mb-4">
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reason (optional)
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              rows={3}
            />
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Request Time Off"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
