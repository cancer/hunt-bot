const { DateTime, FixedOffsetZone } = require('luxon');
const fetch = require('node-fetch');
const fetchData = require('./fetch-data');

module.exports.main = () => {
  Promise.resolve()
    .then(() => fetchData())
    .then(res => res.filter(v => {
      return v.mob && v.mob.rank === 'F' && v.mob.category === 'v5'
    }))
    .then(res => res.map(v => {
      const zone = FixedOffsetZone.instance(-900);
      const date = DateTime.fromMillis(v.time, { zone });
      return {
        mob: v.mob.name_ja,
        instance: v.instance,
        diff: Math.ceil(date.diffNow().as('hours') * -1),
        dateTime: date.toFormat('MM/dd HH:mm'),
      }
    }))
    .then(res => res.reduce((output, v) => {
      const obj = {
        diff: v.diff,
        dateTime: v.dateTime,
      };
      const key = `${v.mob} instance: ${v.instance}`;
      if (!output[key]) {
        output[key] = [obj];
        return output;
      }

      output[key].push(obj);
      return output;
    }, {}))
    .then(res => Object.entries(res).map(([key, values]) => {
      const [value, ..._] = values.sort((a, b) => {
        return a.diff > b.diff ? 1 : -1;
      });
      return {
        key,
        value,
      }
    }))
    .then(res => res.map(v => {
      return `${v.key}  ${v.value.diff}時間前（${v.value.dateTime}）`;
    }).join('\n'))
    .then(res => {
      return fetch('https://hooks.slack.com/services/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', {
        method: 'POST',
        body: JSON.stringify({
          text: `${res}
https://ffxiv-the-hunt.net/ultima`,
        })
      })
    })
    .then(() => console.log('success'))
    .catch(e => console.error(e))


  process.on('unhandledRejection', () => process.exit())
};
