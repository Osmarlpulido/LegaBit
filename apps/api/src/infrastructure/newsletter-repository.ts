import type { Db } from "mongodb";

import type {
  NewsletterRepository,
  NewsletterSubscription
} from "../modules/newsletter/newsletter.js";

type NewsletterDocument = {
  email: string;
  displayName?: string;
  phone: string;
  source: string;
  subscribedAt: Date;
};

export class MongoNewsletterRepository implements NewsletterRepository {
  private readonly collection;

  constructor(database: Db) {
    this.collection = database.collection<NewsletterDocument>("newsletterSubscribers");
  }

  async ensureIndexes(): Promise<void> {
    await this.collection.createIndex({ email: 1 }, { name: "newsletter_email_unique", unique: true });
  }

  async subscribe(subscription: NewsletterSubscription): Promise<{ alreadySubscribed: boolean }> {
    const result = await this.collection.updateOne(
      { email: subscription.email },
      { $setOnInsert: subscription },
      { upsert: true }
    );
    return { alreadySubscribed: result.upsertedCount === 0 };
  }
}
