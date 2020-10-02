type IDbRequestCallback = (store: IDBObjectStore) => IDBRequest
type TransVal2 = <T>(type: IDBTransactionMode, cb: IDbRequestCallback) => Promise<T>

const createDatabase = (dbName: string, storeName: string) : Promise<IDBDatabase> =>
        new Promise((resolve, reject) => {
            const r = indexedDB.open(dbName, 1)
            r.onerror = () => reject(r.error)
            r.onsuccess = () => resolve(r.result)
            r.onupgradeneeded = () => {
                r.result.createObjectStore(storeName)
            }
        })

const createTxnPromise = (dbp: Promise<IDBDatabase>, storeName: string) : TransVal2 =>
    <T>(type: IDBTransactionMode, callback: IDbRequestCallback) => dbp.then(db => createPromise(db.transaction(storeName, type), storeName, callback))

const createPromise = <T>(txn: IDBTransaction, storeName: string, callback: IDbRequestCallback) =>
    new Promise<T>((resolve, reject) => {
        txn.oncomplete = () => resolve(r.result as T)
        txn.onabort = txn.onerror = () => reject(txn.error)
        const r = callback(txn.objectStore(storeName))
    })

const _storeFactory = (t: TransVal2) => ({
    get: <T>(key: IDBValidKey): Promise<T> => t("readonly", s => s.get(key)),
    set: <T>(key: IDBValidKey, value: T): Promise<T> => t("readwrite", s => s.put(value, key)),
    del: (key: IDBValidKey) => t("readwrite", s => s.delete(key)),
    clear: () => t("readwrite", s => s.clear()),
    keys: (): Promise<IDBValidKey[]> => t("readonly", s => s.getAllKeys())
})

export const storeFactory = (dbName: string = 'kvp-store', storeName: string = 'kvp') =>
    _storeFactory(createTxnPromise(createDatabase(dbName, storeName), storeName))
