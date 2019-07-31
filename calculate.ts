import { target, builds, getSynergy, format } from './util';
import { Rune, Count, StatEffect, Build } from './global.types';
import { RuneSet, RuneQuality, StatType, Action, RuneStat } from './global.enums';

export const calculate = (rune: Rune) => {
  const {
    rune_id,
    slot_no,
    // rank,
    class: rune_grade,
    set_id,
    upgrade_curr,
    pri_eff,
    prefix_eff,
    sec_eff, // [type, value, gem, grind]
    extra,
  } = rune;
  const count: Count = {
    current: 0,
    total: 0,
  }
  const synergy = getSynergy(rune);
  let keep = false;

  let description = `+${upgrade_curr} ${RuneQuality[extra]} ${rune_grade}* Slot ${slot_no} ${RuneSet[set_id]} Rune ID: ${rune_id}\n`;
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
        }
        return;
      }

      description += `${k}: ${(count[k] || 0) + synergy}/${target.total[k]} `;
      if ((count[k] || 0) + synergy >= target.total[k]) {
        keep = true;
      }
    });
  description += '\n';

  const keepBuilds: string[] = [];
  builds.forEach((build: Build) => {
    const sum = build.stats.reduce((acc, curr) => {
      return acc + (count[RuneStat[curr]] || 0)
    }, 0);
    description += `${build.name}: ${sum + synergy}/${build.target} `
    if (sum + synergy >= build.target) {
      keep = true;
      keepBuilds.push(build.name);
    }
  });
  description += '\n\n';

  // determine type of action
  const reapp = slot_no % 2 === 0 && !keep && extra === 5 && rune_grade === 6 && upgrade_curr >= 12;
  const upgrade = upgrade_curr < 12 || (slot_no % 2 === 0 && upgrade_curr < 15);
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
  };
};
