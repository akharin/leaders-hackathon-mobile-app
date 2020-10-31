import localForage from "localforage";

const singleton = Symbol();
const singletonEnforcer = Symbol();

/**
 * Singleton класс для доступа к информации, хранимой локально
 */
class LocalStorage {
  /**
   * Возвращает единственный экземпляр класса LocalStorage
   *
   * @returns {LocalStorage}
   */
  static get instance(): LocalStorage {
    //@ts-ignore
    if (!this[singleton]) {
      //@ts-ignore
      this[singleton] = new LocalStorage(singletonEnforcer);
    }
    //@ts-ignore
    return this[singleton];
  }

  private readonly _stores: { [store: string]: LocalForage } = {};

  private readonly _data: { [store: string]: any } = {};

  constructor(enforcer: symbol) {
    if (enforcer !== singletonEnforcer) {
      throw new Error("Cannot construct 'LocalStorage' class");
    }
  }

  /**
   * Возвращает все элементы, хранимые в конкретном хранилище
   *
   * @param {string} store название хранилища
   */
  public getItems = async <T = any>(store: string) => {
    if (!this._data[store]) {
      const items: { [key: string]: T } = {};
      await this._getStore(store).iterate<T, void>((value, key) => {
        items[key] = value;
      });
      this._data[store] = items;
    }
    return this._data[store];
  };

  /**
   * Возвращает элемент по ключу
   *
   * @param {string} store название хранилища
   * @param {string} key ключ
   */
  public getItem = <T = any>(store: string, key: string) => {
    return this._getStore(store).getItem<T>(key);
  };

  /**
   * Сохраняет данные в хранилище
   *
   * @param {string} store название хранилища
   * @param {string} key ключ
   * @param {string} value значение
   */
  public setItem = async <T = any>(store: string, key: string, value: T) => {
    await this._getStore(store).setItem<T>(key, value);

    if (!this._data[store]) {
      this._data[store] = {} as { [key: string]: T };
    }
    this._data[store][key] = value;
    return value;
  };

  /**
   * Удаляет данные из хранилища
   *
   * @param {string} store название хранилища
   * @param {string} key ключ
   */
  public deleteItem = (store: string, key: string) => {
    return this._getStore(store).removeItem(key);
  };

  /**
   * Возвращает проинициализированное хранилище
   *
   * @private
   */
  private _getStore = (store: string): LocalForage => {
    if (!this._stores[store]) {
      this._stores[store] = localForage.createInstance({
        driver: [
          localForage.INDEXEDDB,
          localForage.WEBSQL,
          localForage.LOCALSTORAGE,
        ],
        name: "tehnadzor",
        storeName: store,
      });
    }
    return this._stores[store];
  };
}

export default LocalStorage;
