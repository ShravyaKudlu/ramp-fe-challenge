import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const [employeeId, setEmployeeId] = useState<string | null>(null) 
  const [currentPage, setCurrentPage] = useState<number>(0) 

  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions(employeeId, currentPage)
  const [isLoading, setIsLoading] = useState(false)

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? null,
    [paginatedTransactions]
  )

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true)
    await employeeUtils.fetchAll() 
    await paginatedTransactionsUtils.fetchAll() 
    setIsLoading(false)
  }, [employeeUtils, paginatedTransactionsUtils])

  const loadNextPage = useCallback(async () => {
    if (paginatedTransactions?.nextPage !== null) {
      setCurrentPage(prevPage => prevPage + 1) 
      await paginatedTransactionsUtils.fetchAll() 
    }
  }, [paginatedTransactions, paginatedTransactionsUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      setCurrentPage(0) 
      setEmployeeId(employeeId) 
    },
    []
  )

  
  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions() 
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
            await loadTransactionsByEmployee(newValue.id) 
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
                await loadNextPage() 
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
