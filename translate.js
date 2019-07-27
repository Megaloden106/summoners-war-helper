const builds = require('./builds');

const {
  // enchanted_gem,
  grindstone,
  rune: {
    effectTypes,
    sets,
    quality,
    // substat,
  },
} = require('./decoder');

const translate = (rune) => {
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

  const multiplier = (type, value) => {
    const multipy = {
      SPD: 1.4,
      CRate: 1.4,
      CDmg: 1.4,
      RES: 0.75,
      ACC: 0.75,
    };
    return Math.round(value * (multipy[effectTypes[type]] || 1));
  };

  const stats = {
    current: 0,
    total: 0,
  };

  const format = (type, stat) => {
    if (type === 'Prefix' && stat[0] === 0) {
      return '';
    }
    const grind_grade = 4;

    let string = `${type} Stat: `;
    const { length } = string;

    for (let i = 13; i > length; i -= 1) string += ' ';
    const amount = stat[1] + (stat[3] || 0);
    string += amount;
    for (let i = 5; i > amount.toString().length; i -= 1) string += ' ';
    string += `${effectTypes[stat[0]]}`;
    const isFlat = effectTypes[stat[0]].includes('flat');

    if (type === 'Prefix') {
      for (let i = 14; i > effectTypes[stat[0]].toString().length; i -= 1) string += ' ';
      if (isFlat) {
        string += '-- (0)';
      } else {
        string += `-- (${multiplier(stat[0], stat[1])})`;
        stats.current += multiplier(stat[0], stat[1]);
        stats.total += multiplier(stat[0], stat[1]);
        stats[effectTypes[stat[0]]] = (stats[effectTypes[stat[0]]] || 0)
          + multiplier(stat[0], stat[1]);
      }
    }
    if (type === 'Sub') {
      const max_grind = grindstone[stat[0]].range[grind_grade].max;
      for (let i = 9; i > effectTypes[stat[0]].toString().length; i -= 1) string += ' ';
      string += `- ${stat[3]}`;
      for (let i = 3; i > stat[3].toString().length; i -= 1) string += ' ';
      if (isFlat) {
        let divisor;
        let points;
        if (stat[0] === 1) {
          divisor = (Math.trunc(stat[1] / 300) - 1) * 8;
          points = divisor > 0 ? divisor : 0;
          string += `-- (${points})`;
        } else {
          divisor = (Math.trunc(stat[1] / 15) - 1) * 8;
          points = divisor > 0 ? divisor : 0;
          string += `-- (${points})`;
        }
        stats[effectTypes[stat[0]]] = (stats[effectTypes[stat[0]]] || 0) + points;
      } else {
        string += `-- (${multiplier(stat[0], stat[1] + stat[3])}/${multiplier(stat[0], stat[1] + max_grind)})`;
        stats.current += multiplier(stat[0], stat[1]);
        stats.total += multiplier(stat[0], stat[1] + max_grind);
        stats[effectTypes[stat[0]]] = (stats[effectTypes[stat[0]]] || 0)
          + multiplier(stat[0], stat[1] + max_grind);
      }
    }

    return `${string}\n`;
  };

  const description = `+${upgrade_curr} ${quality[extra]} ${rune_grade}* Slot ${slot_no} ${sets[set_id]} Rune ID: ${rune_id}\n`;
  const main = format('Main', pri_eff);
  const prefix = format('Prefix', prefix_eff);
  let second = '';
  sec_eff.forEach((stat) => {
    second += format('Sub', stat);
  });
  let target = '';
  let keep = false;
  const keepBuilds = [];
  Object.keys(builds).forEach((k) => {
    if (k === 'total') {
      target += `CV: ${stats.current}/${stats.total}/${builds[k].target.slot[slot_no]} `;
      if (stats.total >= builds[k].target.slot[slot_no]) {
        keep = true;
        keepBuilds.push('CV');
      }
    } else {
      const sum = builds[k].stats.reduce((acc, curr) => acc + (stats[curr] || 0), 0);
      target += `${k}: ${sum}/${builds[k].target.slot[slot_no]} `;
      if (sum >= builds[k].target.slot[slot_no]) {
        keep = true;
        keepBuilds.push(k);
      }
    }
  });

  const reapp = slot_no % 2 === 0 && !keep && extra === 5 && rune_grade === 6 && upgrade_curr >= 12;

  const result = reapp
    ? 'REAPP'
    : upgrade_curr < 12 || (slot_no % 2 === 0 && upgrade_curr < 15)
      ? 'UPGRADE'
      : keep
        ? 'KEEP'
        : 'SELL';

  if (keep) {
    target += `\nKEEP - ${keepBuilds.join(', ')}\n\n--\n`;
  } else if (result === 'SELL') {
    target += '\nSELL: REMOVE RUNE NOW!!!\n\n--\n';
  } else {
    target += `\n${result}\n\n--\n`;
  }

  return {
    details: description + main + prefix + second + target,
    slot: slot_no,
    total: stats.total,
    current: stats.current,
    keep,
    upgrade: upgrade_curr < 12,
    reapp,
  };
};

module.exports = translate;
