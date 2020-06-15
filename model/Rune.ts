import { ESet, Quality, Stat, Monster } from './enums';
import { IRune, Unit } from './interfaces';
import { RuneStat } from './RuneStat';
import { builds } from './builds';

export class Rune {
  private _id: number;
  private _set: string; // ESet
  private _slot: number;
  private grade: number;
  private quality: string; // Quality
  private upgrade: number;
  private mainStat: RuneStat;
  private prefixStat: RuneStat;
  private subStats: RuneStat[];
  private unitId: number;
  private _unit: Monster;

  private builds = builds;
  private targetMain = ['HP%', 'ATK%', 'DEF%', 'SPD', 'CRate', 'CDmg']
  private targetCV = 72;
  private targetSpd = 20;

  private bonusMain = 2;
  private bonusSub = 1;
  private bonusFlat = 1;

  private bonusSlot = 3;
  private bonusSet = 3;
  private bonusGrade = 2;

  private bonusStats = ['SPD', 'CDmg'];
  private bonusSets = ['Fight', 'Despair', 'Violent', 'Rage'];
  private bonusSlots = [6];
  private bonusPerc = ['SPD', 'CRate', 'CDmg'];
  private bonusSpdCrit = ['SPD', 'CRate', 'CDmg', 'ATK%', 'DEF%', 'HP%'];

  private reappQualitys = [Quality[5], Quality[14], Quality[15]];

  public constructor (rune: IRune, unit?: Unit) {
    this._id = rune.rune_id;
    this._set = ESet[rune.set_id];
    this._slot = rune.slot_no;
    this.grade = rune.class;
    this.quality = Quality[rune.extra];
    this.upgrade = rune.upgrade_curr;
    this.mainStat = new RuneStat(rune.pri_eff);
    this.prefixStat = rune.prefix_eff[1] > 0 ? new RuneStat(rune.prefix_eff) : null;
    this.subStats = rune.sec_eff.map(stat => new RuneStat(stat));
    this.unitId = unit?.unit_id || null;
    this._unit = unit?.unit_master_id || 0;
  }

  public get id (): number {
    return this._id;
  }

  public get slot (): number {
    return this._slot;
  }

  public get set (): string {
    return this._set;
  }

  public get unit (): Monster {
    return this._unit;
  }

  public get isEven (): boolean {
    return this.slot % 2 === 0;
  }

  public get keep (): boolean {
    return this.isAboveTarget
      || this.statsAboveTarget.length > 0
      || this.buildsAboveTarget.length > 0;
  }

  public get reapp (): boolean {
    return !this.keep
      && this.isEven
      && this.reappQualitys.includes(this.quality)
      && this.targetMain.includes(this.mainStat.stat);
  }

  public get upgrade12 (): boolean {
    return this.upgrade < 12;
  }

  public get upgrade15 (): boolean {
    return this.keep
      && this.upgrade < 15
      && this.isEven
      && this.unitId !== null;
  }

  public get gem (): boolean {
    return false;
  }

  public get effectivenessByStat (): { [stat: string]: number } {
    const initialEffectivenessByStat = this.prefixStat
      ? { [this.prefixStat.stat]: this.prefixStat.targetEffectiveness }
      : { }
    return this.subStats.reduce(
      (acc, { stat, targetEffectiveness }) => {
        acc[stat] = targetEffectiveness;
        return acc;
      },
      initialEffectivenessByStat,
    )
  }

  public get currentEffectiveness (): number {
    return Math.floor(
      this.subStats.reduce(
        (acc, { currentEffectiveness }) => acc + currentEffectiveness,
        this.prefixStat?.currentEffectiveness || 0,
      ),
    );
  }

  public get targetEffectiveness (): number {
    return Math.floor(
      this.subStats.reduce(
        (acc, { targetEffectiveness }) => acc + targetEffectiveness,
        this.prefixStat?.targetEffectiveness || 0,
      ),
    );
  }

