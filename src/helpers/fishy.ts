export const fishyQuestLevelSize = 15;

export function getFishyLevel(questsCompleted: number) {
  return Math.floor(questsCompleted / fishyQuestLevelSize) + 1;
}
