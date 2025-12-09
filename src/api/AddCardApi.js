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
};

export default AddCardApi;
