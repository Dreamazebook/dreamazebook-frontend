import type { ApiResponse, UserResponse } from '@/types/api';

/** OAuth callback may return { success, data: { user, token } } or flat { success, user, token }. */
export function normalizeOAuthUserResponse(
  response: ApiResponse<UserResponse> | (ApiResponse<UserResponse> & UserResponse) | null | undefined,
): UserResponse | null {
  if (!response?.success) return null;

  if (response.data?.token && response.data?.user) {
    return response.data;
  }

  const flat = response as ApiResponse<UserResponse> & UserResponse;
  if (flat.token && flat.user) {
    return { token: flat.token, user: flat.user };
  }

  if (response.data?.token) {
    return {
      token: response.data.token,
      user: response.data.user ?? flat.user,
    };
  }

  return null;
}

export function getOAuthCodeSessionKey(code: string): string {
  return `oauth_code_done_${code}`;
}
