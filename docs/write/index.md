# Write Operations

All of the write operations are effectively just simple shorthands that allow for passing in a path and then executing one of the following Firebase commands:

* `push`
* `set`
* `update`
* `remove`

## push( _obj_ )

So, for instance, the **push** method would be used like so:

```js
const db = new DB();
await db.push('/users', newUser);
```

Which is effectively no different than using the base Firebase API to do the following:

```js
const db = firebase.database();
db.ref("/users").push(newUser);
```

Of course because the library is using Typescript and the write operations are all _Generic Types_ we can be more explicit about the data we're setting:

```js
interface INameAndAge {
  name: string;
  age: number;
}
const db = firebase.database();
db.push < INameAndAge > ("/users", newUser);
```

Now the type of the data you writing will be type-checked statically.
