import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SwapiService } from './swapi.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [SwapiService],
})
export class AppModule {}
