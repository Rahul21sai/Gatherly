// This bounded limiter protects one running process. It does not coordinate
// across serverless instances; a production service needs a shared limiter.
const clients = new Map<string, { count: number; expires: number }>();
let processWindow = { count: 0, expires: 0 };
export function allowProviderRequest(request: Request) {
  const now = Date.now();
  if (processWindow.expires <= now)
    processWindow = { count: 0, expires: now + 60000 };
  for (const [key, bucket] of clients)
    if (bucket.expires <= now) clients.delete(key);
  const client = (
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    "shared"
  ).slice(0, 100);
  const bucket = clients.get(client) ?? { count: 0, expires: now + 60000 };
  if (
    processWindow.count >= 60 ||
    bucket.count >= 12 ||
    (!clients.has(client) && clients.size >= 256)
  )
    return false;
  bucket.count += 1;
  processWindow.count += 1;
  clients.set(client, bucket);
  return true;
}
