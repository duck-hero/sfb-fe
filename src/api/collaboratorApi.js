import { api, handleApiError } from "./api";
import axiosInstance from "./axiosInstance";

const collaboratorApi = {
  // Lấy danh sách CTV (có phân trang)
  getPagedList: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(
        `${api}/Collaborator/GetPagedListCollaborator`,
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

  // Tạo mới CTV
  create: async (data) => {
    try {
      const response = await axiosInstance.post(
        `${api}/Collaborator/CreateCollaborator`,
        {
          code: data.code,
          name: data.name,
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Cập nhật CTV
  update: async (data) => {
    try {
      const response = await axiosInstance.put(
        `${api}/Collaborator/UpdateCollaborator`,
        {
          id: data.id,
          code: data.code,
          name: data.name,
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Xóa CTV
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(
        `${api}/Collaborator/DeleteCollaborator`,
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

export default collaboratorApi;
