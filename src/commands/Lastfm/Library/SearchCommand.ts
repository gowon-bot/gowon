import { convert as romanizeHangeul } from "hangul-romanization";
import pinyin from "pinyin";
import cld from "cld";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { MecabService } from "../../../services/mecab/MecabService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
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

  async clean(string: string, isKeyword:boolean): Promise<{text:string, noWhitespace:boolean}> {
    let processedInput = await this.processLanguage(string, isKeyword);
    processedInput.text = processedInput.text
      .replace(/[\-_'"‘’”“`「」『』«»―~‐⁓,.]+/g, "")
      .replace("&", " and ")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return processedInput;
  }

  private processChinese(input:string) {
    return [pinyin(input).join(""), pinyin(input, {style: pinyin.STYLE_NORMAL}).join(""), input].join("").replace(/\s+/g, "");
  }

  private async processText(input:string, language:string, isKeyword:boolean):Promise<{text:string, noWhitespace:boolean}> {
    switch(language) {
      case "zh":
        if (isKeyword) {
          return {
            text: input,
            noWhitespace: true
          };
        } else {
          return {
            text: this.processChinese(input),
            noWhitespace: true
          };
        }
        
      case "ja":
        if (isKeyword) {
          return {
            text: input,
            noWhitespace: true
          };
        } else {
          return {
            text: await ServiceRegistry.get(MecabService).processJapanese(input),
            noWhitespace: true
          };
        }
      case "kr":
        return {
          text: romanizeHangeul(input),
          noWhitespace: false
        };
      default:
        return {
          text: input,
          noWhitespace: false
        };
    }
  }
  
  private async processLanguage(input:string, isKeyword:boolean) {
    try {
      const language = (await cld.detect(input)).languages[0];
      return await this.processText(input, language.code, isKeyword);
    } catch (err) {
      return await this.processText(input, "en", isKeyword); //fallback to english if no language detected
    }
  
  }

  protected async asyncFilter (arr:any[], predicate:(a: any) => Promise<boolean>) {

    let res:any[] = [];
    for (let entry of arr) {
      if (await predicate(entry)) {
        res.push(entry)
      }
    }
    return res;
  }
}
