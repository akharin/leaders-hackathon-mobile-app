import io from "socket.io-client";
// @ts-ignore

import LocalAuthStorage from "./LocalAuthStorage";
import detectSocketTimeout from "../utils/detectSocketTimeout";
import EventEmitter from "events";
import INotificationMessage from "../interfaces/INotificationMessage";

const storage = LocalAuthStorage.instance;

type ChangeConnStatusAction = (value: "ok" | "error") => void;
type StoreNotificationMsgAction = (message: INotificationMessage) => void;
type Listener = (...args: any[]) => void;

interface IParams {
  [key: string]: string | number | boolean | object | Blob | null | undefined;
}

/**
 * Базовый singleton класс для взаимодействия с backend'ом
 */
class BaseSocketConnector {
  private _socket?: SocketIOClient.Socket;

  private _stream?: any;

  private _store: any;
  // @ts-ignore
  private _changeConnStatusAction: ChangeConnStatusAction;
  // @ts-ignore
  private _storeNotificationMsgAction: StoreNotificationMsgAction;

  // @ts-ignore
  private _eventEmitter = new EventEmitter();

  /**
   * Создает подключение к api
   *
   * @param {string} url адрес api
   */
  connect = (url: string) => {
    this._socket = io(url, {
      path: "/api/main",
      transports: ["websocket"],
    });
    this._socket.on("connect", this._onConnect);
    this._socket.on("disconnect", this._onDisconnect);
  };

  /**
   * Инициализирует экземпляр класса
   *
   * @param {*} store Redux store
   * @param connStatusAction
   * @param storeNotificationMsgAction
   */
  initialize = (
    store: any,
    connStatusAction: ChangeConnStatusAction,
    storeNotificationMsgAction: StoreNotificationMsgAction
  ) => {
    if (!store || !connStatusAction || !storeNotificationMsgAction) {
      throw new Error(
        "Params ('store', 'connStatusAction', 'storeNotificationMsgAction') are not found"
      );
    }
    this._store = store;
    this._changeConnStatusAction = connStatusAction;
    this._storeNotificationMsgAction = storeNotificationMsgAction;
  };

  /**
   * Пожписывает на обновления о изменении статуса соединения
   *
   * @param {Listener} listener функция-обработчик
   */
  subscribeOnConnectionStatusChange = (listener: Listener) => {
    this._eventEmitter.addListener("connectionStatusChange", listener);
  };

  /**
   * Отписывает от обновлений о изменении статуса соединения
   *
   * @param {Listener} listener функция-обработчик
   */
  unsubscribeOnConnectionStatusChange = (listener: Listener) => {
    this._eventEmitter.removeListener("connectionStatusChange", listener);
  };

  /**
   * Авторизовывает пользователя
   *
   * @param {string} appId id приложения
   * @param {string} appSecret ключ приложения
   * @param {string} email email учётной записи
   * @param {string} password пароль
   * @returns {Promise}
   */
  getTokens = async (
    appId: string,
    appSecret: string,
    email: string,
    password: string
  ) => {
    const params = {
      appId,
      appSecret,
      email,
      password,
    };
    try {
      const response = await this._sendRequest("getTokens", params);
      await storage.setProp("accessToken", response.accessToken);
      await storage.setProp("refreshToken", response.refreshToken);
      return response;
    } catch (error) {
      await storage.deleteProp("accessToken");
      await storage.deleteProp("refreshToken");
      return Promise.reject(error);
    }
  };

  /**
   * Обновляет токены доступа
   *
   * @param {string} appId id приложения
   * @param {string} appSecret ключ приложения
   * @return {Promise}
   */
  updateTokens = async (appId: string, appSecret: string) => {
    const refreshToken = await storage.getProp("refreshToken");
    if (!refreshToken) {
      return Promise.reject({
        code: 650,
        error: "EmptyRefreshToken",
        message: "refreshToken is empty",
      });
    }

    const params = { appId, appSecret, refreshToken };
    try {
      const response = await this._sendRequest("updateTokens", params);
      await storage.setProp("accessToken", response.accessToken);
      await storage.setProp("refreshToken", response.refreshToken);
      return response;
    } catch (error) {
      await storage.deleteProp("accessToken");
      await storage.deleteProp("refreshToken");
      return Promise.reject(error);
    }
  };

  /**
   * Удаляет выданные ранее токены
   *
   * @return {Promise}
   */
  deleteTokens = async () => {
    await this._sendAuthorizedRequest("deleteTokens");
    await storage.deleteProp("accessToken");
    await storage.deleteProp("refreshToken");
  };

  /**
   * Получает данные текущего пользователя
   *
   * @return {Promise}
   */
  getCurrentUser = () => this._sendAuthorizedRequest("getCurrentUser");

