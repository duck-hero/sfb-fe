import { api, handleApiError } from "./api"; // Updated import
import axiosInstance from "./axiosInstance";

const adsAccountApi = {
  // Lấy danh sách tài khoản (có phân trang)
  getAdsAccountList: async (pageNumber = 1, pageSize = 10, searchTerm, status, bmAccountId, bmWorking) => {
    try {
      const params = { PageNumber: pageNumber, PageSize: pageSize };
      if (searchTerm) params.SearchTerm = searchTerm;
      if (status) params.Status = status;
      if (bmAccountId) params.BmAccountId = bmAccountId;
      if (bmWorking !== null && bmWorking !== undefined) params.BmWorking = bmWorking;


      const response = await axiosInstance.get(
        `${api}/AdsAccount/GetPagedListAdAccount`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  // Lấy thông tin tài khoản theo Id
  getAdsAccountById: async (id) => {
    try {
      const response = await axiosInstance.get(`${api}/AdsAccount/GetAdAccountById`, {
        params: { Id: id },
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Cập nhật thông tin
  updateAdsAccount: async (adsAccountData) => {
    try {
      const response = await axiosInstance.put(`${api}/AdsAccount/UpdateAdAccount`, adsAccountData);

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Xóa thông tin tài khoản theo Id
  deleteAdsAccountById: async (id) => {
    try {
      const response = await axiosInstance.delete(`${api}/AdsAccount/DeleteAdAccount`, {
        params: { Id: id },
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  // Thêm mới
  createAdsAccount: async (adAccountName, adAccountIdNumber, bmAccountId, bmWorking) => {
    try {
      const response = await axiosInstance.post(`${api}/AdsAccount/CreateAdAccount`, {
        adAccountName: adAccountName,
        adAccountIdNumber: adAccountIdNumber,
        bmAccountId: bmAccountId,
        bmWorking: bmWorking,
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Import Ads Accounts
  importAdsAccounts: async (formData) => {
    try {
      const response = await axiosInstance.post(`${api}/AdsAccount/ImportAdsAccount`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Import Ads Accounts Current Spend
  importAdsAccountCurrentSpend: async (formData, onUploadProgress) => {
    try {
      const response = await axiosInstance.post(`${api}/AdsAccount/ImportAdsAccountCurrentSpend`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Ghi nhận cắn ngưỡng
  recordThresholdEating: async (data) => {
    try {
      const response = await axiosInstance.post(`${api}/AdsAccount/record-threshold-eating`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy lịch sử khách hàng đã thuê tài khoản này
  getHistoricalCustomers: async (id) => {
    try {
      const response = await axiosInstance.get(`${api}/AdsAccount/${id}/historical-customers`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Lấy thống kê ngưỡng
  getThresholdStats: async (year, month) => {
    try {
      const response = await axiosInstance.get(`${api}/AdsAccount/threshold-stats`, {
        params: { Year: year, Month: month },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Cập nhật thống kê ngưỡng
  updateThresholdStats: async (data) => {
    try {
      const response = await axiosInstance.put(`${api}/AdsAccount/threshold-stats`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Import lịch sử dư nợ
  importAdsAccountDebtHistory: async (formData, year, month) => {
    try {
      if (year) formData.append('Year', year);
      if (month) formData.append('Month', month);

      const response = await axiosInstance.post(`${api}/AdsAccount/ImportAdsAccountDebtHistory`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default adsAccountApi;
