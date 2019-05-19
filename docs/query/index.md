# Query Operations

All of the READ operations above used a simple DB path to query the database but of course Firebase provides many tools to fine tune what we want the server to return. All of these parameters we're used to having off the Firebase Query API are available from a separate `SerializedQuery` class which is exported as a named export of **abstraced-admin**. You would use it like so:

```ts
import { SerializedQuery } from "abstracted-admin";
const recentTransactionsEU = SerializedQuery.path("/transactions")
  .orderByChild("date")
  .limitToLast(20)
  .equalTo("europe", "region");
```

As a convenience method you can also access SerializedQuery directly off your abstracted admin object with the `query` property:

```ts
import DB from "abstracted-admin";
const db = new DB();
const recentTransactionsEU = DB.query
  .path("/transactions")
  .orderByChild("date")
  .limitToLast(20)
  .equalTo("europe", "region");
```

As you can see the Query class provides a _fluent_ interface that any firebase developer should feel right at home with. Once you've defined your query you can use any of the above READ operations and instead of passing in the path just pass in the query:

```ts
const db = new DB();
const transactions = await db.getList<ITransaction>(recentTransactionsEU);
```
