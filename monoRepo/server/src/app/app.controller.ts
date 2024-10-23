// apps/server/src/app/app.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { SwapiService } from './swapi.service';
import { PeopleAppData } from '@mono-repo/shared';

@Controller('people')
export class AppController {
  constructor(private readonly swapiService: SwapiService) {}

  @Get()
  async getPeople(@Query('page') page: number): Promise<PeopleAppData> {
    return this.swapiService.getPeople(page || 1);
  }
}
