import DB, {Query as FirebaseQuery} from './db';

/**
 * Provides a way to serialize the full characteristics of a
 * Firebase query
 */
export class Query {
  public static path(path: string) {
    const q = new Query(path);
    return q;
  }
  protected _path: string;
  protected _limitToFirst: number;
  protected _limitToLast: number;
  protected _orderBy: 'orderByChild' | 'orderByKey' | 'orderByValue' | 'orderByValue' = 'orderByKey';
  protected _orderKey: string;
  protected _startAt: string;
  protected _endAt: string;
  protected _equalTo: string;

  constructor(path: string) {
    this._path = path;
  }

  public limitToFirst(num: number) {
    this._limitToFirst = num;
    return this;
  }

  public limitToLast(num: number) {
    this._limitToLast = num;
    return this;
  }

  public orderByChild(child: string) {
    this._orderBy = 'orderByChild';
    this._orderKey = child;
    return this;
  }

  public orderByValue() {
    this._orderBy = 'orderByValue';
    return this;
  }

  public orderByKey() {
    this._orderBy = 'orderByKey';
    return this;
  }

  public startAt(value: any, key?: string) {
    this.noKeyOnKeySort('startAt', key);
    this._startAt = value;
    return this;
  }

  public endAt(value: any, key?: string) {
    this.noKeyOnKeySort('endAt', key);
    this._endAt = value;
    return this;
  }

  public equalTo(value: any, key?: string) {
    this.noKeyOnKeySort('equalTo', key);
    this._equalTo = value;
    return this;
  }

  public execute(db: DB) {
    let q: FirebaseQuery = db.ref(this._path);
    switch (this._orderBy) {
      case 'orderByKey':
        q = q.orderByKey();
        break;
      case 'orderByValue':
        q = q.orderByValue();
        break;
      case 'orderByChild':
        q = q.orderByChild(this._orderKey);
        break;
    }
    if (this._limitToFirst) { q = q.limitToFirst(this._limitToFirst); }
    if (this._limitToLast) { q = q.limitToLast(this._limitToLast); }
    if (this._startAt) { q = q.startAt(this._startAt); }
    if (this._endAt) { q = q.endAt(this._endAt); }
    if (this._startAt) { q = q.startAt(this._startAt); }
    if (this._equalTo) { q = q.equalTo(this._equalTo); }

    return q as FirebaseQuery;
  }

  private noKeyOnKeySort(caller: string, key: string) {
    if (key && this._orderBy === 'orderByKey') {
      throw new Error(`You can not use the "key" parameter with ${caller}() when using the ${this._orderBy} sort.`);
    }
  }

}
