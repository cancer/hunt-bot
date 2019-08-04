const fetchData = require('../fetch-data');

Promise.resolve()
.then(() => fetchData())
.then(res => {
  console.log(res)
})