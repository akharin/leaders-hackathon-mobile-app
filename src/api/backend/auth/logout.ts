import LocalAuthStorage from "../../../api/LocalAuthStorage";
import { requestWithToken } from "../../../api/backend/httpRequests";

const storage = LocalAuthStorage.instance;

/**
 * Сбрасывает аутентификацию
 */
export async function logout() {
  try {
    await requestWithToken.post("/auth/logout");
  } finally {
    await storage.deleteProp("accessToken");
    await storage.deleteProp("refreshToken");
  }
}
