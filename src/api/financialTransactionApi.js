import { api, handleApiError } from "./api";
import axiosInstance from "./axiosInstance";

const financialTransactionApi = {
  getFinancialTransactionByCursor: async (
    cursor,
    pageSize = 20,
    sortOrder,
    fromEffectiveDate,
    toEffectiveDate,
    transactionCode,
    transactionType,
    bankAccountId,
    bankAccountType
  ) => {
    try {
      const params = {};

      if (cursor !== null && cursor !== undefined) params.Cursor = cursor;
      params.PageSize = pageSize;

      if (sortOrder) params.SortOrder = sortOrder;
      if (fromEffectiveDate) params.FromEffectiveDate = fromEffectiveDate;
      if (toEffectiveDate) params.ToEffectiveDate = toEffectiveDate;

      if (transactionCode) params.TransactionCode = transactionCode;
      if (transactionType) params.TransactionType = transactionType;
      if (bankAccountId) params.BankAccountId = bankAccountId;

      if (bankAccountType !== null && bankAccountType !== undefined) {
        params.BankAccountType = bankAccountType;
      }

      const response = await axiosInstance.get(
        `${api}/FinancialTransaction/GetFinancialTransactionByCursor`,
        { params }
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default financialTransactionApi;


