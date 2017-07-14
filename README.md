[![Build Status](https://travis-ci.org/forest-fre/abstracted-admin.svg?branch=master)](https://travis-ci.org/forest-fre/abstracted-admin.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/forest-fre/abstracted-admin/badge.svg?branch=master)](https://coveralls.io/github/forest-fre/abstracted-admin?branch=master)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

# Abstracted Admin
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

## API Surface
The API surface will be exposed via Typescript if your editor supports it and consists of the following:

- `set`: sets a value to a direct 