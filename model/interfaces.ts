import { Stat, Monster } from './enums';

export type StatEffect = [Stat, number, number?, number?];

export interface IRune {
  rune_id: number;
  wizard_id: number;
  occupied_type: number;
  occupied_id: number;
  slot_no: number;
  rank: number;
  class: number; // rune grade
  set_id: number;
  upgrade_limit: number;
  upgrade_curr: number;
  base_value: number;
  sell_value: number;
  pri_eff: StatEffect;
  prefix_eff: StatEffect;
  sec_eff: StatEffect[];
  extra: number; // rune quality
  unit?: Monster;
}

export interface SumWarData {
  runes: IRune[],
  unit_list: Unit[],
}

export interface Unit {
  unit_id: number;
  unit_master_id: Monster;
  unit_level: number;
  class: number; // stars
  runes: IRune[],
  con: number;
  atk: number;
  def: number;
  spd: number;
  resist: number;
  accuracy: number;
  critical_rate: number;
  critical_damage: number;
}