import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ping = process.env.PING_MESSAGE ?? "ping";
  res.json({ message: ping });
}