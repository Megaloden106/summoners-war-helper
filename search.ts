import { readFile, writeFile, appendFile } from 'fs';
import { promisify } from 'util';
import { calculate } from './calculate';
import { Filter } from './global.enums';
import { SumWarData } from 'global.types';
import { unitFilter } from './util';

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);
const appendFileAsync = promisify(appendFile);

const execute = async (filter: Filter | null, isAll?: boolean, isLocked?: boolean, isEquiped?: boolean) => {
  const data = await readFileAsync('/Users/eddielo/Desktop/Summoners War Exporter Files/mega1odon-11762846.json', 'utf8');
  let { runes, unit_list }: SumWarData = JSON.parse(data);

  if (isEquiped) {
    runes = [];
  }

  if (isAll) {
    unit_list.forEach(unit => {
      if (isLocked && unitFilter.includes(unit.unit_master_id)) {
        return;
      }

      const unitRunes = unit.runes
        .map(r => ({ ...r, unit: unit.unit_master_id }))
      runes.push(...unitRunes)
    });
  }
  const runeDetails = runes
    .map(rune => calculate(rune))
    // .filter(({ total }) => total < 62)
    // .sort((a, b) => a.total - b.total) // ASC
    // .sort((a, b) => b.total - a.total) // DESC
    .sort((a, b) => a.set - b.set || a.slot - b.slot);

  runeDetails.forEach((stat) => {
    if (!stat.upgrade && !stat.keep && !stat.reapp && filter === Filter.Sell) {
      appendFileAsync('runes.txt', stat.description);
    }
    if (stat.keep && filter === Filter.Keep) {
      appendFileAsync('runes.txt', stat.description);
    }
    if (stat.upgrade && filter === Filter.Upgrade) {
      appendFileAsync('runes.txt', stat.description);
    }
    if (stat.upgrade && stat.keep && stat.slot % 2 === 0 && filter === Filter.Upgrade15) {
      appendFileAsync('runes.txt', stat.description);
    }
    if (stat.reapp && filter === Filter.Reapp) {
      appendFileAsync('runes.txt', stat.description);
    }
  });
  console.log('TOTAL:    ', runes.length);
  console.log('KEEP:     ', runeDetails.filter(({ keep }) => keep).length);
  // console.log('KEEP62:   ', runeDetails.filter(({ total }) => total >= 62).length);
  // console.log('KEEP65:   ', runeDetails.filter(({ total }) => total >= 65).length);
  // console.log('KEEP70:   ', runeDetails.filter(({ total }) => total >= 70).length);
  // console.log('KEEP80    ', runeDetails.filter(({ total }) => total >= 80).length);
  console.log('REAPP:    ', runeDetails.filter(({ reapp }) => reapp).length);
  console.log('UPGRADE:  ', runeDetails.filter(({ upgrade }) => upgrade).length);
  console.log('SELL:     ', runeDetails.filter(({ upgrade, keep, reapp }) => !upgrade && !keep && !reapp).length);
  console.log('SLOTODD   ', runeDetails.filter(({ keep, slot }) => keep && slot % 2 !== 0).length);
  console.log('SLOT1:    ', runeDetails.filter(({ keep, slot }) => keep && slot === 1).length);
  console.log('SLOT3:    ', runeDetails.filter(({ keep, slot }) => keep && slot === 3).length);
  console.log('SLOT5:    ', runeDetails.filter(({ keep, slot }) => keep && slot === 5).length);
  console.log('SLOTEVEN: ', runeDetails.filter(({ keep, slot }) => keep && slot % 2 === 0).length);
  console.log('SLOT2:    ', runeDetails.filter(({ keep, slot }) => keep && slot === 2).length);
  console.log('SLOT4:    ', runeDetails.filter(({ keep, slot }) => keep && slot === 4).length);
  console.log('SLOT6:    ', runeDetails.filter(({ keep, slot }) => keep && slot === 6).length);
}

// filter, isAll, isLocked, isEquiped
writeFileAsync('runes.txt', '')
  .then(() => execute(Filter.Sell, false, false, false));
