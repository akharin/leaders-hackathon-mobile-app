import { requestWithToken } from "../../../api/backend/httpRequests";
import IUser from "../../../interfaces/IUser";

/**
 * Возвращает информацию о текущем пользователе
 */
export const fetchProfile = async () =>
  (await requestWithToken.get<IUser>("/profile")).data;
