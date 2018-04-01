class Storage {
  constructor(type = 'localStorage') {
    if (['sessionStorage', 'localStorage'].indexOf(type) === -1) {
      throw console.error('Type can only be session/local storage');
    }
    this.storage = window[type];
  }

  save(key, value) {
    this.storage.setItem(key, value);
  }

  saveMulti(datas) {
    if (datas instanceof Array) {
      for (const item of datas) {
        this.save(item.key, item.value);
      }
    } else if (datas instanceof Object) {
      const keys = Object.keys(datas);
      for (const key of keys) {
        this.save(key, datas[key]);
      }
    }
  }

  read(key) {
    return this.storage.getItem(key);
  }

  readMulti(keys) {
    return keys.map(key => this.read(key));
  }

  clear(key, clearAll = false) {
    if (clearAll) {
      this.storage.clear();
    } else {
      this.storage.removeItem(key);
    }
  }

  clearMulti(keys) {
    for (const key of keys) {
      this.clear(key);
    }
  }
}

export const sessionStorage = new Storage('sessionStorage');
export const localStorage = new Storage('localStorage');
