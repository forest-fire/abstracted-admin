# Read Operations

## ref( _path_ )

  If you want to reference a datbase path and then work on what Firebase hands back you can certainly do that:

  ```typescript
  const db = DB.connect( config );
  const ref = await db.ref('/users/-Kp23423ddkf');
  ```

## getSnapshot( _path_ )

  Shorthand for `once('value')` which returns a Firebase snapshot:

  ```typescript
  const db = DB.connect( config );
  const snapshot = await db.getSnapshot('/users/-Kp23423ddkf');
  ```

  You can use the async/await style syntax, or if you prefer just the more traditional Promise-based *thenable* syntax.

## getValue( _path_ )

  Similar to `getSnapshot()` but the snapshot's *value* is returned instead of the snapshot:

  ```typescript
  const db = DB.connect( config );
  const user = await db.getValue<User>('/users/-Kp23423ddkf');
  console.log(user); // => { "-Kp23423ddkf": { name: "Bob Barker", ... } }
  ```

## getRecord( _path_ )

  This takes the `getValue()` method one step closer and starts to introduce the value of Typescript's generic types. In the example below 

  ```typescript
  const db = new DB();
  const user = await db.getRecord<User>('/users/-Kp23423ddkf');
  console.log(user); // => { id: "-Kp23423ddkf", name: "Bob Barker", ... }
  getList(path, [idProp])
  ```

## getList( _path_ )
  
  takes both the snapshot's val() and key and combines into a JS Object where the "key" is now expressed as an `id` property on the object:

  ```typescript
  const db = new DB();
  const users = await db.getList<IUser>('/users');
  console.log(user); // => [ {id: '-Kp23423ddkf', name: 'John' }, {...}, {...} ]
  ```

  > Note: if you prefer the property to be something that other you can state it as part of the optional "options" parameter `db.getList('/users', {  } );`
