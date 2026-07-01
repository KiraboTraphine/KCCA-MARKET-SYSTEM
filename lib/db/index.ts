import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// 1. Enable connection caching for serverless environments
neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL!);

// 2. Prevent Next.js hot-reloading from creating redundant connection pools
const globalForDrizzle = globalThis as unknown as {
  db: ReturnType<typeof drizzle> | undefined;
};

// 3. Reuse the existing database instance if it exists, otherwise create a new one
export const db = globalForDrizzle.db ?? drizzle(sql);

if (process.env.NODE_ENV !== 'production') globalForDrizzle.db = db;