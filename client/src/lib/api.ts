//API service for connecting to the backend
const API_BASE_URL = 'http://localhost:8000';

export interface User {
  email: string;
  username: string;
  company_name?: string;
  phone_number?: string;
}

export interface AuthResponse {
 success: boolean;
  message: string;
  session_id?: string;
  user?: User;
}

export const api = {
  // Authentication endpoints
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
}

return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData: { email: string; password: string; username: string; company_name?: string; phone_number?: string }): Promise<AuthResponse>=> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registrationfailed');
      }

return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // GST extraction endpoints
  extractGST: `${API_BASE_URL}/api/extract-gst`,
  downloadExcel: `${API_BASE_URL}/api/download-excel`,
health: `${API_BASE_URL}/health`,

  // Helper function to check if backend is running
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health checkfailed:', error);
      return false;
    }
  },

  // Function to upload files and extract GST data
  uploadInvoices: async (files: File[], sessionId: string) => {
    const formData = new FormData();
   files.forEach(file => {
      formData.append('files', file);
    });

    try{
      const response = await fetch(`${API_BASE_URL}/api/extract-gst?session_id=${sessionId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData =await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

return await response.json();
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  },

  // Function to download the generated Excel file
downloadExcelFile: async (sessionId: string,reportId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/download-excel?session_id=${sessionId}&report_id=${reportId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
     const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'GST_Invoices_Extract.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
} catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }
};
