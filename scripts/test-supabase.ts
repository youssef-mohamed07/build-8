import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const PASSWORD = encodeURIComponent("YOU-@#9090m");
const REF = "bvdbauusmiaubzqwofnm";

async function testSupabaseApi() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(url, key);

  const { data, error } = await supabase.from("clients").select("count");
  console.log("Supabase API clients:", { data, error: error?.message, code: error?.code });

  const { data: health } = await supabase.rpc("version");
  console.log("RPC version:", health);
}

async function main() {
  await testSupabaseApi();

  const regions = ["us-east-1", "us-west-1", "eu-west-1", "eu-central-1", "ap-southeast-1", "ap-northeast-1"];
  for (const region of regions) {
    for (const prefix of ["aws-0", "aws-1"]) {
      for (const port of [6543, 5432]) {
        const url = `postgresql://postgres.${REF}:${PASSWORD}@${prefix}-${region}.pooler.supabase.com:${port}/postgres`;
        const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 });
        try {
          await client.connect();
          await client.query("SELECT 1");
          console.log("CONNECTED:", url.replace(PASSWORD, "***"));
          await client.end();
          return;
        } catch (e: unknown) {
          const msg = (e as Error).message;
          if (!msg.includes("ENOTFOUND") && !msg.includes("tenant/user")) {
            console.log("Partial:", prefix, region, port, msg.slice(0, 80));
          }
          try { await client.end(); } catch { /* ignore */ }
        }
      }
    }
  }
}

main();
