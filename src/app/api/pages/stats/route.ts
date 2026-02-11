import { NextResponse } from 'next/server';
import { PageService } from '@/lib/services/page-service';
import { handleApiError } from '@/lib/errors/api-error';

/**
 * GET /api/pages/stats - Get page statistics
 */
export async function GET() {
  try {
    const stats = await PageService.getPageStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    return handleApiError(error);
  }
}
