import { Stat } from './enums';

export class RuneStat {
  private _stat: string; // Stat
  private _value: number;
  private _gem: boolean;
  private _grind: number;

  private multiplierSpd = 1.65;
  private multiplierCrit = 1.65;

  private targetPerc = 26;
  private targetSpdCrit = 20;

  private grindPerc = 7; // 7 | 10
  private grindSpd = 4; // 4 | 5

  public constructor (stat: [Stat, number, number?, number?]) {
    this._stat = Stat[stat[0]];
    this._value = stat[1];
    this._gem = typeof stat[2] === 'number' ? stat[2] === 1 : null;
    this._grind = typeof stat[3] === 'number' ? stat[3] : null;
  }

  public get gem (): boolean {
    return this._gem;
  }

  public get stat () {
    return this._stat;
  }

  public get value () {
    return this._value;
  }

  public get grind () {
    return this._grind;
  }

  public get currentEffectiveness (): number {
    const { _value, _stat, _grind, grindPerc, grindSpd, multiplierSpd, multiplierCrit } = this;
    let grind: number;
    switch (_stat) {
      /* FLAT Stats */
      case Stat[1]:
        return (_value + _grind) / 60;
      case Stat[3]:
      case Stat[5]:
        return (_value + _grind) / 3;
      /* PERC Stats */
      case Stat[2]:
      case Stat[4]:
      case Stat[6]:
        return _value + _grind;
      /* SPD Stat */
      case Stat[8]:
        return multiplierSpd * (_value + _grind);
      /* CRIT Stat */
      case Stat[9]:
      case Stat[10]:
        return multiplierCrit * _value;
      case Stat[11]:
      case Stat[12]:
        return _value;
    }

  }

  public get targetEffectiveness (): number {
    const { _value, _stat, _grind, grindPerc, grindSpd, multiplierSpd, multiplierCrit } = this;
    let grind: number;
    switch (_stat) {
      /* FLAT Stats */
      case Stat[1]:
        return (_value + _grind) / 60;
      case Stat[3]:
      case Stat[5]:
        return (_value + _grind) / 3;
      /* PERC Stats */
      case Stat[2]:
      case Stat[4]:
      case Stat[6]:
        grind = typeof _grind === 'number'
          ? Math.max(grindPerc, _grind)
          : 0;
        return _value + grind;
      /* SPD Stat */
      case Stat[8]:
        grind = typeof _grind === 'number'
          ? Math.max(grindSpd, _grind)
          : 0;
        return multiplierSpd * (_value + grind);
      /* CRIT Stat */
      case Stat[9]:
      case Stat[10]:
        return multiplierCrit * _value;
      case Stat[11]:
      case Stat[12]:
        return _value;
    }
  }

  public get effectivenessRatio (): string {
    const { _stat, _grind, currentEffectiveness, targetEffectiveness } = this;
    const truncCurrEff = Math.floor(currentEffectiveness);
    const truncTargetEff = Math.floor(targetEffectiveness);
    switch (_stat) {
      /* SPD/PERC Stats */
      case Stat[2]:
      case Stat[4]:
      case Stat[6]:
      case Stat[8]:
        if (_grind === null) {
          return truncTargetEff.toString();
        }
        if (currentEffectiveness < targetEffectiveness) {
          return `${truncCurrEff}/${truncTargetEff}`;
        }
        return `${truncTargetEff}/${truncTargetEff}`;
      default:
        return truncTargetEff.toString();
    }
  }

  public get description (): string {
    const value = this._value
      .toString()
      .padEnd(4)
    return `${value} ${this._stat}`;
  }

  public isAboveTarget (slot: number, grade: number, quality: number): boolean {
    switch (this._stat) {
      /* FLAT Stats */
      case Stat[1]:
      case Stat[3]:
      case Stat[5]:
        return false;
      /* PERC/ACC/RES Stats */
      case Stat[2]:
      case Stat[4]:
      case Stat[6]:
      case Stat[11]:
      case Stat[12]:
        return slot % 2 === 0 && (grade > 5 || (grade > 4 && quality > 10))
          ? this._value >= this.targetPerc - 3
          : this._value >= this.targetPerc;
      /* SPD/CRIT Stat */
      case Stat[8]:
      case Stat[9]:
      case Stat[10]:
        return slot % 2 === 0 && (grade > 5 || (grade > 4 && quality > 10))
          ? this._value >= this.targetSpdCrit - 3
          : this._value >= this.targetSpdCrit;
    }
  }
}