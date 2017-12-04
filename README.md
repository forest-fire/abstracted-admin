[![Build Status](https://travis-ci.org/forest-fre/abstracted-admin.svg?branch=master)](https://travis-ci.org/forest-fre/abstracted-admin.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/forest-fre/abstracted-admin/badge.svg?branch=master)](https://coveralls.io/github/forest-fre/abstracted-admin?branch=master)
[![MIT license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

![ ](./docs/images/abstracted-admin.jpg)
> A minimal abstraction over the Firebase ADMIN API

## Basic Usage 
Meant for backend nodejs micro-services which interact with Firebase's Admin API using a "service policy" to authenticate.

```js
import DB from 'abstracted-admin';
const db = new DB();
// Get a list of records
const users = await db.getValue<IUser[]>('users');
// Push a new value onto a list
const company: ICompany = {
  name: "Acme",
  employees: 500
}
db.push<ICompany>('/companies', company);
```

### Authentication
All of the Authentication is done transparently as soon as requests are made to the database. In order for this library to achieve this it will need the following environment variables set:

- `FIREBASE_SERVICE_ACCOUNT` - this should be a URI-Encoded string of the JSON data which you exported at the time you created a Service Account on Google.
- `FIREBASE_DATA_ROOT_URL` - comes from the Firebase console and dictates which DB to connect to

### Mocking
This library supports simple redirecting of all operations to the `firemock` mocking library; see [related projects](docs/related.md)) and the ["Mocking" section](docs/mocking.md) of the docs here for more details. In cases where mocking is being used, authentication (and security rights for paths) are not supported and therefore the above ENV variables are not required.

## Documentation

[Gitbook](https://forest-fire.gitbooks.io/abstracted-admin/content/)
