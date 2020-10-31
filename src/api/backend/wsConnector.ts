import BaseWsConnector from "../../api/BaseWsConnector";
import INotificationMessage from "../../interfaces/INotificationMessage";
import { AppStore } from "../../store/configureAppStore";
import { ConnectionStatus } from "../../enums/ConnectionStatus";
import { AnyAction } from "redux";

type ChangeConnStatusAction = (value: ConnectionStatus) => AnyAction;
type StoreNotificationMsgAction = (message: INotificationMessage) => AnyAction;

class WsConnector extends BaseWsConnector {
  private static _instance: WsConnector;

  private _store: AppStore;
  //@ts-ignore
  private _changeConnStatusAction: ChangeConnStatusAction;

  // private _storeNotificationMsgAction: StoreNotificationMsgAction;

  static get instance(): WsConnector {
    if (!WsConnector._instance) {
      WsConnector._instance = new WsConnector();
    }
    return WsConnector._instance;
  }

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
    // this._storeNotificationMsgAction = storeNotificationMsgAction;
    this.subscribeOnConnectionStatusChange(this._handleConnectionStatusChange);
  };

  private _handleConnectionStatusChange = (status: ConnectionStatus) => {
    this._store.dispatch(this._changeConnStatusAction(status));
  };
}

export default WsConnector.instance;
