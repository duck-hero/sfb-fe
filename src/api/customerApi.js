import { api, handleApiError } from "./api";
import axiosInstance from "./axiosInstance";

const customerApi = {
  // Lấy danh sách khách hàng (có phân trang & tìm kiếm theo Name)
  // Customer/GetPagedListCustomer?Name=a&PageNumber=1&PageSize=10
  getCustomerList: async (pageNumber = 1, pageSize = 10, name = "") => {
    try {
      const response = await axiosInstance.get(
        `${api}/Customer/GetPagedListCustomer`,
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
            Name: name,
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
  // Customer/CreateCustomer (Body: { name, codeCamp })
  createCustomer: async (data) => {
    try {
      const response = await axiosInstance.post(
        `${api}/Customer/CreateCustomer`,
        {
          name: data.name,
          codeCamp: data.codeCamp,
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Cập nhật khách hàng
  // Customer/UpdateCustomer (Body: { id, name, codeCamp })
  updateCustomer: async (id, data) => {
    try {
      const response = await axiosInstance.put(
        `${api}/Customer/UpdateCustomer`,
        {
          id: id,
          name: data.name,
          codeCamp: data.codeCamp,
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
};

export default customerApi;
