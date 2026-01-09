import { api, handleApiError } from "./api";
import axiosInstance from "./axiosInstance";

const customerApi = {
  // Lấy danh sách khách hàng (có phân trang & tìm kiếm theo Name)
  // Customer/GetPagedListCustomer?Name=a&PageNumber=1&PageSize=10
  getCustomerList: async (pageNumber = 1, pageSize = 10, name = null, customerGroupId = null, operatorUserId = null, onlyCustomerNoGroup = null) => {
    try {
      const response = await axiosInstance.get(
        `${api}/Customer/GetPagedListCustomer`,
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
            Name: name || null,
            CustomerGroupId: customerGroupId || null,
            OperatorUserId: operatorUserId || null,
            OnlyCustomerNoGroup: onlyCustomerNoGroup,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy chi tiết khách hàng
  // Customer/GetCustomerById?Id=1
  getCustomerById: async (id) => {
    try {
      const response = await axiosInstance.get(
        `${api}/Customer/GetCustomerById`,
        {
          params: { Id: id },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Tạo mới khách hàng
  // Customer/CreateCustomer (Body: { name, agencyCode })
  createCustomer: async (data) => {
    try {
      const response = await axiosInstance.post(
        `${api}/Customer/CreateCustomer`,
        {
          name: data.name,
          agencyCode: data.agencyCode,
          customerGroupId: data.customerGroupId || null,
          operatorUserId: data.operatorUserId || null,
          collaboratorId: data.collaboratorId || null,
          collaboratorRate: data.collaboratorRate || null,
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Cập nhật khách hàng
  // Customer/UpdateCustomer (Body: { id, name, agencyCode })
  updateCustomer: async (id, data) => {
    try {
      const response = await axiosInstance.put(
        `${api}/Customer/UpdateCustomer`,
        {
          id: id,
          name: data.name,
          agencyCode: data.agencyCode,
          customerGroupId: data.customerGroupId || null,
          operatorUserId: data.operatorUserId || null,
          collaboratorId: data.collaboratorId || null,
          collaboratorRate: data.collaboratorRate || null,
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Xóa khách hàng
  // Customer/DeleteCustomer?Id=1
  deleteCustomer: async (id) => {
    try {
      const response = await axiosInstance.delete(
        `${api}/Customer/DeleteCustomer`,
        {
          params: { Id: id },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy dữ liệu đối soát công nợ tháng của khách hàng
  // /api/customers/invoices/reconciliation?year=2025&month=12&pageSize=10&cursor=...
  getMonthlyReconciliation: async (year, month, pageSize = 10, cursor = null, day = null) => {
    try {
      const response = await axiosInstance.get(
        `${api}/customers/invoices/reconciliation`,
        {
          params: {
            year,
            month,
            day, // Thêm param day
            pageSize,
            cursor,
            sortOrder: "desc",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy danh sách thanh toán thủ công
  // /api/customers/{customerId}/manual-payments?year=2025&month=12
  getManualPayments: async (customerId, year, month) => {
    try {
      const response = await axiosInstance.get(
        `${api}/customers/${customerId}/manual-payments`,
        {
          params: { year, month },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Tạo mới thanh toán thủ công
  // body { customerId, amount, year, month, date, note }
  createManualPayment: async (data) => {
    try {
      const response = await axiosInstance.post(
        `${api}/customers/manual-payments`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Xóa thanh toán thủ công
  deleteManualPayment: async (id) => {
    try {
      const response = await axiosInstance.delete(
        `${api}/customers/manual-payments/${id}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  // Lấy chi tiết chi tiêu của các khách hàng trong nhóm
  // /api/customers/groups/{customerGroupId}/invoices/spend-summary?year=2025&month=12
  getGroupSpendSummary: async (customerGroupId, year, month) => {
    try {
      const response = await axiosInstance.get(
        `${api}/customers/groups/${customerGroupId}/invoices/spend-summary`,
        {
          params: { year, month },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default customerApi;
