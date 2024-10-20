import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SwapiService } from './swapi.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [SwapiService],
})
export class AppModule {}
