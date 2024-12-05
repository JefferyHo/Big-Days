// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import dayjs from "dayjs";

interface TableColumnsProps {
  name: string;
  unique: boolean;
}

interface addDataProps {
  [_: string]: string;
}

interface EditDataProps extends addDataProps{
  id: string;
}

export default class IndexDB {
  private request: IDBOpenDBRequest;
  private tablename: string;
  private datebasename: string;
  private db: IDBDatabase;
  private tableConf: TableColumnsProps[];

  constructor(datebasename: string, tablename: string, tableConf: TableColumnsProps[]) {
	  // 数据库连接
    this.datebasename = datebasename;
    this.tablename = tablename;
    this.tableConf = tableConf;
  }

  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.request = window.indexedDB.open(this.datebasename, 1);
      this.request.onerror = function() {
        reject("打开数据库报错");
        console.log("打开数据库报错")
      }
    
      this.request.onsuccess = () => {
        this.db = this.request.result;
        console.log("打开数据库成功")
        resolve();
      }
      
      // 数据库升级
      this.request.onupgradeneeded = (evt: IDBVersionChangeEvent) => {
        this.db = evt.target.result;
        console.log("升级数据库成功")
        this.create();
        resolve();
      }
    });
  }

  create(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.db.objectStoreNames.contains(this.tablename)) {
        // 创建数据表
        const objectStore = this.db.createObjectStore(this.tablename, { keyPath: 'id' })
        this.tableConf.forEach((dd: TableColumnsProps) => {
          objectStore.createIndex(dd.name, dd.name, { unique: dd.unique })
        })
        resolve();
      } else {
        resolve();
      }
    });
  }

  // 写入数据 { add }
  add(data: addDataProps): Promise<void> {
    return new Promise((resolve, reject) => {
      this._isUniqueKeyCollisionWithIndex('title', data.title)
      .then((res) => {
        if (res) {
          reject('标题不能重复');
          return;
        }

        const request = this.db.transaction([this.tablename], 'readwrite')
          .objectStore(this.tablename)
          .add({
            id: crypto.randomUUID(),
            ...data,
            createAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
          })
        
        request.onsuccess =  function() {
          resolve();
        }
        
        request.onerror =  function(evt) {
          reject(evt.target);
        }
      })
      .catch((e) => {
        reject('新建数据失败:', e);
      });
    });
  }
  
  // 读取数据 { get }
  readOneById(id: string): Promise<object> {
    return new Promise((resolve, reject) => {
      const request = this.db.transaction([this.tablename])
        .objectStore(this.tablename)
        .get(id)

      request.onerror = function(evt) {
        reject(evt.target);
      }

      request.onsuccess = function() {
        if (request.result) {
          resolve(request.result);
        } else {
          reject('no record found')
        }
      }
    })
  }
  
  //  遍历数据 { openCursor }
  readAll(): Promise<object[]> {
    return new Promise((resolve) => {
      const objectStore = this.db.transaction([this.tablename]).objectStore(this.tablename);
      const list: object[] = [];

      objectStore.openCursor().onsuccess = function(evt) {
        const cursor = evt.target.result;

        if (cursor) {
          list.push(cursor.value);

          cursor.continue();
        } else {
          resolve(list);
          console.log('--- the end ---')
        }
      }
    });
  }

  private async _isUniqueKeyCollisionWithIndex<T extends IDBValidKey>(
    uniqueKey: string, 
    targetValue: T, 
    excludeId?: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([this.tablename], 'readonly');
        const objectStore = transaction.objectStore(this.tablename);
  
        // 使用索引查询
        const index = objectStore.index(uniqueKey);
        const request = index.get(targetValue);
  
        request.onsuccess = () => {
          const existingRecord = request.result;
  
          // 检查是否存在记录并排除指定 ID
          if (!existingRecord || existingRecord.id === excludeId) {
            resolve(false); // 没有冲突
          } else {
            resolve(true); // 存在冲突
          }
        };
  
        request.onerror = (event) => {
          console.error('Error checking unique key collision:', event);
          reject(new Error('校验失败'));
        };
      } catch (error) {
        console.error('初始化失败:', error);
        reject(error);
      }
    });
  }
  
  
  // 更新数据 { put }  
  update(data: EditDataProps): Promise<void> {
   
    return new Promise((resolve, reject) => {
      this._isUniqueKeyCollisionWithIndex('title', data.title, data.id)
      .then((res) => {
        if (res) {
          reject('标题不能重复');
          return;
        }
        const request = this.db.transaction([this.tablename], 'readwrite').objectStore(this.tablename)
          .put({
            ...data,
            updateAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
          })
    
        request.onsuccess = function() {
          resolve();
        }
    
        request.onerror = function() {
          reject('修改数据失败')
        }
      })
      .catch((e) => {
        reject('修改数据失败:', e);
      });
    });
  }
    
  // 删除数据 { delete }
  removeById(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.db.transaction([this.tablename], 'readwrite').objectStore(this.tablename)
        .delete(id)
  
      request.onsuccess = function() {
        resolve();
      }

      request.onerror = function() {
        reject('success delete data')
      }
    });
      
  }
}