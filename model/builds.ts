import { Stat } from './enums';

export const builds = [
  {
    name: 'C-DMG',
    target: 41,
    stats: [Stat.CRate, Stat.CDmg],
  }, {
    name: 'S-DMG',
    target: 56,
    stats: [Stat.SPD, Stat.CRate, Stat.CDmg],
  }, {
    name: 'A-DMG',
    target: 51,
    stats: [Stat['ATK%'], Stat['ATK flat'], Stat.CRate, Stat.CDmg],
  }, {
    name: 'FA-DMG',
    target: 57,
    stats: [Stat['ATK%'], Stat['ATK flat'], Stat.SPD, Stat.CRate, Stat.CDmg, Stat.ACC],
  }, {
    name: 'D-DMG',
    target: 51,
    stats: [Stat['DEF%'], Stat['DEF flat'], Stat.CRate, Stat.CDmg],
  }, {
    name: 'FD-DMG',
    target: 57,
    stats: [Stat['DEF%'], Stat['DEF flat'], Stat.SPD, Stat.CRate, Stat.CDmg],
  }, {
    name: 'H-DMG',
    target: 51,
    stats: [Stat['HP%'], Stat['HP flat'], Stat.CRate, Stat.CDmg],
  }, {
    name: 'FH-DMG',
    target: 57,
    stats: [Stat['HP%'], Stat['HP flat'], Stat.SPD, Stat.CRate, Stat.CDmg],
  }, {
    name: 'TANK',
    target: 51,
    stats: [Stat['HP%'], Stat['HP flat'], Stat['DEF%'], Stat['DEF flat'], Stat.RES, Stat.ACC],
  }, {
    name: 'T-DMG',
    target: 57,
    stats: [Stat['HP%'], Stat['HP flat'], Stat['DEF%'], Stat['DEF flat'], Stat.CRate],
  }, {
    name: 'T-DMG',
    target: 63,
    stats: [Stat['HP%'], Stat['HP flat'], Stat['DEF%'], Stat['DEF flat'], Stat.CRate, Stat.CDmg],
  }, {
    name: 'ST-DMG',
    target: 63,
    stats: [Stat['HP%'], Stat['HP flat'], Stat['DEF%'], Stat['DEF flat'], Stat.SPD, Stat.CRate],
  }, {
    name: 'SUPPORT',
    target: 63,
    stats: [Stat['HP%'], Stat['HP flat'], Stat['DEF%'], Stat['DEF flat'], Stat.SPD, Stat.RES, Stat.ACC],
  },
];