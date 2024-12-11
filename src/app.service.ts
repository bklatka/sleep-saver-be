import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(@InjectConnection() private connection: Connection) {}

  async onApplicationBootstrap() {
    console.log('MongoDB Connection State:', this.connection.readyState);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
