import { Body, Controller, Post } from '@nestjs/common';
import { CreateShortUrlUseCase } from 'src/shortener/application/use-cases/create-short-url.use-case';
import { CreateShortUrlDto } from 'src/shortener/application/dtos/create-short-url.dto';
import { UrlMapping } from 'src/shortener/domain/entities/url-mapping.entity';

@Controller()
export class ShortenerController {
  constructor(private readonly createShortUrlUseCase: CreateShortUrlUseCase) {}

  @Post('shorten')
  async createShortUrl(
    @Body() createShortUrlDto: CreateShortUrlDto,
  ): Promise<UrlMapping> {
    const result = await this.createShortUrlUseCase.execute(createShortUrlDto);

    return result;
  }
}
