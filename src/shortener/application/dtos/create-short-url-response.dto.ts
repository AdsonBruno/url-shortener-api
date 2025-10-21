export class CreateShortUrlResponseDto {
  id: string;
  originalUrl: string;
  shortUrl: string;
  shortUrlKey: string;
  userId?: string;
  createdAt: Date;
}
