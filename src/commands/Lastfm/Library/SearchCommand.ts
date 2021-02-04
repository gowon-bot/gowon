import { convert as romanizeHangeul } from "hangul-romanization";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  inputs: {
    keywords: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export abstract class SearchCommand extends LastFMBaseCommand<typeof args> {
  idSeed = "gwsn seokyung";

  shouldBeIndexed = false;
  subcategory = "library";

  arguments: Arguments = args;

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
      .replace(/[\-_'"‘’”“`「」『』«»―~‐⁓,.]+/g, "")
      .replace("&", " and ")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }
}
