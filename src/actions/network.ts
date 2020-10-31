import * as types from "../constants/network";
import { ConnectionStatus } from "../enums/ConnectionStatus";
import ICachingStatus from "../interfaces/ICachingStatus";

/**
 * Изменяет статус подключения к сети
 *
 * @param {ConnectionStatus} value статус подключения
 * @returns {{type, payload: ConnectionStatus}}
 */
export const changeConnectionStatus = (value: ConnectionStatus) => ({
  type: types.CHANGE_CONNECTION_STATUS,
  payload: value,
});

/**
 * Изменяет статус кеширования ресурсов
 *
 * @param {ICachingStatus} value статус кеширования
 * @returns {{type, payload: *}}
 */
export const changeCachingStatus = (value: ICachingStatus) => ({
  type: types.CHANGE_CACHING_STATUS,
  payload: value,
});
