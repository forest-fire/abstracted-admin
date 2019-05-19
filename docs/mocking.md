# Debugging & Mocking

## Debugging

Firebase provides a debugging facility that can be turned on (it's off by default). When turned on it will log all connections and state changes to the firebase client. In order to get this information sent to STDOUT you need specify this when you instantiate an instance:

```ts
const db = await DB.connect({ debugging: true });
```

If you'd prefer to configure a callback which is passed the debugging messages you can do that by:

```ts
const callback: DebuggingCallback = (message) => { /** */ };
const db = await DB.connect({ debugging: callback });
```

## Mocking

When you instantiate an instance of **abstracted-xxx** you can choose to connect to a _mocked_ database instead of the real one. You do this by passing in the following configuration:

```ts
const db = await DB.connect({ mocking: true });
```

At this point you can leverage the API provided by the `firemock` library off of the `.mock` property. So for instance, if you wanted to setup 10 person records you could state:

```ts
const db = new DB({ mocking: true });
db.mock.addSchema('person', personMockGenerator);
db.mock.queueSchema('person', 10).generate();
```

Now the mock database that **abstracted-admin** is pointing at has 10 people records. To query those records is no different than a non-mocked database:

```typescript
const people = await db.getRecords('/people');
```
