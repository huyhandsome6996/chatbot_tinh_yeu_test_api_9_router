import { NextRequest, NextResponse } from 'next/server';

// API route để gọi 9Router (OpenAI-compatible API)
// Tránh CORS và che giấu API key trên server

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey, baseUrl, model } = await req.json();

    if (!apiKey || !baseUrl) {
      return NextResponse.json(
        { error: 'Thiếu API key hoặc Base URL' },
        { status: 400 }
      );
    }

    // Chuẩn hóa base URL
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    const endpoint = `${cleanBaseUrl}/v1/chat/completions`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o',
        messages,
        stream: false,
        temperature: 0.9,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('9Router API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Lỗi API (${response.status}): ${errorText.slice(0, 200)}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định';
    console.error('Chat API error:', message);
    return NextResponse.json(
      { error: `Lỗi kết nối: ${message}` },
      { status: 500 }
    );
  }
}
