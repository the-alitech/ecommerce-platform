import { NextRequest, NextResponse } from 'next/server';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2000/api').replace(/\/$/, '');

const HOP_BY_HOP_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'keep-alive',
  'te',
  'trailer',
  'upgrade',
  'proxy-authorization',
  'proxy-authenticate',
]);

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const search = request.nextUrl.search;
  const path = pathSegments.filter(Boolean).join('/');
  const targetUrl = search ? `${API_BASE}/${path}/${search}` : `${API_BASE}/${path}/`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const cookie = request.headers.get('cookie');
  if (cookie) {
    headers.set('cookie', cookie);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    init.body = await request.text();
  }

  try {
    const res = await fetch(targetUrl, init);
    const body = await res.arrayBuffer();

    const responseHeaders = new Headers();
    const contentType = res.headers.get('Content-Type');
    if (contentType) {
      responseHeaders.set('Content-Type', contentType);
    }

    const setCookies = typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : [];
    if (setCookies.length > 0) {
      for (const value of setCookies) {
        responseHeaders.append('Set-Cookie', value);
      }
    } else {
      const single = res.headers.get('set-cookie');
      if (single) {
        responseHeaders.append('Set-Cookie', single);
      }
    }

    return new NextResponse(body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Proxy request failed';
    return NextResponse.json({ error: message, detail: 'API proxy error' }, { status: 502 });
  }
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
