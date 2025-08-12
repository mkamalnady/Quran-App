// رابط الخادم الأساسي
export const API_BASE_URL = "https://quran-app-8ay9.onrender.com/api";

export const ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login/`,
    register: `${API_BASE_URL}/auth/registration/`,
    user: `${API_BASE_URL}/auth/user/`,
  },
  surahs: `${API_BASE_URL}/surahs/`,
  memorization: `${API_BASE_URL}/memorization/`,
  adminUsers: `${API_BASE_URL}/admin/users/`,
};
