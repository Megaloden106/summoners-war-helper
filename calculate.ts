import { target, builds, getSynergy, format, multiplier } from './util';
import { Rune, Count, StatEffect, Build } from './global.types';
import { RuneSet, RuneQuality, StatType, Action, RuneStat, Monster } from './global.enums';

export const calculate = (rune: Rune) => {
  const {
    rune_id,
    slot_no,
    rank,
    class: rune_grade,
    set_id,
    upgrade_curr,
    pri_eff,
    prefix_eff,
    sec_eff, // [type, value, gem, grind]
    extra,
    unit,
  } = rune;
  const count: Count = {
    current: 0,
    total: 0,
  }
  const synergy = getSynergy(rune);
  let keep = false;
  const keepBuilds: string[] = [];

  // if (unit && !Monster[unit]) {
  //   console.log(unit)
  // }
  let description = `+${upgrade_curr} ${RuneQuality[extra]} ${rune_grade}* Slot ${slot_no} ${RuneSet[set_id]} Rune ID: ${rune_id} Owner: ${unit ? Monster[unit] : 'INV'}\n`;
  description += format(StatType.Main, pri_eff, count);
  description += format(StatType.Prefix, prefix_eff, count);
  sec_eff.forEach((stat: StatEffect) => description += format(StatType.Sub, stat, count));
  description += `Synergy:                        -- (${synergy})\n`;

  Object.keys(target.total)
    .forEach((k) => {
      if (k === 'CV') {
        description += `${k}: ${count.current + synergy}/${count.total + synergy}/${target.total[k]} `;
        if (count.total + synergy >= target.total[k]) {
          keep = true;
          keepBuilds.push('CV');
        }
        return;
      }

      let targetTotal = target.total[k];
      if (slot_no % 2 === 0) {
        // @ts-ignore
        targetTotal -= multiplier(RuneStat[k], 3);
      }
      description += `${k}: ${count[k] || 0}/${targetTotal} `;
      if ((count[k] || 0) >= targetTotal) {
        keep = true;
      }
    });
  description += '\n';
  builds.forEach((build: Build) => {
    const sum = build.stats.reduce((acc, curr) => {
      return acc + (count[RuneStat[curr]] || 0)
    }, 0);
    description += `${build.name}: ${sum}/${build.target} `
    if (sum >= build.target) {
      keep = true;
      keepBuilds.push(build.name);
    }
  });
  description += '\n\n';

  // determine type of action
  const reapp = slot_no % 2 === 0 && !keep && extra === 5 && rune_grade === 6 && upgrade_curr >= 12;
  const upgrade = upgrade_curr < 12;
  const action = reapp ? Action.Reapp
    : upgrade ? Action.Upgrade
      : keep ? Action.Keep : Action.Sell;

  switch (action) {
    case Action.Keep:
      description += `KEEP - ${keepBuilds.join(', ')}\n\n--\n`;
      break;
    case Action.Sell:
      description += 'SELL: REMOVE RUNE NOW!!!\n\n--\n';
      break;
    case Action.Upgrade:
    case Action.Reapp:
    default:
      description += `${action}\n\n--\n`;
      break;
  }

  return {
    description,
    slot: slot_no,
    keep,
    upgrade,
    reapp,
    total: count.total + synergy,
    set: set_id,
  };
};
