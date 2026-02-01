/* ============================
   DATABASE CONFIG
============================ */

const DB_NAME = "SafeOceanDB";
const DB_VERSION = 4;

let dbInstance = null;
let isDBReady = false;

/* ============================
   SCHEMA DEFINITION
============================ */

const SCHEMA = {
  reports: { keyPath: "id", indexes: [{ name: "bySender", key: "sender" }, { name: "byApproved", key: "approved" }] },
  alerts: { keyPath: "id", indexes: [{ name: "byTimestamp", key: "timestamp" }] },
  analysis: { keyPath: "id" },
  news: { keyPath: "id" },
  messages: { keyPath: "id" }
};

/* ============================
   INITIALIZATION
============================ */

(function initDB() {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = e => {
    const db = e.target.result;
    Object.entries(SCHEMA).forEach(([storeName, config]) => {
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: config.keyPath });
        (config.indexes || []).forEach(idx => {
          try {
            store.createIndex(idx.name, idx.key, { unique: false });
          } catch (err) {
            console.warn(`Index ${idx.name} creation skipped`);
          }
        });
      }
    });
  };

  request.onsuccess = e => {
    dbInstance = e.target.result;
    isDBReady = true;
    console.log("✓ IndexedDB ready");
    document.dispatchEvent(new Event("dbReady"));
  };

  request.onerror = e => {
    console.error("✗ IndexedDB error:", e.target.error);
  };
})();

/* ============================
   DB HELPERS
============================ */

function getDB() {
  if (!isDBReady || !dbInstance) throw new Error("Database not ready");
  return dbInstance;
}

function getAll(storeName, callback) {
  try {
    const tx = getDB().transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    store.getAll().onsuccess = e => callback(e.target.result || []);
  } catch (err) {
    console.error("getAll error:", err);
    callback([]);
  }
}

function addItem(storeName, data, onSuccess, onError) {
  try {
    const tx = getDB().transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.add(data);
    req.onsuccess = () => onSuccess && onSuccess();
    req.onerror = () => onError && onError(req.error);
  } catch (err) {
    console.error("addItem error:", err);
    onError && onError(err);
  }
}

function updateItem(storeName, data, onSuccess) {
  try {
    const tx = getDB().transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(data);
    tx.oncomplete = () => onSuccess && onSuccess();
  } catch (err) {
    console.error("updateItem error:", err);
  }
}

function deleteItem(storeName, id, onSuccess) {
  try {
    const tx = getDB().transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = () => onSuccess && onSuccess();
  } catch (err) {
    console.error("deleteItem error:", err);
  }
}

/* ============================
   LOCAL STORAGE
============================ */

let userDB = JSON.parse(localStorage.getItem("ocean_users")) || {};
let contactSettings = JSON.parse(localStorage.getItem("ocean_contact")) || {
  email: "support@incois.gov.in",
  phone: "+91 040 23895000",
  address: "Ocean Valley, Pragathi Nagar, Hyderabad, India"
};
