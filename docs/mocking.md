# Debugging & Mocking

## Debugging

Firebase provides a debugging facility that can be turned on (it's off by default). When turned on it will log all connections and state changes to the firebase client. In order to get this information sent to STDOUT you need specify this when you instantiate an instance:

```js
const db = new DB({ debugging: true });
```

If you'd prefer to configure with a callback you can instead do what you like whenever this information is made available:

```js
const callback = (info) => { /** */ };
const db = new DB({ debugging: callback });
```

## Mocking

All database _read_ and _write_ operations by default go against the configured Firebase database where the configuration is set by the following ENV variables:

- `FIREBASE_SERVICE_ACCOUNT` - this should be a URI-Encoded string of the JSON data which you exported at the time you created a Service Account on Google.
- `FIREBASE_DATA_ROOT_URL` - comes from the Firebase console and dictates which DB to connect to

However, if you are writing tests and want to _mock_ all your connections to the database, this is made very easy when using **abstracted-admin**:

### Configuring Mocking

1. Install `firemock`:

    In your project's root install the `firemock` library:

    ```sh
    # with npm
    npm install firemock --save-dev
    # with yarn
    yarn add --dev firemock

2. Configure **db** instance:

    When you instantiate your **db** instance you must pass in the configuration hash of `{ mocking: true }`:

    ```js
    const db = new DB({ mocking: true });
    ```

That's it ... your **db** instance will now call the mock database instead of using the real firebase connection.