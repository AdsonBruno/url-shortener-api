export class CreateShortUrlResponseDto {
  id: string;
  originalUrl: string;
  shortUrl: string;
  shortUrlKey: string;
  customAlias?: string;
  isCustomAlias: boolean;
  userId?: string;
  createdAt: Date;
}
