import { api, handleApiError } from "./api";
import axiosInstance from "./axiosInstance";

const customerGroupApi = {
  // Lấy danh sách nhóm khách hàng (có phân trang)
  // GetPagedListCustomerGroup?PageNumber=1&PageSize=10
  getPagedList: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(
        `${api}/CustomerGroup/GetPagedListCustomerGroup`,
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy chi tiết nhóm khách hàng
  // GetCustomerGroupById?Id=1
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(
        `${api}/CustomerGroup/GetCustomerGroupById`,
        {
          params: { Id: id },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Tạo mới nhóm khách hàng
  // CreateCustomerGroup (Body: { name })
  create: async (data) => {
    try {
      const response = await axiosInstance.post(
        `${api}/CustomerGroup/CreateCustomerGroup`,
        {
          name: data.name,
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Cập nhật nhóm khách hàng
  // UpdateCustomerGroup (Body: { id, name })
  update: async (data) => {
    try {
      const response = await axiosInstance.put(
        `${api}/CustomerGroup/UpdateCustomerGroup`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Xóa nhóm khách hàng
  // DeleteCustomerGroup?Id=1
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(
        `${api}/CustomerGroup/DeleteCustomerGroup`,
        {
          params: { Id: id },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy lưới chi tiêu nhóm
  getSpendGrid: async (groupId, year, month) => {
    try {
      const response = await axiosInstance.get(
        `${api}/customers/groups/${groupId}/spend-grid`,
        {
          params: { year, month },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy danh sách thanh toán thủ công cho nhóm
  getManualPayments: async (groupId, year, month) => {
    try {
      const response = await axiosInstance.get(
        `${api}/customers/groups/${groupId}/manual-payments`,
        {
          params: { year, month },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Tạo thanh toán thủ công cho nhóm
  createManualPayment: async (data) => {
    try {
      const response = await axiosInstance.post(
        `${api}/customers/groups/manual-payments`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Xóa thanh toán thủ công cho nhóm
  deleteManualPayment: async (id) => {
    try {
      const response = await axiosInstance.delete(
        `${api}/customers/groups/manual-payments/${id}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default customerGroupApi;
