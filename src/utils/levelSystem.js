const BASE_LEVEL_THRESHOLDS = {
  1: 200,
  2: 500,
  3: 900,
  4: 1400,
  5: 2000,
};

const XP_PER_LEVEL_AFTER_BASE = 500;

function getSafeXP(xp) {
  const safeXP = Number(xp);

  return Number.isFinite(safeXP) && safeXP > 0 ? safeXP : 0;
}

export function getLevel(xp) {
  const safeXP = getSafeXP(xp);

  if (safeXP < BASE_LEVEL_THRESHOLDS[1]) {
    return 1;
  }

  if (safeXP < BASE_LEVEL_THRESHOLDS[2]) {
    return 2;
  }

  if (safeXP < BASE_LEVEL_THRESHOLDS[3]) {
    return 3;
  }

  if (safeXP < BASE_LEVEL_THRESHOLDS[4]) {
    return 4;
  }

  if (safeXP < BASE_LEVEL_THRESHOLDS[5]) {
    return 5;
  }

  return 6 + Math.floor(
    (safeXP - BASE_LEVEL_THRESHOLDS[5]) / XP_PER_LEVEL_AFTER_BASE,
  );
}

export function getXPForNextLevel(level) {
  const safeLevel = Math.max(1, Number(level) || 1);

  return (
    BASE_LEVEL_THRESHOLDS[safeLevel] ||
    BASE_LEVEL_THRESHOLDS[5] +
      (safeLevel - 5) * XP_PER_LEVEL_AFTER_BASE
  );
}

export function getLevelProgress(xp) {
  const safeXP = getSafeXP(xp);

  const level = getLevel(safeXP);

  const currentLevelXP =
    level === 1
      ? 0
      : getXPForNextLevel(level - 1);

  const nextLevelXP =
    getXPForNextLevel(level);

  const progress =
    ((safeXP - currentLevelXP) /
      (nextLevelXP - currentLevelXP)) * 100;

  return Math.min(progress, 100);
}

export function getRankInfo(level) {
  if (level >= 15) {
    return {
      name: "Diamond",
      icon: "◆",
      gradient: "from-cyan-400 via-sky-400 to-indigo-500",
      softBg: "bg-cyan-500/10",
      border: "border-cyan-400/30",
      text: "text-cyan-500",
      glow: "shadow-cyan-500/20",
    };
  }

  if (level >= 10) {
    return {
      name: "Gold",
      icon: "★",
      gradient: "from-amber-300 via-yellow-400 to-orange-500",
      softBg: "bg-amber-500/10",
      border: "border-amber-400/30",
      text: "text-amber-500",
      glow: "shadow-amber-500/20",
    };
  }

  if (level >= 5) {
    return {
      name: "Silver",
      icon: "⬡",
      gradient: "from-slate-300 via-zinc-300 to-slate-500",
      softBg: "bg-slate-500/10",
      border: "border-slate-400/30",
      text: "text-slate-500",
      glow: "shadow-slate-500/20",
    };
  }

  return {
    name: "Bronze",
    icon: "●",
    gradient: "from-orange-400 via-amber-600 to-yellow-800",
    softBg: "bg-orange-500/10",
    border: "border-orange-400/30",
    text: "text-orange-500",
    glow: "shadow-orange-500/20",
  };
}
