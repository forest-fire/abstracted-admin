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

Of course the return type of all the write operaitons is _void_ but by stating the type of the data you writing you'll get type-checking on the `newUser` variable that it conforms to the interface structure it expects. 

## Read Operations {#read}

- `getSnapshot` - a shorthand for _ref(path)_ and _once('value')_ which returns a Firebase snapshot:

    ```js
    const db = new DB();
    const snapshot: DataSnapshot = await db.getSnapshot('/users/-Kp23423ddkf');
    ```

    Of course you can use the _async/await_ style syntax, or if you prefer just the more standards Promise-based _thenable_ syntax.

- `getValue` - similar to _getSnapshot_ but the snapshot's value is returned:

    ```js
    const db = new DB();
    const user = await db.getValue<IUser>('/users/-Kp23423ddkf');
    const users = await db.getValue<IDictionary<IUser>>('/users');
    ```

- `getRecord` - takes both the snapshot's `val()` and `key` and combines into a JS Object:

    ```js
    const db = new DB();
    const user = await db.getRecord<IUser>('/users/-Kp23423ddkf');
    console.log(user); // => { id: "-Kp23423ddkf", name: "Bob Barker", ... }
    ```

## Other Operations {#other}

- `ref` - passes back a Firebase **ref** object at the path specified. This opens up doing any sort of query you may want to do.
- `exists` - tests if a given path in the database exists (aka, is truthy)


## Events

When using **abstracted-admin** the following events are available for subscription:

- `void waitingForConnnect(callback)` - For when you want a one-time notification when the Database's connection has been established. The callback function will only ever be called once.
- `id:string onConnected(callback)` - If you want to be notified at ANY point that the database connects (initial and subsequent reconnects). This callback will remain active until _removeConnected( id );_ is called.
- `id:string onDisconnected(callback)` - If you want to be notified at ANY point that the database connects (initial and subsequent reconnects). This callback will remain active until _removeDisconnected( id );_ is called.