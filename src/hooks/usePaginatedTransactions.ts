import { useCallback, useState, useEffect } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(employeeId: string | null, currentPage: number): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<Transaction[]> | null>(null)

  const fetchAll = useCallback(async () => {
    const params: PaginatedRequestParams & { employeeId?: string } = {
      page: currentPage, 
    }
    if (employeeId) {
      params.employeeId = employeeId
    }

    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams & { employeeId?: string }>(
      "paginatedTransactions",
      params
    )
    setPaginatedTransactions(response)
  }, [fetchWithCache, employeeId, currentPage])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [employeeId, currentPage, fetchAll])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
