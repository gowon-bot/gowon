import { convert as romanizeHangeul } from "hangul-romanization";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export abstract class SearchCommand extends LastFMBaseCommand {
  shouldBeIndexed = false;
  subcategory = "library";

  arguments: Arguments = {
    inputs: {
      keywords: { index: { start: 0 } },
    },
    mentions: standardMentions,
  };

  validation: Validation = {
    keywords: [
      new validators.Required({
        message: "please enter some keywords!",
      }),
      new validators.LengthRange({
        min: 1,
        message: "please enter a longer search string!",
      }),
    ],
  };

  clean(string: string): string {
    return romanizeHangeul(string)
      .replace(/[\s\-_'"‘’”“`「」『』«»―~‐⁓,.]+/g, "")
      .replace("&", "and")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }
}
