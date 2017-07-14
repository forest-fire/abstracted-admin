# Abstracted Admin: API

## Write Operations {#write}

- `push`
- `set`
- `update`
- `remove`

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


# Other Operations

- `ref` - passes back a Firebase **ref** object at the path specified
- `exists` - tests if a given path in the database exists
