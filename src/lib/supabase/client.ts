import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    "https://kwfmjsyylslutjlfdwpn.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Zm1qc3l5bHNsdXRqbGZkd3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTQzMDgsImV4cCI6MjA5MTczMDMwOH0.6nZRQtcxys_I-q2mrVZ_FN9p26gM9FMe9RH8TE0ZOTk"
  );
}
