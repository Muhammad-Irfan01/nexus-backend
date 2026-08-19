import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Receiver } from '@upstash/qstash';

@Injectable()
export class QStashSignatureGuard implements CanActivate {
  private receiver: Receiver;

  constructor() {
    this.receiver = new Receiver({
      currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
      nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['upstash-signature'];
    
    if (!signature) {
      throw new UnauthorizedException('Missing QStash signature');
    }

    const isValid = await this.receiver.verify({
      signature,
      body: request.rawBody,
      url: `${process.env.BACKEND_URL}${request.url}`, // Dynamic URL
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid QStash signature');
    }

    return true;
  }
}
