import { useCallback, useState, useEffect } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(employeeId: string | null, currentPage: number): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<Transaction[]> | null>(null)

  // Fetch transactions whenever employeeId or currentPage changes
  useEffect(() => {
    fetchAll() // Re-fetch whenever employeeId or currentPage changes
  }, [employeeId, currentPage])

  // Fetch paginated transactions
  const fetchAll = useCallback(async () => {
    const params: PaginatedRequestParams & { employeeId?: string } = {
      page: currentPage, // Use currentPage for pagination
    }

    // If employeeId is provided, include it in the params
    if (employeeId) {
      params.employeeId = employeeId
    }

    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams & { employeeId?: string }>(
      "paginatedTransactions",
      params
    )

    // Update state with the response
    setPaginatedTransactions(response)
  }, [fetchWithCache, employeeId, currentPage])

  // Invalidate the cached data when needed
  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
