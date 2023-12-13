import {
  ColorResolvable,
  GuildMember,
  HexColorString,
  MessageEmbed,
  MessageEmbedAuthor,
  MessageEmbedFooter,
  MessageEmbedImage,
  User,
} from "discord.js";
import { LineConsolidator } from "../../LineConsolidator";
import { Image } from "../Image";
import { displayUserTag } from "../displays";
import { UIComponent, UIComponentOptions } from "./UIComponent";

export class EmbedComponent extends UIComponent {
  private title?: string;
  private url?: string;
  private header?: string;
  private headerIcon?: string;
  private headerURL?: string;
  private footer?: string;
  private footerIcon?: string;
  private description?: string | LineConsolidator;
  private image?: string | Image;
  private thumbnail?: string | Image;
  private colour?: ColorResolvable;
  private guildMember?: GuildMember;
  private user?: User;

  constructor(options?: Partial<UIComponentOptions>) {
    super(options || {});
  }

  asMessageEmbed(): MessageEmbed {
    const embed = new MessageEmbed({
      title: this.title,
      url: this.url,
      description: this.getDescription(),
      image: this.getImageURL(this.image),
      thumbnail: this.getImageURL(this.thumbnail),
      author: this.getAuthor(),
      footer:
        this.footer || this.footerIcon
          ? ({
              text: this.footer,
              iconURL: this.footerIcon,
            } as MessageEmbedFooter)
          : undefined,
    });

    if (this.colour || this.guildMember) {
      embed.setColor(
        this.colour ||
          (this.guildMember?.roles?.color?.hexColor as HexColorString)
      );
    }

    return embed;
  }

  setTitle(title: string): this {
    this.title = title;
    return this;
  }

  setURL(url: string): this {
    this.url = url;
    return this;
  }

  setHeader(header: string): this {
    this.header = header;
    return this;
  }

  setHeaderIcon(icon: string): this {
    this.headerIcon = icon;
    return this;
  }

  setFooter(footer: string): this {
    this.footer = footer;
    return this;
  }

  setFooterIcon(icon: string): this {
    this.footerIcon = icon;
    return this;
  }

  setDescription(text: string | LineConsolidator): this {
    this.description = text;
    return this;
  }

  setImage(image: string | Image): this {
    this.image = image;
    return this;
  }

  setThumbnail(image: string | Image): this {
    this.thumbnail = image;
    return this;
  }

  setColour(colour: ColorResolvable): this {
    this.colour = colour;
    return this;
  }

  setAuthor(user: User, member: GuildMember | undefined): this {
    this.guildMember = member;
    this.user = user;
    return this;
  }

  private getDescription(): string | undefined {
    return this.description instanceof LineConsolidator
      ? this.description.consolidate()
      : this.description;
  }

  private getAuthor(): MessageEmbedAuthor | undefined {
    const headerText = this.getUser()
      ? this.header
        ? `${displayUserTag(this.getUser())} | ${this.header}`
        : `${displayUserTag(this.getUser())}`
      : this.header;

    return this.header || this.headerIcon || this.headerURL || this.guildMember
      ? ({
          name: headerText,
          url: this.headerURL,
          iconURL:
            this.headerIcon ||
            this.guildMember?.avatarURL() ||
            this.getUser()?.avatarURL() ||
            undefined,
        } as MessageEmbedAuthor)
      : undefined;
  }

  private getUser(): User | undefined {
    return this.guildMember?.user || this.user;
  }

  private getImageURL(
    image: string | Image | undefined
  ): MessageEmbedImage | undefined {
    if (!image) return undefined;

    if (image instanceof Image) {
      return { url: image.asURL() };
    } else return { url: image };
  }
}
