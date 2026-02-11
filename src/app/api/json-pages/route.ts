import { NextResponse } from 'next/server';
import { JsonPageService } from '@/lib/services/json-page-service';

/**
 * GET /api/json-pages - List all JSON pages
 */
export async function GET() {
  try {
    const pages = await JsonPageService.getAllPages();
    
    return NextResponse.json({
      success: true,
      data: pages
    });
    
  } catch (error) {
    console.error('Error fetching JSON pages:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pages'
    }, { status: 500 });
  }
}
