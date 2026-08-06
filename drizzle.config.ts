import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_iHY49wpdCUXr@ep-purple-cake-ax7sgzwp-pooler.c-4.us-east-2.aws.neon.tech/NexMind?sslmode=require&channel_binding=require',
  },
});
