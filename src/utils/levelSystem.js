export function getLevel(xp) {

  if (xp < 200) {
    return 1;
  }

  if (xp < 500) {
    return 2;
  }

  if (xp < 900) {
    return 3;
  }

  if (xp < 1400) {
    return 4;
  }

  if (xp < 2000) {
    return 5;
  }

  return Math.floor(xp / 500);
}

export function getXPForNextLevel(level) {

  const levels = {
    1: 200,
    2: 500,
    3: 900,
    4: 1400,
    5: 2000,
  };

  return levels[level] || level * 500;
}

export function getLevelProgress(xp) {

  const level = getLevel(xp);

  const currentLevelXP =
    level === 1
      ? 0
      : getXPForNextLevel(level - 1);

  const nextLevelXP =
    getXPForNextLevel(level);

  const progress =
    ((xp - currentLevelXP) /
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
