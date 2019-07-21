const fetch = require('node-fetch');
const mobs = require('./mobs');

module.exports = () => {
  return fetch('https://ffxiv-the-hunt.net/api/data/1/world/Ultima', {
    headers: {
      'Access-Control-Arrow-Origin': '*'
    }
  })
    .then(res => res.arrayBuffer())
    .then(buf => {
      let result = [];
      for (; buf.byteLength > 0;) {
        const dataView = new DataView(buf);
        const mobId = dataView.getUint32(0);
        const cursor = dataView.getUint32(4);

        let r = buf.slice(8, 8 + cursor);

        let tmp = [];
        for (; r.byteLength > 0;) {
          const dataView2 = new DataView(r);
          tmp.push({
            mob: mobs.find(v => v.id === mobId),
            instance: dataView2.getUint8(32),
            time: 1e3 * dataView2.getUint32(33),
            x: dataView2.getUint8(37),
            y: dataView2.getUint8(38),
          })
          r = r.slice(39);
        }
        buf = buf.slice(8 + cursor);
        result = result.concat(tmp);
      }
      return result;
    })
}