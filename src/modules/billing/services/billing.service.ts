import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { StripeService }
  from './stripe.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async createCheckoutSession(
    userId: string,
    workspaceId: string,
    priceId: string,
  ) {
    const membership =
      await this.prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          },
        },
      });

    if (!membership) {
      throw new ForbiddenException();
    }

    let subscription =
      await this.prisma.subscription.findUnique({
        where: {
          workspaceId,
        },
      });

    let customerId: string;

    if (!subscription) {
      const customer =
        await this.stripeService.client.customers.create({
          metadata: {
            workspaceId,
          },
        });

      subscription =
        await this.prisma.subscription.create({
          data: {
            workspaceId,
            stripeCustomerId: customer.id,
            status: 'INCOMPLETE',
          },
        });

      customerId = customer.id;
    } else {
      customerId =
        subscription.stripeCustomerId;
    }

    const session =
      await this.stripeService.client.checkout.sessions.create({
        mode: 'subscription',

        customer: customerId,

        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],

        success_url:
          process.env.STRIPE_SUCCESS_URL,

        cancel_url:
          process.env.STRIPE_CANCEL_URL,
      });

    return {
      url: session.url,
    };
  }

  async createPortalSession(
    workspaceId: string,
  ) {
    const subscription =
      await this.prisma.subscription.findUnique({
        where: {
          workspaceId,
        },
      });

    const session =
      await this.stripeService.client.billingPortal.sessions.create({
        customer:
          subscription!.stripeCustomerId,

        return_url:
          process.env.STRIPE_SUCCESS_URL,
      });

    return {
      url: session.url
    };
  }

  async getSubscription(
    workspaceId: string,
  ) {
    return this.prisma.subscription.findUnique({
      where: {
        workspaceId,
      },
    });
  }
}