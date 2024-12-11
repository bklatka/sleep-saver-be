import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { UserWithoutPassword } from '../features/users/schemas/user.schema';

@Injectable()
export class JwtService {
  constructor(private jwtService: NestJwtService) {}

  generateToken(user: UserWithoutPassword): string {
    return this.jwtService.sign({ 
      sub: user._id,
      email: user.email,
    });
  }

  verifyToken(token: string) {
    return this.jwtService.verify(token);
  }
} 