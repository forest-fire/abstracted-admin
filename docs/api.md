# Abstracted Admin: API

## Write Operations {#write}

All of the write operations are effectively just simple shorthands that allow for passing in a path and then executing one of the following Firebase commands:

- `push` 
- `set`
- `update`
- `remove`

So, for instance, the **push** method would be used like so:

```js
const db = new DB();
await db.push('/users', newUser);
```

Which is effectively no different than using the base Firebase API to do the following:

```js
const db = firebase.database();
db.ref('/users').push(newUser);
```

Of course because the library is using Typescript and the write operations are all _Generic Types_ we can be more explicit about the data we're setting:
```js
interface INameAndAge {
    name: string;
    age: number;
}
const db = firebase.database();
db.push<INameAndAge>('/users', newUser);
```

Now the type of the data you writing will be type-checked statically. 

## Read Operations {#read}

- `getSnapshot(path)` 

    a shorthand for _ref(path)_ and _once('value')_ which returns a Firebase snapshot:

    ```js
    const db = new DB();
    const snapshot: DataSnapshot = await db.getSnapshot('/users/-Kp23423ddkf');
    ```

    You can use the _async/await_ style syntax, or if you prefer just the more traditional Promise-based _thenable_ syntax.

- `getValue(path)` 

    similar to _getSnapshot_ but the snapshot's value is returned:

    ```js
    const db = new DB();
    const user = await db.getValue<IUser>('/users/-Kp23423ddkf');
    const users = await db.getValue<IDictionary<IUser>>('/users');
    ```

- `getRecord(path, [idProp])`

    takes both the snapshot's `val()` and `key` and combines into a JS Object:

    ```js
    const db = new DB();
    const user = await db.getRecord<IUser>('/users/-Kp23423ddkf');
    console.log(user); // => { id: "-Kp23423ddkf", name: "Bob Barker", ... }
    ```

- `getList(path, [idProp])` 

    get a list of records (aka, a snapshot in form of a hash) it will return a JS array where each record's _key_ is by default "id".

    ```js
    const db = new DB();
    const users = await db.getList<IUser>('/users');
    console.log(user); // => [ {id: '-Kp23423ddkf', name: 'John' }, {...}, {...} ]
    ```

## Queries {#queries}

All of the READ operations above used a simple DB path to query the database but of course Firebase provides many tools to fine tune what we want the server to return. All of these parameters we're used to having off the Firebase Query API are available from abstracted admin's `Query` class. You would use it like so:

```ts
const recentTransactionsEU = Query
  .path('/transactions')
  .orderByChild('date')
  .limitToLast(20)
  .equalTo('europe', 'region');
```

As you can see the Query class provides a _fluent_ interface that any firebase developer should feel right at home with. Once you've defined your query you can use any of the above READ operations and instead of passing in the path just pass in the query:

```ts
const db = new DB();
const transactions = await db.getList<ITransaction>(recentTransactionsEU);
```

## Events {#events}

When using **abstracted-admin** the following events are available for subscription:

- `waitingForConnect(): Promise<void>`

    For when you want a one-time notification when the Database's connection has been established. Once the promise has been fulfilled there will be no further actions.


- `onConnected(callback: (this) => void )`

    If you want to be notified at any point that the database **connects** (initial and subsequent reconnects). This callback will remain active until _removeConnected( id );_ is called.

- `string onDisconnected(callback)` 

    Same as _`OnConnected`_ but notifies of disconnects.


## Other Operations {#other}

- `ref` - passes back a Firebase **ref** object at the path specified. This opens up doing any sort of query you may want to do.
- `exists` - tests if a given path in the database exists (aka, is truthy)
