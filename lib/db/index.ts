import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// This connects the code to your DATABASE_URL in .env
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);