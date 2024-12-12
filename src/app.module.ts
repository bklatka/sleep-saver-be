import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './features/users/users.module';
import { SleepRecordsModule } from './features/sleep-records/sleep-records.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    SleepRecordsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
