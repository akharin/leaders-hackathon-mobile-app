import localforage from "localforage";

const singleton = Symbol();
const singletonEnforcer = Symbol();

/**
 * Класс для сохранения данных для авторизации (id пользователя, токены) в локальном хранилище
 */
class LocalAuthStorage {
  private _store!: LocalForage;

  /**
   * Возвращает единственный экземпляр класса LocalAuthStorage
   *
   * @returns {LocalAuthStorage}
   */
  static get instance(): LocalAuthStorage {
    //@ts-ignore
    if (!this[singleton]) {
      //@ts-ignore
      this[singleton] = new LocalAuthStorage(singletonEnforcer);
    }
    //@ts-ignore
    return this[singleton];
  }

  constructor(enforcer: symbol) {
    if (enforcer !== singletonEnforcer) {
      throw new Error("Cannot construct 'LocalAuthStorage' class");
    }
    this._initializeStore();
  }

  /**
   * Возвращает свойство из локального хранилища
   *
   * @param key ключ
   */
  getProp = (key: string): Promise<string | null> =>
    this._store.getItem<string>(key);

  /**
   * Сохраняет свойство в локальном хранилище
   *
   * @param {string} key ключ
   * @param {string} value значение
   * @return {Promise<string>}
   */
  setProp = (key: string, value: string): Promise<string> =>
    this._store.setItem<string>(key, value);

  /**
   * Удаляет свойство из локального хранилища
   *
   * @param {string} key ключ
   * @return {Promise<void>}
   */
  deleteProp = (key: string): Promise<void> => this._store.removeItem(key);

  /**
   * Инициализирует локальное хранилище
   *
   * @private
   */
  private _initializeStore = () => {
    this._store = localforage.createInstance({
      driver: [
        localforage.LOCALSTORAGE,
        localforage.INDEXEDDB,
        localforage.WEBSQL,
      ],
      name: "hack2020",
      storeName: "auth",
    });
  };
}

export default LocalAuthStorage;
