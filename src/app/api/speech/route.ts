import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word');

  // TODO: Implement text-to-speech service
  // You can use services like Google Cloud TTS, Amazon Polly, or browser's built-in speech synthesis

  // For browser's built-in speech synthesis, you'll need to handle it on the client side instead
  
  return NextResponse.json({ error: "Not implemented" });
}
