export function getErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred';
  
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle network errors
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Cannot connect to server. Please check if the backend is running.';
  }
  
  if (error?.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail.map(err => {
        if (typeof err === 'string') return err;
        return err.msg || err.message || 'Validation error';
      }).join(', ');
    }
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}