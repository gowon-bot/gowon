import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  rank: new NumberArgument({
    description: "The rank to lookup",
    required: true,
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class AlbumAt extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan hyeyeon";

  aliases = ["ala"];
  description = "Finds the album in your library at a given rank";
  subcategory = "ranks";
  usage = ["", "rank @user"];

  arguments = args;
  slashCommand = true;

  validation: Validation = {
    rank: new validators.NumberValidator({ whole: true }),
  };

  // merged with !albumrank
  archived = true;

  async run() {}
}