  public get bonusEffectiveness (): number {
    let bonusEffectiveness = 0;
    if (!this.isEven) {
      return bonusEffectiveness;
    }

    // good primary stat
    if (this.targetMain.includes(this.mainStat.stat)) {
      bonusEffectiveness += this.bonusMain;

      // good set +3
      bonusEffectiveness += this.bonusSets.includes(this._set) ? this.bonusSet: 0;

      // good slot + 3
      bonusEffectiveness += this.bonusSlots.includes(this._slot) ? this.bonusSlot : 0;

      // 6* +2
      bonusEffectiveness += this.grade === 6 ? this.bonusGrade : 0;

      // spd or crit damage 6* +2
      bonusEffectiveness += this.grade === 6 && this.bonusStats.includes(this.mainStat.stat)
        ? this.bonusMain
        : 0;
    }

    switch (this.mainStat.stat) {
      case 'ATK%':
      case 'DEF%':
      case 'HP%':
        bonusEffectiveness += this.subStats.reduce(
          (acc, { stat }) => this.bonusPerc.includes(stat)
            ? acc + this.bonusSub
            : acc,
          0,
        );
        break;
      case 'SPD':
      case 'CRate':
      case 'CDmg':
        bonusEffectiveness += this.subStats.reduce(
          (acc, { stat }) => this.bonusSpdCrit.includes(stat)
            ? acc + this.bonusSub
            : acc,
          0,
        );
        break;
      default:
        const [hasSpeed, totalSpeed] = this.subStats.reduce(
          (acc, { stat, value }) => [acc[0] || stat === 'SPD', acc[1] + value],
          [false, 0],
        );
        if (!hasSpeed || totalSpeed < this.targetSpd || this._slot === 2) {
          return -50;
        }
        break;
    }

    return bonusEffectiveness;
  }

  public get isAboveTarget (): boolean {
    return this.targetEffectiveness + this.bonusEffectiveness > this.targetCV;
  }

  public get statsAboveTarget (): string[] {
    return this.subStats.reduce(
      (acc,  curr) => {
        const isAboveTarget = curr.isAboveTarget.call(
          curr,
          this._slot,
          this.grade,
          Quality[this.quality],
        )
        if (isAboveTarget) {
          return acc.concat(curr.stat);
        }
        return acc;
      },
      [],
    )
  }

  public get buildsAboveTarget (): string[] {
    const { effectivenessByStat, mainStat } = this;
    return this.builds.reduce(
      (acc, { name, stats, target }) => {
        const initialEffectiveness = stats.includes(Stat[mainStat.stat]) ? 13 : 0;
        const effectivenessByBuiid = stats.reduce((acc, stat) => acc + (effectivenessByStat[Stat[stat]] || 0), initialEffectiveness);
        return effectivenessByBuiid > target ? acc.concat(name) : acc;
      },
      [],
    );
  }

  public get buildsEffectivenessRatio (): string[] {
    const { effectivenessByStat, mainStat } = this;
    return this.builds.reduce(
      (acc, { name, stats, target }) => {
        const initialEffectiveness = stats.includes(Stat[mainStat.stat]) ? 13 : 0;
        const effectivenessByBuiid = stats.reduce((acc, stat) => acc + (effectivenessByStat[Stat[stat]] || 0), initialEffectiveness);
        return effectivenessByBuiid > 0 ? acc.concat(`${name}: ${Math.floor(effectivenessByBuiid)}/${target}`) : acc;
      },
      [],
    );
  }

  public get description (): string {
    const { prefixStat, upgrade, quality, grade, slot, set, id, unit, statsAboveTarget, buildsAboveTarget, buildsEffectivenessRatio } = this;
    const prefix = prefixStat ? `Prefix Stat: ${prefixStat.description.padEnd(17)} -- (${prefixStat.effectivenessRatio})\n` : '';
    const stats = statsAboveTarget.length > 0 ? `Stats: ${statsAboveTarget.join(', ')}\n` : ''
    const builds = buildsAboveTarget.length > 0 ? `Builds: ${buildsAboveTarget.join(', ')}\n` : ''
    return `+${upgrade} ${quality} ${grade}* Slot ${slot} ${set} Rune ID: ${id} Owner: ${Monster[unit]}\n`
      + `Main Stat:   ${this.mainStat.description}\n`
      + prefix
      + this.subStats.reduce(
        (acc, { description, grind, effectivenessRatio }) => acc
          + `Sub Stat:    ${description.padEnd(13)} - ${grind} -- (${effectivenessRatio})\n`,
        '')
      + `Bonus:                         -- (${this.bonusEffectiveness})\n\n`
      + `CV: ${this.currentEffectiveness}/${this.targetEffectiveness}/${this.targetCV}\n`
      + `${buildsEffectivenessRatio.join(' ')}\n`
      + stats
      + builds
  }
}