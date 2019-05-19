# Events

When using **abstracted-xxx** the following events are available for subscription:

## waitForConnect()

For when you want a one-time notification when the Database's connection has been established. Once the promise has been fulfilled there will be no further actions. Waiting for this event before executing any transactions is _very_ common, so much so that it more typical that you just create the database connection with the static initializer `connect()` (see below) to ensure your database operations are done _after_ you're connected.

```typescript
const db = new DB();
await db.waitForConnect();
// ... continue with DB operations
```

## DB.connect()

It is best practice to make sure that when you instantiate your connection to the database you wait for the connection to be established. This is easily achieved by using the `connect()` static initializer:

```typescript
const db = await DB.connect();
// ... continue with DB operations
```

Note that even when you are connecting to a _mock database_ the operation is asynchronous and you should ensure that the database is connected before proceeding.

## onConnected()

If you want to be notified at any point that the database **connects** (initial and subsequent reconnects) you can pass in a callback to this method. This callback will remain active until `removeConnected()` is called (note: you do _not_ need to called removeConnected, it is simply an option if you're no longer interested in this event).

```typescript
const eventId = db.onConnected(callback);
// ... do stuff
db.removeConnected( eventId );
```

> **Note:** onConnected is only available as part of the client SDK; if you are using the admin SDK
> you will not have this method avaiable.

## onDisconnected()

Same as _`OnConnected()`_ but notifies of disconnects.
