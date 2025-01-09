import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const [employeeId, setEmployeeId] = useState<string | null>(null) // Employee id (can be null if no filter)
  const [currentPage, setCurrentPage] = useState<number>(0) // Track the current page for pagination

  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions(employeeId, currentPage)
  const [isLoading, setIsLoading] = useState(false)

  // Use memoization to choose transactions from either paginated or employee-filtered
  const transactions = useMemo(
    () => paginatedTransactions?.data ?? null,
    [paginatedTransactions]
  )

  // Load all transactions when employee or pagination changes
  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true)
    await employeeUtils.fetchAll() // Fetch employees
    await paginatedTransactionsUtils.fetchAll() // Fetch transactions for current page
    setIsLoading(false)
  }, [employeeUtils, paginatedTransactionsUtils])

  // Handle the pagination "View More" button
  const loadNextPage = useCallback(async () => {
    if (paginatedTransactions?.nextPage !== null) {
      setCurrentPage(prevPage => prevPage + 1) // Increment the current page
      await paginatedTransactionsUtils.fetchAll() // Fetch the next page of transactions
    }
  }, [paginatedTransactions, paginatedTransactionsUtils])

  // Reset pagination when employee changes
  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      setCurrentPage(0) // Reset to page 0 when switching employees
      setEmployeeId(employeeId) // Set the new employee id
    },
    []
  )

  // Effect to load data if employees are null and not loading
  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions() // Load all transactions if employees are not available
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        {/* Input to filter transactions by employee */}
        <InputSelect<Employee>
          isLoading={isLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }
            if (newValue === EMPTY_EMPLOYEE) {
              setEmployeeId(null) // Clear employeeId to show all transactions
              return loadAllTransactions() // Reload all transactions
            }
            await loadTransactionsByEmployee(newValue.id) // Load transactions by employee
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          {/* Display the transactions */}
          <Transactions transactions={transactions} />

          {transactions !== null && (
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading || !paginatedTransactions?.nextPage}
              onClick={async () => {
                await loadNextPage() // Load the next page when clicked
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
