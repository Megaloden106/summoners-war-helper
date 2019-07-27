const { readFile } = require('fs');
const { promisify } = require('util');
const translate = require('./translate');

const readFileAsync = promisify(readFile);

const execute = async (filter, isAll) => {
  const data = await readFileAsync('mega1odon-11762846.json', 'utf8');
  const { runes, unit_list } = JSON.parse(data);
  // const runes = [];
  // const { unit_list } = JSON.parse(data);
  if (isAll) {
    unit_list.forEach(unit => runes.push(...unit.runes));
  }
  const runeDetails = runes
    .map(rune => translate(rune))
    // .sort((a, b) => a.total - b.total);

  runeDetails.forEach((stat) => {
    if (!stat.upgrade && !stat.keep && !stat.reapp && filter === 'sell') {
      console.log(stat.details);
    }
    if (stat.keep && filter === 'keep') {
      console.log(stat.details);
    }
    if (stat.upgrade && stat.keep && stat.slot % 2 === 0 && filter === '15') {
      console.log(stat.details);
    }
    if (stat.upgrade && filter === 'upgrade') {
      console.log(stat.details);
    }
    if (stat.reapp && filter === 'reapp') {
      console.log(stat.details);
    }
  });
  console.log('TOTAL:   ', runes.length);
  // console.log('KEEP:    ', runeDetails.sort((a, b) => b.total - a.total)[0].details);
  console.log('KEEP:    ', runeDetails.filter(({ keep }) => keep).length);
  console.log('REAPP:   ', runeDetails.filter(({ reapp }) => reapp).length);
  console.log('UPGRADE: ', runeDetails.filter(({ upgrade }) => upgrade).length);
  console.log('UPGRADE15: ', runeDetails.filter(({ upgrade, keep, slot }) => upgrade && keep && slot % 2 === 0).length);
  console.log('SELL:    ', runeDetails.filter(({ upgrade, keep, reapp }) => !upgrade && !keep && !reapp).length);
};

execute('15', false);
