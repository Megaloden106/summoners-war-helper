import { SyngeryGraph, Target, Rune, Build, Multiply, Grindstone, StatEffect, Count } from './global.types';
import { RuneStat, StatType, Monster } from './global.enums';

const VALUE_MODIFIER = 3;

export const target: Target = {
  total: {
    CV: 62 + VALUE_MODIFIER,
    // SPD: 31, // 18/15
    // CRate: 28, // 20/17
    // CDmg: 28,
    // 'ATK%': 32, // 25/22
    // 'HP%': 32,
    // 'DEF%': 32,
    SPD: 33, // 20/17
    CRate: 30, // 21/18
    CDmg: 30,
    'ATK%': 35, // 28/25
    'HP%': 35,
    'DEF%': 35,
    ACC: 28,
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
    name: 'C-DMG',
    target: 36 + VALUE_MODIFIER,
    stats: [RuneStat.CRate, RuneStat.CDmg],
  }, {
    name: 'S-DMG',
    target: 42 + VALUE_MODIFIER,
    stats: [RuneStat.SPD, RuneStat.CRate, RuneStat.CDmg],
  }, {
    name: 'A-DMG',
    target: 42 + VALUE_MODIFIER,
    stats: [RuneStat['ATK%'], RuneStat['ATK flat'], RuneStat.CRate, RuneStat.CDmg],
  }, {
    name: 'D-DMG',
    target: 42 + VALUE_MODIFIER,
    stats: [RuneStat['DEF%'], RuneStat['DEF flat'], RuneStat.CRate, RuneStat.CDmg],
  }, {
    name: 'H-DMG',
    target: 42 + VALUE_MODIFIER,
    stats: [RuneStat['HP%'], RuneStat['HP flat'], RuneStat.CRate, RuneStat.CDmg],
  }, {
    name: 'T-DMG',
    target: 48 + VALUE_MODIFIER,
    stats: [RuneStat['HP%'], RuneStat['HP flat'], RuneStat['DEF%'], RuneStat['DEF flat'], RuneStat.CRate],
  }, {
    name: 'TANK',
    target: 48 + VALUE_MODIFIER,
    stats: [RuneStat['HP%'], RuneStat['HP flat'], RuneStat['DEF%'], RuneStat['DEF flat']],
  },
];

export const multiplier = (type: RuneStat, value: number) => {
  const multipy: Multiply = {
    [RuneStat.SPD]: 1.4,
    [RuneStat.CRate]: 1.4,
    [RuneStat.CDmg]: 1.4,
    [RuneStat.RES]: 0.85,
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
  // even slot points
  primary: 2,
  secondary: 1,
  flat: 1,

  // set points
  slot: 3,
  stat: 3,
  set: 3,
  grade: 2,
}

export const getSynergy = ({
  pri_eff,
  prefix_eff,
  sec_eff,
  slot_no,
  set_id,
  class: rune_grade,
}: Rune): number => {
  const stats = [prefix_eff, ...sec_eff];

  let points = 0;
  // rift sets
  points += set_id > 18 ? synergyPoints.set : 0;

  // slot 6
  points += slot_no === 6 && synergy[pri_eff[0]] ? synergyPoints.slot : 0;

  // even slot with good primary
  points += slot_no % 2 === 0 && synergy[pri_eff[0]] ? synergyPoints.primary : 0;

  // even slot with good primary and 6*
  points += slot_no % 2 === 0 && synergy[pri_eff[0]] && rune_grade === 6 ? synergyPoints.grade : 0;

  // speed + cdmg primary points
  points += pri_eff[0] === RuneStat.CDmg || pri_eff[0] === RuneStat.SPD ? synergyPoints.stat : 0

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
        || stat[0] === RuneStat.CRate
        || stat[0] === RuneStat.CDmg;
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
    let totalSpeed = 0;
    stats.forEach(stat => {
      if (stat[0] === RuneStat.SPD) {
        hasSpeed = true;
        totalSpeed += stat[1];
      }
    });
    if ((!hasSpeed && totalSpeed < 20 )|| slot_no === 2) {
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
        divisor = Math.trunc(stat[1] / target.substat['HP flat'] * 5);
        points = divisor > 0 ? divisor : 0;
        statLine += `-- (${points})`;
      } else {
        divisor = Math.trunc(stat[1] / target.substat['ATK flat'] * 5);
        points = divisor > 0 ? divisor : 0;
        statLine += `-- (${points})`;
      }
      count.total += points;
      count[RuneStat[stat[0]]] = (count[RuneStat[stat[0]]] || 0) + points;
    } else {
      statLine += `-- (${multiplier(stat[0], stat[1] + (stat[3] as number))}/${multiplier(stat[0], stat[1] + maxGrind)})`;
      count.current += multiplier(stat[0], stat[1] + (stat[3] as number));
      count.total += multiplier(stat[0], stat[1] + maxGrind);
      count[RuneStat[stat[0]]] = (count[RuneStat[stat[0]]] || 0)
        + multiplier(stat[0], stat[1] + maxGrind);
    }
  }

  return `${statLine}\n`;
}

