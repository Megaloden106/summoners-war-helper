import { SyngeryGraph, Target, Rune, Build, Multiply, Grindstone, StatEffect, Count } from './global.types';
import { RuneStat, RuneSet, StatType } from './global.enums';

export const target: Target = {
  total: {
    CV: 62,
    SPD: 31, // 28 - 18/16
    CRate: 28, // 24 - 20/17
    CDmg: 28,
    ATK: 32, // 29 - 25/22
    HP: 32,
    DEF: 32,
  },
  substat: {
    'HP flat': 300,
    'ATK flat': 15,
    'DEF flat': 15,
  },
  grade: {
    grind: 4,
  }
};

const grindstone: Grindstone = {
  [RuneStat['HP%']]: {
    4: 7,
    5: 10,
  },
  [RuneStat['ATK%']]: {
    4: 7,
    5: 10,
  },
  [RuneStat['DEF%']]: {
    4: 7,
    5: 10,
  },
  [RuneStat.SPD]: {
    4: 4,
    5: 5,
  },
}

export const builds: Build[] = [
  {
    name: 'S-DMG',
    target: 42,
    stats: [RuneStat.SPD, RuneStat.CRate, RuneStat.CDmg],
  }, {
    name: 'A-DMG',
    target: 42,
    stats: [RuneStat['ATK%'], RuneStat['ATK flat'], RuneStat.CRate, RuneStat.CDmg],
  }, {
    name: 'D-DMG',
    target: 42,
    stats: [RuneStat['DEF%'], RuneStat['DEF flat'], RuneStat.CRate, RuneStat.CDmg],
  }, {
    name: 'H-DMG',
    target: 42,
    stats: [RuneStat['HP%'], RuneStat['HP flat'], RuneStat.CRate, RuneStat.CDmg],
  }, {
    name: 'T-DMG',
    target: 48,
    stats: [RuneStat['HP%'], RuneStat['HP flat'], RuneStat['DEF%'], RuneStat['DEF flat'], RuneStat.CRate],
  }, {
    name: 'TANK',
    target: 48,
    stats: [RuneStat['HP%'], RuneStat['HP flat'], RuneStat['DEF%'], RuneStat['DEF flat']],
  },
];

const multiplier = (type: RuneStat, value: number) => {
  const multipy: Multiply = {
    [RuneStat.SPD]: 1.4,
    [RuneStat.CRate]: 1.4,
    [RuneStat.CDmg]: 1.4,
  };
  return Math.round(value * (multipy[type] || 1));
};

const synergy: SyngeryGraph = {
  [RuneStat['HP%']]: true,
  [RuneStat['ATK%']]: true,
  [RuneStat['DEF%']]: true,
  [RuneStat.SPD]: true,
  [RuneStat.CRate]: true,
  [RuneStat.CDmg]: true,
};

const synergyPoints = {
  primary: 3,
  secondary: 2,
  flat: 1,
  slot: 3,
  set: 3,
}

