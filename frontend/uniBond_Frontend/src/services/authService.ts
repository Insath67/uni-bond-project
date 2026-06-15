import { apiCall } from "./apiClient";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  role: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const formData = new FormData();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    const url = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/users/login`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Login failed");
    }

    return response.json();
  },

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return apiCall("/users/", {
      method: "POST",
      body: userData,
    });
  },

  logout(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  },

  setToken(token: string): void {
    localStorage.setItem("access_token", token);
  },

  getToken(): string | null {
    return localStorage.getItem("access_token");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
