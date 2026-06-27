import { Injectable } from "@nestjs/common";
import { Stripe } from "stripe";

@Injectable()
export class StripeService() {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(Process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2020-08-27 basil",
        });
    }

    get client() {
        return this.stripe
    }
}