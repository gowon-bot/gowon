import {
  ColorResolvable,
  EmbedFieldData,
  GuildMember,
  HexColorString,
  MessageEmbed,
  MessageEmbedAuthor,
  MessageEmbedFooter,
  MessageEmbedImage,
  User,
} from "discord.js";
import { tiny } from "../../../helpers/discord";
import { LineConsolidator } from "../../LineConsolidator";
import { displayUserTag } from "../displays";
import { Image } from "../Image";
import { DiscordSendable, View, ViewOptions } from "./View";

export interface Transformable<T extends View> {
  new (embed: EmbedView): T;
}

export interface Convertable<T extends EmbedView> {
  new (): T;
}

export type EmbedMutator = (
  properties: EmbedViewProperties
) => EmbedViewProperties;

export interface EmbedViewProperties {
  title?: string;
  url?: string;
  header?: string;
  headerIcon?: string;
  headerURL?: string;
  footer?: string;
  footerIcon?: string;
  description?: string | LineConsolidator;
  image?: string | Image;
  thumbnail?: string | Image;
  colour?: ColorResolvable;
  guildMember?: GuildMember;
  user?: User;
  fields?: EmbedFieldData[];
  useDescriptionFooter?: boolean;
}

export class EmbedView extends View implements DiscordSendable {
  protected properties: EmbedViewProperties = {};

  constructor(options?: Partial<ViewOptions>) {
    super(options || {});
  }

  asDiscordSendable(): EmbedView {
    return this;
  }

  toMessageEmbed(): MessageEmbed {
    const embed = new MessageEmbed({
      title: this.properties.title,
      url: this.properties.url,
      description: this.getDescription(),
      image: this.getImageURL(this.properties.image),
      thumbnail: this.getImageURL(this.properties.thumbnail),
      author: this.getAuthor(),
      footer: this.renderFooter(),
      fields: this.properties.fields,
    });

    if (this.properties.colour || this.properties.guildMember) {
      embed.setColor(
        this.properties.colour ||
          (this.properties.guildMember?.roles?.color
            ?.hexColor as HexColorString)
      );
    }

    return embed;
  }

  transform<T extends View>(klass: Transformable<T>): T {
    return new klass(this);
  }

  convert<T extends EmbedView>(klass: Convertable<T>): T {
    return new klass()
      .mergeProperties(this.getProperties())
      .setSentMessage(this.sentMessage);
  }

  mutate(mutator: EmbedMutator): EmbedView {
    this.properties = { ...this.properties, ...mutator(this.getProperties()) };
    return this;
  }

  mutateIf(predicate: boolean, mutator: EmbedMutator): EmbedView {
    if (!predicate) return this;

    return this.mutate(mutator);
  }

  setTitle(title: string): this {
    this.properties.title = title;
    return this;
  }

  setURL(url: string): this {
    this.properties.url = url;
    return this;
  }

  setHeader(header: string | undefined): this {
    this.properties.header = header;
    return this;
  }

  setHeaderURL(url?: string): this {
    this.properties.headerURL = url;
    return this;
  }

  setHeaderIcon(icon?: string): this {
    this.properties.headerIcon = icon;
    return this;
  }

  setFooter(footer: string | undefined): this {
    this.properties.footer = footer;
    return this;
  }

  useDescriptionFooter(): this {
    this.properties.useDescriptionFooter = true;
    return this;
  }

  addFooter(footer: string): this {
    this.properties.footer = ((this.properties.footer || "") + footer).trim();

    return this;
  }

  getFooter(): string | undefined {
    return this.properties.footer;
  }

  setFooterIcon(icon: string | undefined): this {
    this.properties.footerIcon = icon;
    return this;
  }

  setDescription(text: string | LineConsolidator): this {
    this.properties.description = text;
    return this;
  }

  addDescription(description: string): this {
    this.properties.description = (
      (this.properties.description || "") + description
    ).trim();

    return this;
  }

  setImage(image: string | Image): this {
    this.properties.image = image;
    return this;
  }

  setThumbnail(image: string | Image | undefined): this {
    this.properties.thumbnail = image;
    return this;
  }

  setColour(colour: ColorResolvable): this {
    this.properties.colour = colour;
    return this;
  }

  setFields(fields: EmbedFieldData[]): this {
    this.properties.fields = fields;
    return this;
  }

  addFields(...fields: EmbedFieldData[]): this {
    if (!this.properties.fields) this.properties.fields = [];
    this.properties.fields.push(...fields);

    return this;
  }

  setAuthor(user: User, member: GuildMember | undefined): this {
    this.properties.guildMember = member;
    this.properties.user = user;
    return this;
  }

  getAuthorUser(): User | undefined {
    return this.properties.user;
  }

  getProperties(): EmbedViewProperties {
    return this.properties;
  }

  mergeProperties(properties: EmbedViewProperties): this {
    this.properties = { ...this.properties, ...properties };
    return this;
  }

  protected getDescription(): string | undefined {
    const description =
      this.properties.description instanceof LineConsolidator
        ? this.properties.description.consolidate()
        : this.properties.description;

    if (this.properties.footer && this.properties.useDescriptionFooter) {
      return `${description}\n\n${this.renderFooterAsTiny()}`;
    } else return description;
  }

  private getAuthor(): MessageEmbedAuthor | undefined {
    const username = this.getUser() ? displayUserTag(this.getUser()) : "";

    const headerText = username
      ? this.properties.header
        ? `${username} | ${this.properties.header}`
        : `${username}`
      : this.properties.header;

    return this.properties.header ||
      this.properties.headerIcon ||
      this.properties.headerURL ||
      this.properties.guildMember
      ? ({
          name: headerText,
          url: this.properties.headerURL,
          iconURL:
            this.properties.headerIcon ||
            this.properties.guildMember?.avatarURL() ||
            this.getUser()?.avatarURL() ||
            undefined,
        } as MessageEmbedAuthor)
      : undefined;
  }

  private getUser(): User | undefined {
    return this.properties.guildMember?.user || this.properties.user;
  }

  private getImageURL(
    image: string | Image | undefined
  ): MessageEmbedImage | undefined {
    if (!image) return undefined;

    if (image instanceof Image) {
      return { url: image.asURL() };
    } else return { url: image };
  }

  private renderFooter(): MessageEmbedFooter | undefined {
    const trueFooter = !this.properties.useDescriptionFooter
      ? this.properties.footer
      : undefined;

    if (trueFooter || this.properties.footerIcon) {
      return {
        text: trueFooter,
        iconURL: this.properties.footerIcon,
      } as MessageEmbedFooter;
    } else return undefined;
  }

  private renderFooterAsTiny(): string {
    return (
      this.properties.footer
        ?.split("\n")
        ?.map((l) => tiny(l))
        ?.join("\n") || ""
    );
  }
}
