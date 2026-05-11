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