import config from "../../../core/config";
import LocalAuthStorage from "../../LocalAuthStorage";
import { StatusCode } from "../../../enums/StatusCode";
import { defaultRequest } from "../httpRequests";

const storage = LocalAuthStorage.instance;
const { appId } = config;

export interface IUpdateTokensResponse {
  accessToken: string;
  refreshToken: string;
  expires: number;
}

/**
 * Обновляет токены
 *
 * @returns {Promise}
 */
export async function updateTokens(): Promise<IUpdateTokensResponse> {
  const refreshToken = await storage.getProp("refreshToken");
  if (!refreshToken) {
    return Promise.reject({
      statusCode: StatusCode.EMPTY_REFRESH_TOKEN,
      error: "EmptyRefreshToken",
      message: "refreshToken is empty",
    });
  }

  try {
    const response = await defaultRequest.post<IUpdateTokensResponse>(
      "/auth/update-tokens",
      {
        appId,
        refreshToken,
      }
    );
    await storage.setProp("accessToken", response.data.accessToken);
    await storage.setProp("refreshToken", response.data.refreshToken);
    return response.data;
  } catch (error) {
    await storage.deleteProp("accessToken");
    await storage.deleteProp("refreshToken");
    return Promise.reject(error);
  }
}
