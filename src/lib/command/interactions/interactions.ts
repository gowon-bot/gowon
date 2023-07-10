import { toInt } from "../../../helpers/lastfm";

const parameterPlaceholder = "?";

export enum InteractionID {
  SelectPlaylist = "select-playlist/?",
  PlaylistSubmit = `submit-playlist/?`,
}

export function matchesInteractionID(
  customID: string,
  interaction: InteractionID
): boolean {
  return (
    !!customID.split("/")[0] &&
    customID.split("/")[0] === interaction.toString().split("/")[0]
  );
}

export function composeInteractionID(
  interaction: InteractionID,
  parameter?: number
): string {
  return parameter
    ? interaction.replace(parameterPlaceholder, parameter.toString())
    : interaction;
}

export function decomposeInteractionID(interaction: string): number {
  return toInt(interaction.split("/")[1]);
}
