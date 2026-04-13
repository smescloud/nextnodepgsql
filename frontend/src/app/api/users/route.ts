import { proxyRequest } from '../_lib/backend';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return proxyRequest(request, '/users');
}

export async function POST(request: Request) {
  return proxyRequest(request, '/users');
}
