import {
  PaginatedRequestParams,
  PaginatedResponse,
  RequestByEmployeeParams,
  SetTransactionApprovalParams,
  Transaction,
  Employee,
} from "./types";
import mockData from "../mock-data.json";

const data: { employees: Employee[]; transactions: Transaction[] } = {
  employees: mockData.employees,
  transactions: mockData.transactions,
};

// Get all employees
export const getEmployees = (): Employee[] => data.employees;

// Get transactions with pagination
export const getTransactionsPaginated = ({
  page,
  employeeId, // Added employeeId as a parameter here
}: PaginatedRequestParams & RequestByEmployeeParams): PaginatedResponse<Transaction[]> => {
  const transactionsPerPage = parseInt(process.env.REACT_APP_TRANSACTIONS_PER_PAGE || "5");
  if (page === null) {
    throw new Error("Page cannot be null");
  }

  // If employeeId is provided, filter transactions by employee
  let filteredTransactions = data.transactions;
  if (employeeId) {
    filteredTransactions = getTransactionsByEmployee({ employeeId });
  }

  const start = page * transactionsPerPage;
  const end = start + transactionsPerPage;

  if (start > filteredTransactions.length) {
    throw new Error(`Invalid page ${page}`);
  }

  const nextPage = end < filteredTransactions.length ? page + 1 : null;

  return {
    nextPage,
    data: filteredTransactions.slice(0, end), // Correct slice range
  };
};

// Get transactions by a specific employee
export const getTransactionsByEmployee = ({
  employeeId,
}: RequestByEmployeeParams): Transaction[] => {
  if (!employeeId) {
    return data.transactions;
  }

  return data.transactions.filter((transaction) => transaction.employee.id === employeeId);
};

// Set the approval status for a specific transaction
export const setTransactionApproval = ({
  transactionId,
  value,
}: SetTransactionApprovalParams): void => {
  const transaction = data.transactions.find(
    (currentTransaction) => currentTransaction.id === transactionId
  );

  if (!transaction) {
    throw new Error("Invalid transaction to approve");
  }

  transaction.approved = value;
};
