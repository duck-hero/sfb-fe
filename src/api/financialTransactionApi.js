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

  updateFinancialTransaction: async (id, data) => {
    try {
      // data can be an object with { accountingObject, isCustomerPay, customerId }
      // Or if legacy call passes string, handle that too (though we will update usage)
      const payload = { id };
      if (typeof data === 'string') {
          payload.accountingObject = data;
      } else {
          // Spread valid fields
          if (data.accountingObject !== undefined) payload.accountingObject = data.accountingObject;
          if (data.customerId !== undefined) payload.customerId = data.customerId;
          if (data.customerGroupId !== undefined) payload.customerGroupId = data.customerGroupId;
          if (data.paymentSource !== undefined) payload.paymentSource = data.paymentSource;
      }

      const response = await axiosInstance.put(
        `${api}/FinancialTransaction/UpdateFinancialTransaction`,
        payload
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

};

export default financialTransactionApi;


