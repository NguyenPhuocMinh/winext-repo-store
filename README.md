### Installation

Install the dependencies and devDependencies and start the server.

```sh
$ npm install winext-repository
```

### How to use

```js
const dataStore = require('winext-repository').dataStore;

// method can use
findOne({type, filter = {}, projection = {}, populates})
count({type, filter = {}})
create({type, data})
find({type, filter = {}, projection = {}, options = {}, populates})
get({type, id, projection= {}, populates})
update({type, id, data})
updateOne({type, id, data})
updateMany({type, filter = {}, data})
aggregate({type, pipeline})
deleted({type, id})
```