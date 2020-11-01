import { CrownState } from "../services/dbservices/CrownsService";

export function createInvalidBadge(state?: CrownState): string {
  return state === CrownState.inactivity
    ? " [Inactive]"
    : state === CrownState.left
    ? " [Left the server]"
    : state === CrownState.purgatory
    ? " [Purgatory]"
    : state === CrownState.banned
    ? " [Crown banned]"
    : "";
}
