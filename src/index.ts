type IDbRequestCallback = (store: IDBObjectStore) => IDBRequest

interface TransVal {
    ro<T>(cb: IDbRequestCallback): Promise<T>;

    rw<T>(cb: IDbRequestCallback): Promise<T>;
}

const createIdbPromise = (dbName: string, storeName: string): Promise<TransVal> =>
    new Promise((resolve, reject) => {
        const r = indexedDB.open(dbName, 1)
        r.onerror = () => reject(r.error)
        r.onsuccess = () => resolve({
            ro: create(r.result, "readonly", storeName),
            rw: create(r.result, "readwrite", storeName)
        })
        r.onupgradeneeded = () => {
            r.result.createObjectStore(storeName)
        }
    })

const create = (db: IDBDatabase, type: IDBTransactionMode, storeName: string) =>
    <T>(callback: IDbRequestCallback) => new Promise<T>((resolve, reject) => {
        const t = db.transaction(storeName, type)
        t.oncomplete = () => resolve(r.result as T)
        t.onabort = t.onerror = () => reject(t.error)
        const r = callback(t.objectStore(storeName))
    })

const _storeFactory = (db: Promise<TransVal>) => ({
    get: <T>(key: IDBValidKey): Promise<T> => db.then(x => x.ro(s => s.get(key))),
    set: <T>(key: IDBValidKey, value: T): Promise<T> => db.then(x => x.rw(s => s.put(value, key))),
    del: (key: IDBValidKey) => db.then(x => x.rw(s => s.delete(key))),
    clear: () => db.then(x => x.rw(store => store.clear())),
    keys: (): Promise<IDBValidKey[]> => db.then(x => x.ro(store => store.getAllKeys()))
})

export const storeFactory = (dbName: string = 'kvp-store', storeName: string = 'kvp') =>
    _storeFactory(createIdbPromise(dbName, storeName))
