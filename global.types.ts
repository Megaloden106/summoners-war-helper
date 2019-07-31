import { RuneStat } from './global.enums';

export interface Target {
  [target: string]: {
    [stat: string]: number;
  };
}

export interface SyngeryGraph {
  [stat: number]: boolean;
}

export interface Multiply {
  [stat: number]: number;
}

export interface Count {
  [stat: string]: number;
}

export type StatEffect = [RuneStat, number, number?, number?];

export interface Rune {
  rune_id: number;
  wizard_id: number;
  occupied_type: number;
  occupied_id: number;
  slot_no: number;
  rank: number;
  class: number;
  set_id: number;
  upgrade_limit: number;
  upgrade_curr: number;
  base_value: number;
  sell_value: number;
  pri_eff: StatEffect;
  prefix_eff: StatEffect;
  sec_eff: StatEffect[];
  extra: number;
}

export interface Build {
  name: string;
  target: number;
  stats: RuneStat[];
}

export interface Grindstone {
  [stat: number]: {
    [grade: number]: number;
  };
}

export interface SumWarData {
  runes: Rune[],
  unit_list: UnitList[],
}

export interface UnitList {
  runes: Rune[],
}
