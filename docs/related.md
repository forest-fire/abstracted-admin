# Abstracted Admin: Related Projects

The **Abstracted Admin** project is primarily a lightweight abstraction over the existing Firebase Admin API. But to support _mocking_ functionality it leverages: 

- `firemock` - [docs](https://firemock.com), [github](https://github.com/forest-fire/firemock)

In addition, since **Abstracted Admin** is just a pretty basic primitive on top of the Firebase API, it serves as a building block for more ambitious projects such as:

- `firemodel` - an opinionated modeling library for Firebase backed applications - [docs](https://www.firemodel.info)

And in turn, there are several projects that leverage `firemodel`, including:

- `ember-redux-firebase` - 
