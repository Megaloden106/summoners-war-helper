import { readFile, writeFile } from 'fs';
import { promisify } from 'util';
import { Rune } from './model/Rune';
import { SumWarData } from './model/interfaces';
import { locked } from './model/locked';

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

const execute = async () => {
  const jsonData = await readFileAsync('/Users/eddielo/Desktop/Summoners War Exporter Files/mega1odon-11762846.json', 'utf8');
  const data: SumWarData = JSON.parse(jsonData);

  const runes = data.runes.map(r => new Rune(r));

  data.unit_list
    .forEach(u => u.runes
      .forEach(r => runes.push(new Rune(r, u))));

  const upgrade12Runes = [];
  const upgrade15Runes = [];
  const keepRunes = [];
  const reappRunes = [];
  const gemRunes = [];
  const sellRunes = [];

  const counter: { [key: string]: number } = { };

  runes
    .filter(({ id }) => !locked.includes(id))
    .sort((a, b) => a.set.localeCompare(b.set)
      || a.slot - b.slot
      || b.targetEffectiveness - a.targetEffectiveness)
    .forEach(({ description, keep, reapp, upgrade12, upgrade15, slot, set, targetEffectiveness }) => {
      if (upgrade12) {
        upgrade12Runes.push(description);
      } else if (upgrade15) {
        upgrade15Runes.push(description);
      } else if (keep) {
      } else if (reapp) {
        reappRunes.push(description);
      } else {
        sellRunes.push(description);
      }
      counter[slot] = (counter[slot] || 0) + 1;
      counter[set] = (counter[set] || 0) + 1;
      if (targetEffectiveness > 72) {
        counter.aboveTarget = (counter.aboveTarget || 0) + 1;
      }
    });

  runes
    .sort((a, b) => b.targetEffectiveness - a.targetEffectiveness)
    .forEach(({ description, keep, upgrade12, upgrade15 }) => {
      if (!upgrade12 && !upgrade15 && keep) {
        keepRunes.push(description);
      }
    });

  const files: [string, string[]][] = [
    ['upgrade12.txt', upgrade12Runes],
    ['upgrade15.txt', upgrade15Runes],
    ['keep.txt', keepRunes],
    ['reapp.txt', reappRunes],
    ['sell.txt', sellRunes],
  ];

  files.forEach(async ([fileName, data]) => {
    return await writeFileAsync(fileName, data.join('\n--\n\n'));
  });

  console.log('TOTAL:    ', runes.length);
  console.log('72+ EFF:  ', counter.aboveTarget);
  console.log('KEEP:     ', keepRunes.length);
  console.log('REAPP:    ', reappRunes.length);
  console.log('UPGRADE:  ', upgrade12Runes.length + upgrade15Runes.length);
  console.log('SELL:     ', sellRunes.length);
  console.log('SLOT1:    ', counter[1]);
  console.log('SLOT3:    ', counter[3]);
  console.log('SLOT5:    ', counter[5]);
  console.log('SLOT2:    ', counter[2]);
  console.log('SLOT4:    ', counter[4]);
  console.log('SLOT6:    ', counter[6]);
}

execute();
