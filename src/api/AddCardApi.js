import { api } from "./api";
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
      throw error.response ? error.response.data : error.message;
    }
  },
};

export default AddCardApi;