export const unitFilter = [
  Monster.Lisa,
  Monster.Emma,
  Monster.Psamathe,
  Monster.Colleen,
  Monster.Kahli,
  Monster.Galleon,
  Monster.Arnold,
  Monster.Lushen,
  Monster.Khmun,
  Monster.Julie,
  Monster.Hraesvelg,
  Monster.Shaina,
  Monster.Juno,
  Monster.Arnold,
  Monster.Zinc,
  Monster.Seara,
  Monster.Tesarion,
  Monster.Harmonia,
  Monster.Maruna,
  Monster.Isis,
  Monster.Eladriel,
  Monster.Mav,
  Monster.Chasun,
  Monster.Racuni,
  Monster.Jeanne,
  Monster.Olivia,
  Monster['Homunculus - Support (Light)'],
  Monster['Homunculus - Attack (Wind)'],
  Monster.Aegir,
  Monster.Sabrina,
  Monster.Ramahan,
  Monster.Theomars,
  Monster.Diana,
  Monster.Fran,
  Monster.Ludo,
  Monster.Perna,
  Monster.Talia,
  Monster.Anavel,
  Monster.Verdehile,
  Monster.Velajuel,
  Monster.Triana,
  Monster.Qebehsenuef,
  Monster.Avaris,
  Monster.Sekhmet,
  Monster.Bellenus,
  Monster.Beth,
  Monster.Rica,
  Monster.Hyanes,
  Monster.Ethna,
  Monster.Ariel,
  Monster.Copper,
  Monster.Katarina,
  Monster.Bernard,
  Monster.Woosa,
  Monster.Orion,
  Monster.Imesety,
  Monster.Chloe,
  Monster.Dias,
  Monster.Darion,
  Monster['Xiao Lin'],
  Monster.Skogul,
  Monster.Bulldozer,
  Monster.Stella,
  Monster.Susano,
  Monster.Rina,
  Monster.Iselia2A,
  Monster.Dias,
  Monster.Taor,
  Monster.Hwa,
  Monster.Tractor,
  Monster.Briand,
  Monster.Halphas,
  Monster.Tyron,
  Monster['Mei Hou Wang'],
  Monster['Homunculus - Support (Dark)'],
  Monster.Iunu,
  Monster.Elsharion,
  Monster.Hathor,
  Monster.Belladeon2A,
  Monster.Vanessa,
  Monster.Chilling,
  Monster.Atenai,
  Monster.Gemini,
  Monster.Ramagos2A,
  Monster.Mihyang,
  Monster.Dagora,
  Monster['Unawakened Shihwa'],
  Monster['Unawakened Hwa'],
  Monster.Ramahan2A,
]