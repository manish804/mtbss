import { NextResponse } from 'next/server';
import { JsonPageService } from '@/lib/services/json-page-service';

/**
 * GET /api/json-pages/stats - Get JSON page statistics
 */
export async function GET() {
  try {
    const stats = await JsonPageService.getPageStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching JSON page stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch page statistics'
    }, { status: 500 });
  }
}
