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

# Other Operations

- `ref` - passes back a Firebase **ref** object at the path specified. This opens up doing any sort of query you may want to do.
- `exists` - tests if a given path in the database exists (aka, is truthy)
