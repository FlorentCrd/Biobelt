import { ApiResponse } from "./ApiResponse";

export interface AuthResponse extends ApiResponse<string> {
  refreshToken: string;
}