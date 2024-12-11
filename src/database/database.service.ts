import { Injectable } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class DatabaseService implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    const username = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_NAME;
    const host = process.env.DB_HOST;
    

    return {
      uri: `mongodb+srv://${username}:${password}@${host}/${database}?retryWrites=true&w=majority&appName=sleep-saver`
    };
  }
} 