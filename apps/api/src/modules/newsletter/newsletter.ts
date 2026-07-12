import {
  type NewsletterSubscribeInput,
  type NewsletterSubscribeResponse
} from "@legabit/api-contracts";

export type NewsletterSubscription = NewsletterSubscribeInput & {
  subscribedAt: Date;
  consentCapturedAt: Date;
};

export interface NewsletterRepository {
  subscribe(subscription: NewsletterSubscription): Promise<{ alreadySubscribed: boolean }>;
}

export class SubscribeNewsletter {
  constructor(
    private readonly repository: NewsletterRepository,
    private readonly now: () => Date = () => new Date()
  ) {}

  async execute(input: NewsletterSubscribeInput): Promise<NewsletterSubscribeResponse> {
    const capturedAt = this.now();
    await this.repository.subscribe({ ...input, subscribedAt: capturedAt, consentCapturedAt: capturedAt });
    return {
      ok: true,
      alreadySubscribed: false,
      message: "Si el correo es válido, la suscripción quedó registrada."
    };
  }
}