export const getSynergy = ({
  pri_eff,
  prefix_eff,
  sec_eff,
  slot_no,
  set_id,
}: Rune): number => {
  const stats = [prefix_eff, ...sec_eff];

  let points = 0;
  points += set_id === RuneSet.Fight ? synergyPoints.set : 0;
  points += slot_no === 6 ? synergyPoints.slot : 0;
  points += synergy[pri_eff[0]] ? synergyPoints.primary : 0;

  // ATK% Main Stat
  if (pri_eff[0] === RuneStat['ATK%']) {
    stats.forEach(stat => {
      const hasSynergy = stat[0] === RuneStat.SPD
        || stat[0] === RuneStat.CRate
        || stat[0] === RuneStat.CDmg;
      points += hasSynergy ? synergyPoints.secondary : 0;

      points += stat[0] === RuneStat['ATK flat']
        && stat[1] > target.substat['ATK flat']
          ? synergyPoints.flat : 0;
    });
  }

  // DEF% Main Stat
  if (pri_eff[0] === RuneStat['DEF%']) {
    stats.forEach(stat => {
      const hasSynergy = stat[0] === RuneStat.SPD
        || stat[0] === RuneStat.CRate
        || stat[0] === RuneStat.CDmg;
      points += hasSynergy ? synergyPoints.secondary : 0;

      points += stat[0] === RuneStat['DEF flat']
        && stat[1] > target.substat['DEF flat']
          ? synergyPoints.flat : 0;
    });
  }

  // HP% Main Stat
  if (pri_eff[0] === RuneStat['HP%']) {
    stats.forEach(stat => {
      const hasSynergy = stat[0] === RuneStat.SPD
        || stat[0] === RuneStat.CRate;
      points += hasSynergy ? synergyPoints.secondary : 0;

      points += stat[0] === RuneStat['HP flat']
        && stat[1] > target.substat['HP flat']
          ? synergyPoints.flat : 0;
    });
  }

  // CDmg Main Stat
  if (pri_eff[0] === RuneStat.CDmg) {
    stats.forEach(stat => {
      const hasSynergy =stat[0] === RuneStat.SPD
        || stat[0] === RuneStat.CRate
        || stat[0] === RuneStat['ATK%']
        || stat[0] === RuneStat['DEF%']
        || stat[0] === RuneStat['HP%'];
      points += hasSynergy ? synergyPoints.secondary : 0;
    });
  }

  // CRate Main Stat
  if (pri_eff[0] === RuneStat.CRate) {
    stats.forEach(stat => {
      const hasSynergy =stat[0] === RuneStat.SPD
        || stat[0] === RuneStat.CDmg
        || stat[0] === RuneStat['ATK%']
        || stat[0] === RuneStat['DEF%']
        || stat[0] === RuneStat['HP%'];
      points += hasSynergy ? synergyPoints.secondary : 0;
    });
  }

  // SPD Main Stat
  if (pri_eff[0] === RuneStat.SPD) {
    stats.forEach(stat => {
      const hasSynergy =stat[0] === RuneStat.CRate
        || stat[0] === RuneStat.CDmg
        || stat[0] === RuneStat['ATK%']
        || stat[0] === RuneStat['DEF%']
        || stat[0] === RuneStat['HP%'];
      points += hasSynergy ? synergyPoints.secondary : 0;
    });
  }

  // Other Main Stat, no speed, sell for even slots
  if (slot_no % 2 === 0
    && (pri_eff[0] === RuneStat['HP flat']
      || pri_eff[0] === RuneStat['DEF flat']
      || pri_eff[0] === RuneStat['ATK flat']
      || pri_eff[0] === RuneStat.ACC
      || pri_eff[0] === RuneStat.RES
  )) {
    let hasSpeed = false;
    stats.forEach(stat => {
      if (stat[0] === RuneStat.SPD) {
        hasSpeed = true;
      }
    });
    if (!hasSpeed) {
      points -= 25;
    }
  }

  return points;
}

export const format = (type: StatType, stat: StatEffect, count: Count) => {
  if (type === StatType.Prefix && stat[0] === 0) {
    return '';
  }

  let statLine = `${type} Stat: `;
  const { length } = statLine;

  for (let i = 13; i > length; i -= 1) statLine += ' ';
  const amount = stat[1] + (stat[3] || 0);
  statLine += amount;

  for (let i = 5; i > amount.toString().length; i -= 1) statLine += ' ';
  statLine += `${RuneStat[stat[0]]}`;
  const isFlat = RuneStat[stat[0]].includes('flat');

  if (type === StatType.Prefix) {
    for (let i = 14; i > RuneStat[stat[0]].toString().length; i -= 1) statLine += ' ';
    if (isFlat) {
      statLine += '-- (0)';
    } else {
      statLine += `-- (${multiplier(stat[0], stat[1])})`;
      count.current += multiplier(stat[0], stat[1]);
      count.total += multiplier(stat[0], stat[1]);
      count[RuneStat[stat[0]]] = (count[RuneStat[stat[0]]] || 0)
        + multiplier(stat[0], stat[1]);
    }
  }

  if (type === 'Sub') {
    const maxGrind = grindstone[stat[0]] ? grindstone[stat[0]][target.grade.grind] : 0;
    for (let i = 9; i > RuneStat[stat[0]].toString().length; i -= 1) statLine += ' ';
    statLine += `- ${stat[3]}`;
    for (let i = 3; i > (stat[3] as number).toString().length; i -= 1) statLine += ' ';
    if (isFlat) {
      let divisor;
      let points;
      if (stat[0] === RuneStat['HP flat']) {
        divisor = (Math.trunc(stat[1] / 300)) * 8;
        points = divisor > 0 ? divisor : 0;
        statLine += `-- (${points})`;
      } else {
        divisor = (Math.trunc(stat[1] / 15)) * 8;
        points = divisor > 0 ? divisor : 0;
        statLine += `-- (${points})`;
      }
      count[RuneStat[stat[0]]] = (count[RuneStat[stat[0]]] || 0) + points;
    } else {
      statLine += `-- (${multiplier(stat[0], stat[1] + (stat[3] as number))}/${multiplier(stat[0], stat[1] + maxGrind)})`;
      count.current += multiplier(stat[0], stat[1]);
      count.total += multiplier(stat[0], stat[1] + maxGrind);
      count[RuneStat[stat[0]]] = (count[RuneStat[stat[0]]] || 0)
        + multiplier(stat[0], stat[1] + maxGrind);
    }
  }

  return `${statLine}\n`;
}
