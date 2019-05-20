---
prev: '/events/'
---
# Debugging and Mocking

## Debugging

### Turn on Debugging

Firebase provides a debugging facility that can be turned on (it's off by default). When turned on it will log all connections and state changes to the firebase client. In order to get this information sent to STDOUT you need specify this when you instantiate an instance:

```ts
const db = await DB.connect({ debugging: true });
```

### Send Debugging to a Callback

If you'd prefer to configure a callback which is passed the debugging messages you can do that by:

```ts
const callback: DebuggingCallback = (message: string) => { ... };
const db = await DB.connect({ debugging: callback });
```

## Mocking

### Starting a Mock DB

When you instantiate an instance of **abstracted-xxx** you can choose to connect to a _mocked_ database instead of the real one. If you want a blank mock database to start you can get this with:

```ts
const db = await DB.connect({ mocking: true });
```

If you want the mock database to be initialized to a known state you can use of the `mockData` property:

```ts
const db = await DB.connect({ mocking: true, mockData: {
  people: {
    '1234': {
      name: 'foobar'
    }
  }
}});
```

And now the mock database will be available and have the `people/1234/name` path set.

### Auth Mocking

FireMock has started recently to mock not only the database but Firebase's Auth features. Not all features are currently supported but to use this you must state which authorization methods you want to turn on. 

For instance, if you wanted to enable anonoymous user login along with emailAndPassword, you could connect with the following config:

```ts
const db = await DB.connect({ mocking: true, mockAuth: {
  allowAnonymous: true,
  allowEmailLogins: true,
  validEmailLogins: [
    email: "test@test.com",
    password: "foobar"
  ]
}})
```

The options allowed are _typed_ as the `IMockAuthConfig` interface and defined as an export of the **FireMock** library.

### Using FireMock API directly

If need to, you can also directly leverage the API provided by the `firemock` library off of the `.mock` property. So for instance, if you wanted to setup 10 person records you could state:

```ts
const db = await DB.connect({ mocking: true });
db.mock.addSchema('person', personMockGenerator);
db.mock.queueSchema('person', 10).generate();
```

Now the mock database that **abstracted-admin** is pointing at has 10 people records. To query those records is no different than a non-mocked database:

```typescript
const people = await db.getRecords('/people');
```
