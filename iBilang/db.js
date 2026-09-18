const DB_NAME = 'ibilang';
const DB_VERSION = 1;
export const STORES = ['settings','items','movements','reservations','counts','locations','categories','suppliers','connections'];

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      STORES.forEach(name => {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function all(store) {
  const db = await openDB();
  return requestResult(db.transaction(store, 'readonly').objectStore(store).getAll());
}

export async function get(store, id) {
  const db = await openDB();
  return requestResult(db.transaction(store, 'readonly').objectStore(store).get(id));
}

export async function put(store, record) {
  const db = await openDB();
  await requestResult(db.transaction(store, 'readwrite').objectStore(store).put(record));
  return record;
}

export async function remove(store, id) {
  const db = await openDB();
  await requestResult(db.transaction(store, 'readwrite').objectStore(store).delete(id));
}

export async function transact(storeNames, operation) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, 'readwrite');
    try { operation(Object.fromEntries(storeNames.map(name => [name, tx.objectStore(name)]))); }
    catch (error) { tx.abort(); reject(error); return; }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('The operation was cancelled.'));
  });
}

export async function exportAll() {
  const data = { format: 'ibilang-backup', version: 1, exportedAt: new Date().toISOString(), stores: {} };
  for (const store of STORES) data.stores[store] = await all(store);
  return data;
}

export async function restoreAll(data) {
  if (data?.format !== 'ibilang-backup' || data?.version !== 1 || !data.stores) throw new Error('This is not a valid iBilang backup.');
  const db = await openDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORES, 'readwrite');
    STORES.forEach(name => {
      const store = tx.objectStore(name); store.clear();
      (data.stores[name] || []).forEach(record => store.put(record));
    });
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
  });
}

export async function clearAll() {
  const db = await openDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORES, 'readwrite');
    STORES.forEach(name => tx.objectStore(name).clear());
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
  });
}
