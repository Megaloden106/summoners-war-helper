module.exports = {
  total: {
    target: {
      slot: {
        1: 62,
        2: 53,
        3: 62,
        4: 53,
        5: 62,
        6: 53,
      },
    },
  },
  CR: { // 20
    target: {
      slot: {
        1: 28,
        2: 24,
        3: 28,
        4: 24,
        5: 28,
        6: 24,
      },
    },
    stats: ['CR'],
  },
  CDMG: { // 20
    target: {
      slot: {
        1: 28,
        2: 24,
        3: 28,
        4: 24,
        5: 28,
        6: 24,
      },
    },
    stats: ['CDmg'],
  },
  SPD: { // 18
    target: {
      slot: {
        1: 31,
        2: 27,
        3: 31,
        4: 27,
        5: 31,
        6: 27,
      },
    },
    stats: ['SPD'],
  },
  'SPD-CR': { // 22
    target: {
      slot: {
        1: 36,
        2: 31,
        3: 36,
        4: 31,
        5: 36,
        6: 31,
      },
    },
    stats: ['SPD', 'CRate'],
  },
  CRD: { // 24
    target: {
      slot: {
        1: 34,
        2: 29,
        3: 34,
        4: 29,
        5: 34,
        6: 29,
      },
    },
    stats: ['CRate', 'CDmg'],
  },
  'SPD-CDMG': { // 26
    target: {
      slot: {
        1: 42,
        2: 36,
        3: 42,
        4: 36,
        5: 42,
        6: 36,
      },
    },
    stats: ['SPD', 'CRate', 'CDmg'],
  },
  'A-DMG': {
    target: {
      slot: {
        1: 32,
        2: 27,
        3: 32,
        4: 27,
        5: 32,
        6: 27,
      },
    },
    stats: ['CDmg', 'ATK%', 'ATK flat'],
  },
  'H-DMG': {
    target: {
      slot: {
        1: 32,
        2: 27,
        3: 32,
        4: 27,
        5: 32,
        6: 27,
      },
    },
    stats: ['CDmg', 'HP%', 'HP flat'],
  },
  'D-DMG': {
    target: {
      slot: {
        1: 32,
        2: 27,
        3: 32,
        4: 27,
        5: 32,
        6: 27,
      },
    },
    stats: ['CDmg', 'DEF%', 'DEF flat'],
  },
  TANK: {
    target: {
      slot: {
        1: 48,
        2: 40,
        3: 48,
        4: 40,
        5: 48,
        6: 40,
      },
    },
    stats: ['HP%', 'DEF%', 'HP flat', 'DEF flat'],
  },
  'TANK-DMG': {
    target: {
      slot: {
        1: 48,
        2: 40,
        3: 48,
        4: 40,
        5: 48,
        6: 40,
      },
    },
    stats: ['CRate', 'HP%', 'DEF%', 'HP flat', 'DEF flat'],
  },
};