  /**
   * Изменяет информацию о текущем пользователе
   *
   * @param {string} email email пользователя
   * @param {string} fullName ФИО
   * @param {string} position должность
   * @param {string} password новый пароль
   * @return {Promise}
   */
  updateCurrentUser = (
    email: string,
    fullName: string,
    position: string,
    password: string
  ) => {
    const params: IParams = {};
    if (email) {
      params.email = email;
    }
    if (fullName) {
      params.fullName = fullName;
    }
    if (position) {
      params.position = position;
    }
    if (password) {
      params.password = password;
    }
    return this._sendAuthorizedRequest("updateCurrentUser", params);
  };

  /**
   * Получает публичный ключ для шифрования push-уведомлений
   *
   * @returns {*}
   */
  getWebPushPublicKey = () =>
    this._sendAuthorizedRequest("getWebPushPublicKey");

  /**
   * Добавляет или изменяет подписку на web push-уведомления
   *
   * @param {object} subscription объект подписки
   * @param {string} deviceId id подписываемого устройства
   * @param {string} device название подписываемого устройства
   * @returns {*}
   */
  updateWebPushSubscription = (
    subscription: object,
    deviceId: string,
    device: string
  ) => {
    const params = {
      subscription,
      deviceId,
      device,
    };
    return this._sendAuthorizedRequest("updateWebPushSubscription", params);
  };

  /**
   * Удаляет подписку на web push-уведомления
   *
   * @param {string} deviceId id подписываемого устройства
   * @returns {*}
   */
  deleteWebPushSubscription = (deviceId: string) => {
    const params = { deviceId };
    return this._sendAuthorizedRequest("deleteWebPushSubscription", params);
  };

  /**
   * Отправляет запрос через WebSocket и ожидает данные в ответ
   *
   * @param {string} methodName название метода
   * @param {Object} params параметры запроса
   * @return {Promise}
   * @protected
   */
  protected _sendRequest = <R = any>(
    methodName: string,
    params: IParams = {}
  ): Promise<R> =>
    new Promise((resolve, reject) => {
      if (!this._socket) {
        reject({
          code: 600,
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
   * @param {string} methodName название метода
   * @param {IParams} params параметры запроса
   * @return {Promise}
   * @protected
   */
  protected _sendAuthorizedRequest = (
    methodName: string,
    params: IParams = {}
  ) =>
    storage.getProp("accessToken").then((accessToken) => {
      if (!accessToken) {
        return Promise.reject({
          code: 650,
          error: "EmptyAccessToken",
          message: "accessToken is empty",
        });
      }
      params.accessToken = accessToken;
      return this._sendRequest(methodName, params);
    });

  /**
   * Отправляет простой запрос через WebSocket без ожидания данных в ответ
   *
   * @param {string} methodName название метода
   * @param {IParams} params параметры запроса
   * @protected
   */
  protected _sendSimpleRequest = async (
    methodName: string,
    params: IParams = {}
  ): Promise<void> => {
    if (!this._socket) {
      return Promise.reject({
        code: 600,
        error: "NoActiveConnection",
        message: "No active connection",
      });
    }
    this._socket.emit(methodName, params);
  };

  /**
   * Отправляет простой запрос, прикрепляя к нему токен авторизации
   *
   * @param {String} methodName название метода
   * @param {Object} params параметры запроса
   * @return {Promise}
   * @protected
   */
  protected _sendAuthorizedSimpleRequest = async (
    methodName: string,
    params: IParams = {}
  ): Promise<void> => {
    const accessToken = await storage.getProp("accessToken");
    if (!accessToken) {
      return Promise.reject({
        code: 650,
        error: "EmptyAccessToken",
        message: "accessToken is empty",
      });
    }
    params.accessToken = accessToken;
    await this._sendSimpleRequest(methodName, params);
  };

  /**
   * Подписывается на WebSocket событие
   *
   * @param {string} eventName название события
   * @param {Function} callback callback
   * @param unique
   * @protected
   */
  protected _subscribe = (
    eventName: string,
    callback: (...args: any[]) => void,
    unique = false
  ) => {
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
   * @param {string} eventName название события
   * @param {Function} callback callback
   * @protected
   */
  protected _unsubscribe = (
    eventName: string,
    callback: (...args: any[]) => void
  ) => {
    if (this._socket) {
      this._socket.off(eventName, callback);
    }
  };

  /**
   * Обработывает событие при соединении с api
   *
   * @private
   */
  private _onConnect = () => {
    this._store.dispatch(this._changeConnStatusAction("ok"));
    this._eventEmitter.emit("connectionStatusChange", true);
  };

  /**
   * Обработывает событие при отключении от api
   *
   * @param {string} reason причина отключения
   * @private
   */
  private _onDisconnect = (reason: string) => {
    this._store.dispatch(this._changeConnStatusAction("error"));
    this._eventEmitter.emit("connectionStatusChange", false);

    if (reason === "io server disconnect" && this._socket) {
      this._socket.connect();
    }
  };

  /**
   * Сохраняет в store сообщение-уведомление
   *
   * @param {INotificationMessage} message сообщение
   * @private
   */
  private _storeNotificationMessage = (message: INotificationMessage) => {
    if (message && typeof message === "object") {
      this._store.dispatch(this._storeNotificationMsgAction(message));
    }
  };
}

export default BaseSocketConnector;
