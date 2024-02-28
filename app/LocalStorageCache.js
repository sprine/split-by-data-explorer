export default class LocalStorageCache {
  constructor(cacheName = "") {
    this.cacheName = cacheName || window.location.pathname;
  }

  _load_all() {
    return JSON.parse(localStorage.getItem(this.cacheName) || "[]");
  }

  pop() {
    const value = this._load_all();
    value.pop();
    localStorage.setItem(this.cacheName, JSON.stringify(value));
  }

  put(newValue) {
    const value = this._load_all();
    value.push(newValue);
    localStorage.setItem(this.cacheName, JSON.stringify(value));
  }

  list() {
    return this._load_all();
  }
}
