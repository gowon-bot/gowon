export const fishyQuestLevelSize = 25;

export function getFishyLevel(questsCompleted: number) {
  return Math.floor(questsCompleted / fishyQuestLevelSize) + 1;
}
