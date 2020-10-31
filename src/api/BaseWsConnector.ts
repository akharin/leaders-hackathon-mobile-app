import io from "socket.io-client";
import LocalAuthStorage from "./LocalAuthStorage";
import detectSocketTimeout from "../utils/detectSocketTimeout";
import { EventEmitter } from "events";
import { StatusCode } from "../enums/StatusCode";
import { ConnectionStatus } from "../enums/ConnectionStatus";

const storage = LocalAuthStorage.instance;

type Listener = (...args: any[]) => void;

interface IParams {
  [key: string]: string | number | boolean | object | Blob | null | undefined;
}

/**
 * Базовый класс для взаимодействия с backend'ом по протоколу websocket
 */
class BaseWsConnector {
  private _socket?: SocketIOClient.Socket;

  private _eventEmitter = new EventEmitter();

  /**
   * Создает подключение к api
   *
   * @param url адрес сервера
   * @param path путь до endpoint
   * @param transports используемые транспорты
   */
  connect = (
    url: string,
    path = "/api/ws",
    transports: string[] = ["websocket"]
  ) => {
    this._socket = io(url, { path, transports });
    this._socket.on("connect", this._onConnect);
    this._socket.on("disconnect", this._onDisconnect);
  };

  /**
   * Подписывает на обновления о изменении статуса соединения
   *
   * @param listener функция-обработчик
   */
  subscribeOnConnectionStatusChange = (listener: Listener) => {
    this._eventEmitter.addListener("connectionStatusChange", listener);
  };

  /**
   * Отписывает от обновлений о изменении статуса соединения
   *
   * @param listener функция-обработчик
   */
  unsubscribeOnConnectionStatusChange = (listener: Listener) => {
    this._eventEmitter.removeListener("connectionStatusChange", listener);
  };

  /**
   * Отправляет запрос через WebSocket и ожидает данные в ответ
   *
   * @param methodName название метода
   * @param params параметры запроса
   */
  sendRequest = <R>(methodName: string, params: IParams = {}): Promise<R> =>
    new Promise((resolve, reject) => {
      if (!this._socket) {
        reject({
          code: StatusCode.OFFLINE,
          error: "NoActiveConnection",
          message: "No active connection",
        });
      } else {
        this._socket.emit(
          methodName,
          params,
          detectSocketTimeout((data) => {
            if (data && data.error) {
              reject(data);
            }
            resolve(data);
          })
        );
      }
    });

  /**
   * Отправляет запрос, прикрепляя к нему токен авторизации
   *
   * @param methodName название метода
   * @param params параметры запроса
   */
  sendAuthorizedRequest = async <R>(
    methodName: string,
    params: IParams = {}
  ) => {
    const accessToken = await storage.getProp("accessToken");
    if (!accessToken) {
      return Promise.reject({
        statusCode: StatusCode.EMPTY_ACCESS_TOKEN,
        error: "EmptyAccessToken",
        message: "accessToken is empty",
      });
    }
    return this.sendRequest<R>(methodName, { ...params, accessToken });
  };

  /**
   * Отправляет простой запрос через WebSocket без ожидания данных в ответ
   *
   * @param methodName название метода
   * @param params параметры запроса
   */
  sendSimpleRequest = async (
    methodName: string,
    params: IParams = {}
  ): Promise<void> => {
    if (!this._socket) {
      return Promise.reject({
        code: StatusCode.OFFLINE,
        error: "NoActiveConnection",
        message: "No active connection",
      });
    }
    this._socket.emit(methodName, params);
  };

  /**
   * Отправляет простой запрос, прикрепляя к нему токен авторизации
   *
   * @param methodName название метода
   * @param params параметры запроса
   */
  sendAuthorizedSimpleRequest = async (
    methodName: string,
    params: IParams = {}
  ): Promise<void> => {
    const accessToken = await storage.getProp("accessToken");
    if (!accessToken) {
      return Promise.reject({
        statusCode: StatusCode.EMPTY_ACCESS_TOKEN,
        error: "EmptyAccessToken",
        message: "accessToken is empty",
      });
    }
    await this.sendSimpleRequest(methodName, { ...params, accessToken });
  };

  /**
   * Подписывается на WebSocket событие
   *
   * @param eventName название события
   * @param callback callback
   * @param unique добавлять ли функцию только один раз
   */
  subscribe = (eventName: string, callback: Listener, unique = false) => {
    if (
      this._socket &&
      (!unique || (unique && !this._socket.hasListeners(eventName)))
    ) {
      this._socket.on(eventName, callback);
    }
  };

  /**
   * Отписывается от WebSocket события
   *
   * @param eventName название события
   * @param callback callback
   */
  unsubscribe = (eventName: string, callback: Listener) => {
    if (this._socket) {
      this._socket.off(eventName, callback);
    }
  };

  /**
   * Обрабатывает событие соединения с api
   *
   * @private
   */
  private _onConnect = () => {
    this._eventEmitter.emit("connectionStatusChange", ConnectionStatus.OK);
  };

  /**
   * Обрабатывает событие отключения от api
   *
   * @param reason причина отключения
   * @private
   */
  private _onDisconnect = (reason: string) => {
    this._eventEmitter.emit("connectionStatusChange", ConnectionStatus.ERROR);

    if (reason === "io server disconnect" && this._socket) {
      this._socket.connect();
    }
  };
}

export default BaseWsConnector;
