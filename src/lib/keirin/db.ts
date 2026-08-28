import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

export function getKeirinDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    throw new Error("Tursoの環境変数が設定されていません");
  }
  client ??= createClient({ url, authToken });
  return client;
}

export function isKeirinDbConfigured() {
  return Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}
