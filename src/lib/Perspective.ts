import { User as DiscordUser } from "discord.js";
import { ucFirst } from "../helpers";

export class Perspective {
  discordUser?: DiscordUser;
  private titlecase = false;

  // Static methods
  static buildPerspective(name: string, different: boolean): Perspective {
    return new Perspective(
      different,
      name,
      !different ? "your" : name + "'s",
      !different ? "you" : "they",
      !different ? "your" : "their",
      !different ? "you" : "them",
      !different ? "you are" : name + " is",
      !different ? "you are" : "they are",
      !different ? "you have" : name + " has",
      !different ? "you have" : "they have"
    );
  }

  static perspective(
    authorUsername: string,
    username?: string,
    asCode = false
  ): Perspective {
    if (username === undefined || authorUsername === username) {
      return Perspective.buildPerspective("you", false);
    } else {
      return Perspective.buildPerspective(
        asCode ? username!.code() : username!,
        true
      );
    }
  }

  static discordPerspective(
    author: DiscordUser,
    mentioned?: DiscordUser
  ): Perspective {
    if (mentioned === undefined || author.id === mentioned.id) {
      return Perspective.buildPerspective("you", false).addDiscordUser(author);
    } else {
      return Perspective.buildPerspective(
        mentioned?.username,
        true
      ).addDiscordUser(mentioned);
    }
  }

  // Instance methods
  constructor(
    private different: boolean,
    private _name: string,
    private _possessive: string,
    private _pronoun: string,
    private _possessivePronoun: string,
    private _objectPronoun: string,
    private _plusToBe: string,
    private _pronounPlusToBe: string,
    private _plusToHave: string,
    private _pronounPlusToHave: string
  ) {}

  get upper(): Perspective {
    // prettier-ignore
    let newPerspective = new Perspective(this.different, this._name, this._possessive, this._pronoun, this._possessivePronoun, this._objectPronoun, this._plusToBe, this._pronounPlusToBe, this._plusToHave, this._pronounPlusToHave)
    newPerspective.titlecase = true;
    return newPerspective;
  }

  private titleCaseIfRequired(property: string): string {
    if (this.titlecase && !this.different) return ucFirst(property);
    else return property;
  }

  public get name(): string {
    return this.titleCaseIfRequired(this._name);
  }

  public get possessive(): string {
    return this.titleCaseIfRequired(this._possessive);
  }

  public get pronoun(): string {
    return this.titleCaseIfRequired(this._pronoun);
  }

  public get possessivePronoun(): string {
    return this.titleCaseIfRequired(this._possessivePronoun);
  }

  public get objectPronoun(): string {
    return this.titleCaseIfRequired(this._objectPronoun);
  }

  public get plusToBe(): string {
    return this.titleCaseIfRequired(this._plusToBe);
  }

  public get pronounPlusToBe(): string {
    return this.titleCaseIfRequired(this._pronounPlusToBe);
  }

  public get plusToHave(): string {
    return this.titleCaseIfRequired(this._plusToHave);
  }

  public get pronounPlusToHave(): string {
    return this.titleCaseIfRequired(this._pronounPlusToHave);
  }

  addDiscordUser(user: DiscordUser): Perspective {
    this.discordUser = user;
    return this;
  }

  regularVerb(verb: string) {
    return this.name + " " + (!this.different ? verb : verb + "s");
  }
}

export class DiscordPersective extends Perspective {
  user!: DiscordUser;
}
