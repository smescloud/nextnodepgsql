import { NextResponse } from 'next/server';

const defaultBackendUrl =
  process.env.NODE_ENV === 'production'
    ? 'http://backend:4000'
    : 'http://localhost:4000';

function getBackendBaseUrl() {
  const configuredBackendUrl = process.env.BACKEND_URL || defaultBackendUrl;

  return configuredBackendUrl.endsWith('/')
    ? configuredBackendUrl.slice(0, -1)
    : configuredBackendUrl;
}

export async function proxyRequest(request: Request, pathname: string) {
  try {
    const headers = new Headers();
    const contentType = request.headers.get('content-type');

    if (contentType) {
      headers.set('content-type', contentType);
    }

    const body =
      request.method === 'GET' || request.method === 'HEAD'
        ? undefined
        : await request.text();

    const response = await fetch(`${getBackendBaseUrl()}${pathname}`, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
    });

    const responseBody = await response.text();
    const responseHeaders = new Headers();
    const responseContentType = response.headers.get('content-type');

    if (responseContentType) {
      responseHeaders.set('content-type', responseContentType);
    }

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Failed to proxy request to backend:', error);

    return NextResponse.json(
      { message: 'Backend service is unavailable.' },
      { status: 502 },
    );
  }
}
