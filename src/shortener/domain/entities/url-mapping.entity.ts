export interface UrlMappingProps {
  id: string;
  originalUrl: string;
  shortUrlKey: string;
  userId: string;
  accessCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class UrlMapping {
  public readonly props: UrlMappingProps;

  constructor(props: UrlMappingProps) {
    this.props = props;
  }

  public static create(
    props: Omit<
      UrlMappingProps,
      'accessCount' | 'createdAt' | 'updatedAt' | 'deletedAt'
    >,
  ): UrlMapping {
    const now = new Date();

    return new UrlMapping({
      ...props,
      accessCount: 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  public static hydrate(props: UrlMappingProps): UrlMapping {
    return new UrlMapping(props);
  }

  public get id(): string {
    return this.props.id;
  }

  public get originalUrl(): string {
    return this.props.originalUrl;
  }

  public get shortUrlKey(): string {
    return this.props.shortUrlKey;
  }

  public incrementAccessCount(): UrlMapping {
    const newProps = { ...this.props };
    newProps.accessCount++;
    newProps.updatedAt = new Date();

    return new UrlMapping(newProps);
  }

  public softDelete(): UrlMapping {
    if (this.props.deletedAt) {
      return this;
    }

    const newProps = { ...this.props };
    newProps.deletedAt = new Date();
    newProps.updatedAt = new Date();

    return new UrlMapping(newProps);
  }

  public updateOriginalUrl(newUrl: string): UrlMapping {
    const newProps = { ...this.props };
    newProps.originalUrl = newUrl;
    newProps.updatedAt = new Date();

    return new UrlMapping(newProps);
  }
}
