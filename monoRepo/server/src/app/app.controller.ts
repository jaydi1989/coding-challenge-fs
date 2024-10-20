// apps/server/src/app/app.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { SwapiService } from './swapi.service';

@Controller('people')
export class AppController {
  constructor(private readonly swapiService: SwapiService) {}

  @Get()
  async getPeople(@Query('page') page: number) {
    return this.swapiService.getPeople(page || 1);
  }
}
