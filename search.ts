import { readFile } from 'fs';
import { promisify } from 'util';
import { calculate } from './calculate';
import { Filter } from './global.enums';
import { SumWarData } from 'global.types';

const readFileAsync = promisify(readFile);

const execute = async (filter: Filter | null, isAll: boolean) => {
  const data = await readFileAsync('mega1odon-11762846.json', 'utf8');
  const { runes, unit_list }: SumWarData = JSON.parse(data);

  if (isAll) unit_list.forEach(unit => runes.push(...unit.runes));
  const runeDetails = runes
    .map(rune => calculate(rune))
    .sort((a, b) => a.total - b.total);

  runeDetails.forEach((stat) => {
    if (!stat.upgrade && !stat.keep && !stat.reapp && filter === Filter.Sell) {
      console.log(stat.description);
    }
    if (stat.keep && filter === Filter.Keep) {
      console.log(stat.description);
    }
    if (stat.upgrade && stat.keep && stat.slot % 2 === 0 && filter === Filter.Upgrade15) {
      console.log(stat.description);
    }
    if (stat.upgrade && filter === Filter.Upgrade) {
      console.log(stat.description);
    }
    if (stat.reapp && filter === Filter.Reapp) {
      console.log(stat.description);
    }
  });
  console.log('TOTAL:   ', runes.length);
  // console.log('KEEP:    ', runeDetails.sort((a, b) => b.total - a.total)[0].description);
  console.log('KEEP:    ', runeDetails.filter(({ keep }) => keep).length);
  console.log('REAPP:   ', runeDetails.filter(({ reapp }) => reapp).length);
  console.log('UPGRADE: ', runeDetails.filter(({ upgrade }) => upgrade).length);
  console.log('UPGRADE15: ', runeDetails.filter(({ upgrade, keep, slot }) => upgrade && keep && slot % 2 === 0).length);
  console.log('SELL:    ', runeDetails.filter(({ upgrade, keep, reapp }) => !upgrade && !keep && !reapp).length);
}

execute(Filter.Keep, false);
