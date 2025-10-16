// 游戏常量定义

// 棋盘配置
export const BOARD_SIZE = 15; // 15x15棋盘
export const CELL_SIZE = 40; // 每个格子的像素大小
export const WIN_COUNT = 5; // 获胜所需连子数

// 玩家类型
export const PLAYER = {
  NONE: 0,
  BLACK: 1, // 玩家 - 黑子
  WHITE: 2, // AI - 白子
};

// 游戏阶段
export const GAME_PHASE = {
  READY: 'READY',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  ENDED: 'ENDED',
};

// 游戏结果
export const GAME_RESULT = {
  NONE: null,
  PLAYER_WIN: 'PLAYER_WIN',
  AI_WIN: 'AI_WIN',
  DRAW: 'DRAW',
  BOARD_BROKEN_PLAYER: 'BOARD_BROKEN_PLAYER', // 玩家力拔山兮获胜
  BOARD_BROKEN_AI: 'BOARD_BROKEN_AI', // AI力拔山兮获胜
};

// 技能ID
export const SKILL_ID = {
  FLY_SAND: 'SKILL_01', // 飞沙走石
  PICK_GOLD: 'SKILL_02', // 拾金不昧
  CAPTURE: 'SKILL_03', // 擒擒拿拿
  STILL_WATER: 'SKILL_04', // 静如止水
  WATER_DROP: 'SKILL_05', // 水滴石穿
  MOUNTAIN_POWER: 'SKILL_06', // 力拔山兮
  POLAR_REVERSE: 'SKILL_07', // 两极反转
  RISE_AGAIN: 'SKILL_08', // 东山再起
};

// 技能类型
export const SKILL_TYPE = {
  ATTACK: 'ATTACK', // 进攻型
  DEFENSE: 'DEFENSE', // 防御型
  COUNTER: 'COUNTER', // 反制型
  CONTROL: 'CONTROL', // 控制型
  DECONTROL: 'DECONTROL', // 解控型
  FINISHER: 'FINISHER', // 终结型
  SUPPRESS: 'SUPPRESS', // 克制型
  REVIVE: 'REVIVE', // 复活型
};

// 技能配置
export const SKILLS = {
  [SKILL_ID.FLY_SAND]: {
    id: SKILL_ID.FLY_SAND,
    name: '飞沙走石',
    type: SKILL_TYPE.ATTACK,
    description: '移除对手棋盘上一颗棋子',
    usageCount: 1,
    canBeCountered: true,
    counterSkills: [SKILL_ID.CAPTURE],
    restoreSkills: [SKILL_ID.PICK_GOLD],
  },
  [SKILL_ID.PICK_GOLD]: {
    id: SKILL_ID.PICK_GOLD,
    name: '拾金不昧',
    type: SKILL_TYPE.DEFENSE,
    description: '恢复被【飞沙走石】移除的棋子',
    usageCount: 1,
    requireCondition: 'PIECE_REMOVED',
  },
  [SKILL_ID.CAPTURE]: {
    id: SKILL_ID.CAPTURE,
    name: '擒擒拿拿',
    type: SKILL_TYPE.COUNTER,
    description: '阻止【飞沙走石】生效',
    usageCount: 1,
    counterTarget: SKILL_ID.FLY_SAND,
  },
  [SKILL_ID.STILL_WATER]: {
    id: SKILL_ID.STILL_WATER,
    name: '静如止水',
    type: SKILL_TYPE.CONTROL,
    description: '使对手本回合+下回合无法行动',
    usageCount: 1,
    freezeTurns: 2,
    canBeCountered: true,
    counterSkills: [SKILL_ID.WATER_DROP],
  },
  [SKILL_ID.WATER_DROP]: {
    id: SKILL_ID.WATER_DROP,
    name: '水滴石穿',
    type: SKILL_TYPE.DECONTROL,
    description: '解除【静如止水】效果',
    usageCount: 1,
    requireCondition: 'FROZEN',
  },
  [SKILL_ID.MOUNTAIN_POWER]: {
    id: SKILL_ID.MOUNTAIN_POWER,
    name: '力拔山兮',
    type: SKILL_TYPE.FINISHER,
    description: '摔坏棋盘,直接获胜',
    usageCount: 1,
    canBeCountered: true,
    counterSkills: [SKILL_ID.POLAR_REVERSE],
    restoreSkills: [SKILL_ID.RISE_AGAIN],
  },
  [SKILL_ID.POLAR_REVERSE]: {
    id: SKILL_ID.POLAR_REVERSE,
    name: '两极反转',
    type: SKILL_TYPE.SUPPRESS,
    description: '阻止【力拔山兮】生效',
    usageCount: 1,
    counterTarget: SKILL_ID.MOUNTAIN_POWER,
  },
  [SKILL_ID.RISE_AGAIN]: {
    id: SKILL_ID.RISE_AGAIN,
    name: '东山再起',
    type: SKILL_TYPE.REVIVE,
    description: '恢复被【力拔山兮】摔坏的棋盘',
    usageCount: 1,
    requireCondition: 'BOARD_BROKEN',
  },
};

// 弹窗类型
export const MODAL_TYPE = {
  NONE: null,
  SKILL_CONFIRM: 'SKILL_CONFIRM',
  COUNTER_SKILL: 'COUNTER_SKILL',
  GAME_OVER: 'GAME_OVER',
  SKILL_SELECT_TARGET: 'SKILL_SELECT_TARGET', // 选择技能目标(如飞沙走石选棋子)
};

// AI难度配置
export const AI_DIFFICULTY = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
};

// 棋型评分
export const PATTERN_SCORE = {
  FIVE: 100000, // 五连
  ALIVE_FOUR: 10000, // 活四
  RUSH_FOUR: 5000, // 冲四
  ALIVE_THREE: 2000, // 活三
  SLEEP_THREE: 500, // 眠三
  ALIVE_TWO: 200, // 活二
  SLEEP_TWO: 50, // 眠二
  ONE: 10, // 单子
};

// 方向向量(用于检测连线)
export const DIRECTIONS = [
  [0, 1], // 横向
  [1, 0], // 纵向
  [1, 1], // 主对角线
  [1, -1], // 副对角线
];

// 动画持续时间(毫秒)
export const ANIMATION_DURATION = {
  PLACE_PIECE: 500,
  FLY_SAND: 1200,
  PICK_GOLD: 1000,
  CAPTURE: 800,
  STILL_WATER: 1500,
  WATER_DROP: 1000,
  MOUNTAIN_POWER: 2000,
  POLAR_REVERSE: 1500,
  RISE_AGAIN: 2000,
  WIN_LINE: 3000,
};

// 反制技能倒计时(秒)
export const COUNTER_SKILL_TIMEOUT = 5;
