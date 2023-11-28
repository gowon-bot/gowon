interface ImageOptions<MetadataT extends Record<string, any> = {}> {
  url: string;
  metadata?: MetadataT;
}

export class Image<MetadataT extends Record<string, any> = {}> {
  static fromURL(url: string) {
    return new Image({ url });
  }

  constructor(private options: ImageOptions<MetadataT>) {}

  public asURL(): string {
    return this.options.url;
  }

  public getMetadata(): MetadataT {
    return this.options.metadata || ({} as MetadataT);
  }

  public withMetadata<NewMetadataT extends Record<string, any>>(
    metadata: NewMetadataT
  ): Image<MetadataT & NewMetadataT> {
    this.options.metadata = {
      ...(this.options.metadata || {}),
      ...metadata,
    } as MetadataT & NewMetadataT;

    return this as Image<MetadataT & NewMetadataT>;
  }
}
