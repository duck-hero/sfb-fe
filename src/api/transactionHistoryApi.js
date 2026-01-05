import { api, handleApiError } from "./api";
import axiosInstance from "./axiosInstance";

const transactionHistoryApi = {
  // Lấy danh sách lịch sử giao dịch
getTransactionHistoryList: async (
  cursor,
  pageSize = 20,
  sortOrder,
  fromEffectiveDate,
  toEffectiveDate,
  searchTerm,
  transactionType,
  fbAccountId,
  isFbTransaction,
  isAmountMismatched,
  bankAccountId,
  adAccountId, // New param
  bankCardId, // New param
  bankAccountType, // New param (per tab)
  accountingObject // New param
) => {
  try {
    const params = {};

    // Cursor-based pagination
    if (cursor) params.Cursor = cursor;

    // Page size
    params.PageSize = pageSize;

    // Sorting
    if (sortOrder) params.SortOrder = sortOrder;

    // Date filters
    if (fromEffectiveDate) params.FromEffectiveDate = fromEffectiveDate;
    if (toEffectiveDate) params.ToEffectiveDate = toEffectiveDate;

    // Search term
    if (searchTerm) params.SearchTerm = searchTerm;
    if (transactionType) params.TransactionType = transactionType;
    if (fbAccountId) params.FbAccountId = fbAccountId;

    // Boolean filters
    if (isFbTransaction !== undefined) params.IsFbTransaction = isFbTransaction;
    if (isAmountMismatched !== undefined) params.IsAmountMismatched = isAmountMismatched;

    // Bank Account
    if (bankAccountId) params.BankAccountId = bankAccountId;

    // Ad Account ID
    if (adAccountId) params.AdAccountId = adAccountId;
    
    // Bank Card ID
    if (bankCardId) params.BankCardId = bankCardId;

    // Bank Account Type
    if (bankAccountType !== undefined && bankAccountType !== null) {
      params.BankAccountType = bankAccountType;
    }

    // Accounting Object
    if (accountingObject) params.AccountingObject = accountingObject;

    const response = await axiosInstance.get(
      `${api}/TransactionHistory/GetTransactionHistoriesByCursor`,
      { params }
    );

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
},

  // Lấy thống kê số lượng giao dịch
  getTransactionHistoryCount: async (
    sortOrder,
    fromEffectiveDate,
    toEffectiveDate,
    searchTerm,
    transactionType,
    fbAccountId,
    isFbTransaction,
    isAmountMismatched,
    bankAccountId,
    adAccountId,
    bankCardId,
    bankAccountType,
    accountingObject
  ) => {
    try {
      const params = {};

      // Sorting
      if (sortOrder) params.SortOrder = sortOrder;

      // Date filters
      if (fromEffectiveDate) params.FromEffectiveDate = fromEffectiveDate;
      if (toEffectiveDate) params.ToEffectiveDate = toEffectiveDate;

      // Search term
      if (searchTerm) params.SearchTerm = searchTerm;
      if (transactionType) params.TransactionType = transactionType;
      if (fbAccountId) params.FbAccountId = fbAccountId;

      // Boolean filters
      if (isFbTransaction !== undefined) params.IsFbTransaction = isFbTransaction;
      if (isAmountMismatched !== undefined) params.IsAmountMismatched = isAmountMismatched;

      // Bank Account
      if (bankAccountId) params.BankAccountId = bankAccountId;

      // Ad Account ID
      if (adAccountId) params.AdAccountId = adAccountId;
      
      // Bank Card ID
      if (bankCardId) params.BankCardId = bankCardId;

      // Bank Account Type
      if (bankAccountType !== undefined && bankAccountType !== null) {
        params.BankAccountType = bankAccountType;
      }

      // Accounting Object
      if (accountingObject) params.AccountingObject = accountingObject;

      const response = await axiosInstance.get(
        `${api}/TransactionHistory/GetTransactionHistoryCount`,
        { params }
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Đồng bộ thẻ
  syncAddCard: async (
    sortOrder,
    fromEffectiveDate,
    toEffectiveDate,
    searchTerm,
    transactionType,
    fbAccountId,
    isFbTransaction,
    isAmountMismatched,
    bankAccountId,
    adAccountId,
    bankCardId,
    bankAccountType,
    accountingObject
  ) => {
    try {
      const data = {};

      // Sorting
      if (sortOrder) data.SortOrder = sortOrder;

      // Date filters
      if (fromEffectiveDate) data.FromEffectiveDate = fromEffectiveDate;
      if (toEffectiveDate) data.ToEffectiveDate = toEffectiveDate;

      // Search term
      if (searchTerm) data.SearchTerm = searchTerm;
      if (transactionType) data.TransactionType = transactionType;
      if (fbAccountId) data.FbAccountId = fbAccountId;

      // Boolean filters
      if (isFbTransaction !== undefined) data.IsFbTransaction = isFbTransaction;
      if (isAmountMismatched !== undefined) data.IsAmountMismatched = isAmountMismatched;

      // Bank Account
      if (bankAccountId) data.BankAccountId = bankAccountId;

      // Ad Account ID
      if (adAccountId) data.AdAccountId = adAccountId;
      
      // Bank Card ID
      if (bankCardId) data.BankCardId = bankCardId;

      // Bank Account Type
      if (bankAccountType !== undefined && bankAccountType !== null) {
        data.BankAccountType = bankAccountType;
      }

      // Accounting Object
      if (accountingObject) data.AccountingObject = accountingObject;

      const response = await axiosInstance.post(
        `${api}/TransactionHistory/SyncAddCard`,
        data
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Cập nhật giao dịch
  updateTransaction: async (data) => {
    try {
      const response = await axiosInstance.put(
        `${api}/TransactionHistory/UpdateTransaction`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Export Excel
  exportExcel: async (
    sortOrder,
    fromEffectiveDate,
    toEffectiveDate,
    searchTerm,
    transactionType,
    fbAccountId,
    isFbTransaction,
    isAmountMismatched,
    bankAccountId,
    adAccountId,
    bankCardId,
    bankAccountType,
    accountingObject
  ) => {
    try {
      const params = {};

      // Sorting
      if (sortOrder) params.SortOrder = sortOrder;

      // Date filters
      if (fromEffectiveDate) params.FromEffectiveDate = fromEffectiveDate;
      if (toEffectiveDate) params.ToEffectiveDate = toEffectiveDate;

      // Search term
      if (searchTerm) params.SearchTerm = searchTerm;
      if (transactionType) params.TransactionType = transactionType;
      if (fbAccountId) params.FbAccountId = fbAccountId;

      // Boolean filters
      if (isFbTransaction !== undefined) params.IsFbTransaction = isFbTransaction;
      if (isAmountMismatched !== undefined) params.IsAmountMismatched = isAmountMismatched;

      // Bank Account
      if (bankAccountId) params.BankAccountId = bankAccountId;

      // Ad Account ID
      if (adAccountId) params.AdAccountId = adAccountId;
      
      // Bank Card ID
      if (bankCardId) params.BankCardId = bankCardId;

      // Bank Account Type
      if (bankAccountType !== undefined && bankAccountType !== null) {
        params.BankAccountType = bankAccountType;
      }

      // Accounting Object
      if (accountingObject) params.AccountingObject = accountingObject;

      const response = await axiosInstance.get(
        `${api}/TransactionHistory/ExportExcel`,
        { 
          params,
          responseType: 'blob' // Important for file download
        }
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

};

export default transactionHistoryApi;
