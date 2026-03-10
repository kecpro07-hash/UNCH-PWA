// IndexedDB для офлайн-режима
const DB = {
    dbName: 'unchDB',
    dbVersion: 1,
    
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Хранилище пользователя
                if (!db.objectStoreNames.contains('user')) {
                    db.createObjectStore('user', { keyPath: 'id' });
                }
                
                // Хранилище заказов
                if (!db.objectStoreNames.contains('orders')) {
                    const orderStore = db.createObjectStore('orders', { keyPath: 'number' });
                    orderStore.createIndex('userId', 'user_id', { unique: false });
                    orderStore.createIndex('status', 'status', { unique: false });
                }
                
                // Хранилище отзывов
                if (!db.objectStoreNames.contains('reviews')) {
                    db.createObjectStore('reviews', { keyPath: 'id', autoIncrement: true });
                }
                
                // Хранилище для синхронизации
                if (!db.objectStoreNames.contains('sync')) {
                    db.createObjectStore('sync', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    },
    
    async saveUser(user) {
        const db = await this.init();
        const tx = db.transaction('user', 'readwrite');
        tx.objectStore('user').put({ id: 'current', ...user });
        return tx.complete;
    },
    
    async getUser() {
        const db = await this.init();
        const tx = db.transaction('user', 'readonly');
        const store = tx.objectStore('user');
        return new Promise((resolve) => {
            const request = store.get('current');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        });
    },
    
    async saveOrders(orders) {
        const db = await this.init();
        const tx = db.transaction('orders', 'readwrite');
        const store = tx.objectStore('orders');
        
        orders.forEach(order => store.put(order));
        return tx.complete;
    },
    
    async getOrders(userId) {
        const db = await this.init();
        const tx = db.transaction('orders', 'readonly');
        const store = tx.objectStore('orders');
        const index = store.index('userId');
        
        return new Promise((resolve) => {
            const request = index.getAll(userId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve([]);
        });
    },
    
    async saveOrder(order) {
        const db = await this.init();
        const tx = db.transaction('orders', 'readwrite');
        tx.objectStore('orders').put(order);
        return tx.complete;
    },
    
    async addToSync(data) {
        const db = await this.init();
        const tx = db.transaction('sync', 'readwrite');
        tx.objectStore('sync').add({
            data: data,
            timestamp: Date.now(),
            synced: false
        });
        return tx.complete;
    },
    
    async getUnsynced() {
        const db = await this.init();
        const tx = db.transaction('sync', 'readonly');
        const store = tx.objectStore('sync');
        
        return new Promise((resolve) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const items = request.result.filter(item => !item.synced);
                resolve(items);
            };
            request.onerror = () => resolve([]);
        });
    },
    
    async markSynced(id) {
        const db = await this.init();
        const tx = db.transaction('sync', 'readwrite');
        const store = tx.objectStore('sync');
        const item = await new Promise((resolve) => {
            const req = store.get(id);
            req.onsuccess = () => resolve(req.result);
        });
        
        if (item) {
            item.synced = true;
            store.put(item);
        }
        return tx.complete;
    }
};