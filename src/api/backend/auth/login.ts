import config from "../../../core/config";
import IUser from "../../../interfaces/IUser";
import LocalAuthStorage from "../../../api/LocalAuthStorage";
import { defaultRequest } from "../../../api/backend/httpRequests";

const storage = LocalAuthStorage.instance;
const { appId } = config;

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  expires: number;
  user: IUser;
}

/**
 * Аутентифицирует пользователя по email и паролю
 *
 * @param {string} email email
 * @param {string} password пароль
 * @returns {Promise}
 */
export async function login(email: string, password: string) {
  try {
    const response = await defaultRequest.post<ILoginResponse>("/auth/login", {
      appId,
      email,
      password,
    });
    await storage.setProp("accessToken", response.data.accessToken);
    await storage.setProp("refreshToken", response.data.refreshToken);
    return response.data;
  } catch (error) {
    await storage.deleteProp("accessToken");
    await storage.deleteProp("refreshToken");
    return Promise.reject(error);
  }
}
