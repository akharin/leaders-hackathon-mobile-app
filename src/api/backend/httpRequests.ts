/* eslint-disable no-param-reassign */
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import config from "../../core/config";
import LocalAuthStorage from "../LocalAuthStorage";
import { StatusCode } from "../../enums/StatusCode";
import IError from "../../interfaces/IError";

const { apiUrl } = config;
const storage = LocalAuthStorage.instance;

async function addAccessToken(axiosConfig: AxiosRequestConfig) {
  const accessToken = await storage.getProp("accessToken");
  if (!accessToken) {
    return Promise.reject({
      statusCode: StatusCode.EMPTY_ACCESS_TOKEN,
      error: "EmptyAccessToken",
      message: "accessToken is empty",
    });
  }
  axiosConfig.headers.Authorization = `Bearer ${accessToken}`;
  if (process.env.NODE_ENV === "production") {
    axiosConfig.withCredentials = true;
  }
  return axiosConfig;
}

function handleResponseError(error: AxiosError) {
  if (error.response) {
    if (error.response.data?.statusCode) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject({
      statusCode: error.response.status,
      error: error.response.statusText,
    });
  }
  return Promise.reject({
    statusCode: StatusCode.DEFAULT,
    error: "Error",
    message: error.message,
  });
}

axios.defaults.baseURL = `${apiUrl}/api`;
axios.defaults.timeout = 120000;
axios.defaults.headers.Accept = "application/json";
axios.interceptors.response.use(undefined, handleResponseError);

/**
 * Axios-объект с предварительными настройками
 */
export const defaultRequest = axios;

/**
 * Axios-объект для аутентифицированного запроса
 */
export const requestWithToken = axios.create();
requestWithToken.interceptors.request.use(addAccessToken);
requestWithToken.interceptors.response.use(undefined, handleResponseError);

/**
 * Axios-объект для аутентифицированного запроса файла
 */
export const requestFileWithToken = axios.create();
requestFileWithToken.defaults.timeout = 240000;
requestFileWithToken.defaults.responseType = "blob";
requestFileWithToken.interceptors.request.use(addAccessToken);
// При использовании responseType = 'blob' ответ в случае ошибки всё равно конвертируется в blob.
// Поэтому используется костыль с обратным преобразованием.
requestFileWithToken.interceptors.response.use(undefined, (error: AxiosError) =>
  new Promise((resolve) => {
    if (
      error.request.responseType === "blob" &&
      error.response &&
      error.response.data instanceof Blob &&
      error.response.data.type.toLowerCase().includes("json")
    ) {
      const reader = new FileReader();
      reader.onload = () =>
        resolve(
          typeof reader.result === "string" ? JSON.parse(reader.result) : error
        );
      reader.onerror = () => resolve(error);
      reader.readAsText(error.response.data);
    } else {
      resolve(error);
    }
  }).then(
    //@ts-ignore
    (err: IError | AxiosError) => {
      if ((err as IError).statusCode) {
        return Promise.reject(err);
      }
      const { response } = err as AxiosError;
      if (response) {
        return Promise.reject({
          statusCode: response.status,
          error: response.statusText,
        });
      }
      return Promise.reject({
        statusCode: StatusCode.DEFAULT,
        error: "Error",
        message: err.message,
      });
    }
  )
);
