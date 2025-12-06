import axios from "axios";
import { api } from "./api";
import axiosInstance from "./axiosInstance";

const transactionHistoryApi = {
  // Lấy danh sách lịch sử giao dịch
getTransactionHistoryList: async (
  cursor,
  pageSize = 20,
  sortOrder,
  fromEffectiveDate,
  toEffectiveDate,
  fbTransactionCode,
  transactionType,
  fbAccountId,
  isFbTransaction,
  isAmountMismatched,
  bankAccountId
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

    // FB filters
    if (fbTransactionCode) params.FbTransactionCode = fbTransactionCode;
    if (transactionType) params.TransactionType = transactionType;
    if (fbAccountId) params.FbAccountId = fbAccountId;

    // Boolean filters
    if (isFbTransaction !== undefined) params.IsFbTransaction = isFbTransaction;
    if (isAmountMismatched !== undefined) params.IsAmountMismatched = isAmountMismatched;

    // Bank Account
    if (bankAccountId) params.BankAccountId = bankAccountId;

    const response = await axiosInstance.get(
      `${api}/TransactionHistory/GetTransactionHistoriesByCursor`,
      { params }
    );

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
},

};

export default transactionHistoryApi;
