import {
  Body,
  Controller,
  Post,
  HttpStatus,
  HttpCode,
  UseFilters,
  Get,
  Redirect,
} from '@nestjs/common';
import { CreateShortUrlUseCase } from 'src/shortener/application/use-cases/create-short-url.use-case';
import { CreateShortUrlDto } from 'src/shortener/application/dtos/create-short-url.dto';
import { CreateShortUrlResponseDto } from 'src/shortener/application/dtos/create-short-url-response.dto';
import { ShortenerExceptionFilter } from '../filters/shortener-exception.filter';
import { UrlMapping } from 'src/shortener/domain/entities/url-mapping.entity';

@Controller()
@UseFilters(ShortenerExceptionFilter)
export class ShortenerController {
  constructor(private readonly createShortUrlUseCase: CreateShortUrlUseCase) {}

  @Post('shorten')
  @HttpCode(HttpStatus.CREATED)
  async createShortUrl(
    @Body() createShortUrlDto: CreateShortUrlDto,
  ): Promise<CreateShortUrlResponseDto> {
    const urlMapping =
      await this.createShortUrlUseCase.execute(createShortUrlDto);

    return this.mapToResponseDto(urlMapping);
  }

  @Get(':shortUrlKey')
  @Redirect()
  redirectToOriginalUrl() {
    return {
      url: 'https://example.com',
      statusCode: HttpStatus.MOVED_PERMANENTLY,
    };
  }

  private mapToResponseDto(urlMapping: UrlMapping): CreateShortUrlResponseDto {
    return {
      id: urlMapping.props.id,
      originalUrl: urlMapping.props.originalUrl,
      shortUrl: `http://localhost:3000/${urlMapping.props.shortUrlKey}`,
      shortUrlKey: urlMapping.props.shortUrlKey,
      userId: urlMapping.props.userId || undefined,
      createdAt: urlMapping.props.createdAt,
    };
  }
}
