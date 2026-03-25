import { NextResponse } from 'next/server';

// This endpoint is called by Vercel Cron every 2 hours
// It triggers a cache refresh by calling the feeds API
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (in production)
  const authHeader = request.headers.get('authorization');

  // In production, you should verify the CRON_SECRET
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    // Get the base URL from the request
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Call the feeds API to refresh the cache
    const response = await fetch(`${baseUrl}/api/feeds`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh feeds: ${response.status}`);
    }

    const data = await response.json();

    console.log(`[CRON] Feeds refreshed at ${new Date().toISOString()}`);
    console.log(`[CRON] Total items fetched: ${data.totalItems}`);

    return NextResponse.json({
      success: true,
      message: 'Feeds refreshed successfully',
      timestamp: new Date().toISOString(),
      itemCount: data.totalItems,
    });
  } catch (error) {
    console.error('[CRON] Error refreshing feeds:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh feeds',
        message: String(error),
      },
      { status: 500 }
    );
  }
}
