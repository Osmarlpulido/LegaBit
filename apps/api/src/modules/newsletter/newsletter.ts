import {
  type NewsletterSubscribeInput,
  type NewsletterSubscribeResponse
} from "@legabit/api-contracts";

export type NewsletterSubscription = NewsletterSubscribeInput & {
  subscribedAt: Date;
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
    const result = await this.repository.subscribe({ ...input, subscribedAt: this.now() });
    return {
      ok: true,
      alreadySubscribed: result.alreadySubscribed,
      message: result.alreadySubscribed
        ? "Este correo ya está suscrito."
        : "Suscripción registrada correctamente."
    };
  }
}
