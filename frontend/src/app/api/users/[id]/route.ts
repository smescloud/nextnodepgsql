import { proxyRequest } from '../../_lib/backend';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: Request, context: RouteContext) {
  return proxyRequest(request, `/users/${context.params.id}`);
}

export async function PUT(request: Request, context: RouteContext) {
  return proxyRequest(request, `/users/${context.params.id}`);
}

export async function DELETE(request: Request, context: RouteContext) {
  return proxyRequest(request, `/users/${context.params.id}`);
}
