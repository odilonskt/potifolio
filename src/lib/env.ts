import { z } from "zod";

const envSchema = z
  .object({
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().min(1),
    GITHUB_API_URL: z.string().url(),
    GITHUB_USERNAME: z.string().min(1),
    NEXT_PUBLIC_GITHUB_API_URL: z.string().url().optional(),
    NEXT_PUBLIC_GITHUB_USERNAME: z.string().min(1).optional(),
    GITHUB_TOKEN: z.string().min(1).optional(),
    FIREBASE_CLIENT_EMAIL: z.string().optional(),
    FIREBASE_PRIVATE_KEY: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.GITHUB_API_URL && !data.NEXT_PUBLIC_GITHUB_API_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["GITHUB_API_URL"],
        message: "GITHUB_API_URL is required",
      });
    }
    if (!data.GITHUB_USERNAME && !data.NEXT_PUBLIC_GITHUB_USERNAME) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["GITHUB_USERNAME"],
        message: "GITHUB_USERNAME is required",
      });
    }
  });

export const env = envSchema.parse({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  GITHUB_API_URL:
    process.env.GITHUB_API_URL ?? process.env.NEXT_PUBLIC_GITHUB_API_URL,
  GITHUB_USERNAME:
    process.env.GITHUB_USERNAME ?? process.env.NEXT_PUBLIC_GITHUB_USERNAME,
  NEXT_PUBLIC_GITHUB_API_URL: process.env.NEXT_PUBLIC_GITHUB_API_URL,
  NEXT_PUBLIC_GITHUB_USERNAME: process.env.NEXT_PUBLIC_GITHUB_USERNAME,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
});

export type Env = z.infer<typeof envSchema>;
