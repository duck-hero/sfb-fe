import { api, handleApiError } from "./api"; // Updated import
import axiosInstance from "./axiosInstance";

const AddCardApi = {
  // Add card to transaction
  addCard: async (transactionId, bankAccountId, fbAccountId, cardLastDigits) => {
    try {
      const response = await axiosInstance.post(
        `${api}/AddCard/AddCardWeb`,
        {
          transactionId,
          bankAccountId,
          fbAccountId,
          cardLastDigits,
        }
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update add card status
  updateAddCard: async (id, status) => {
    try {
      const response = await axiosInstance.put(
        `${api}/AddCard/UpdateAddCard`,
        {
          id,
          status,
        }
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default AddCardApi;
