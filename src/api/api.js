const api = import.meta.env.VITE_API_URL;
const accountAPI = import.meta.env.VITE_ACCOUNT_API_URL;

// Helper to handle API errors consistently
const handleApiError = (error) => {
  if (error.response && error.response.data) {
    const data = error.response.data;
    
    // 1. Check for specific "errors" array format (e.g. from user example)
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      // Return the description of the first error
      const firstError = data.errors[0];
      if (firstError.description) {
        return firstError.description;
      }
    }
    
    // 2. Check for "message" field
    if (data.message) {
      return data.message;
    }

    // 3. Fallback: return data if it's a string, or stringify it, or just return the object?
    // Usually raw object is not good for UI. 
    // If we want to return the raw object for complex handling upstream, we can, 
    // but the request asked to "read the error properly".
    // For now, let's return the whole data object if we can't parse a string,
    // OR return a generic message if it's an object we don't understand.
    // However, existing code was throwing `error.response.data`.
    // Let's stick closer to "extract info if possible, else return raw".
    return data;
  }
  
  return error.message || "Đã xảy ra lỗi không xác định";
};

export { api, accountAPI, handleApiError };
