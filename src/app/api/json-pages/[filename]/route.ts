import { NextRequest, NextResponse } from 'next/server';
import { PageService } from '@/lib/services/page-service';
import { JsonPageService } from '@/lib/services/json-page-service';
import { globalCache, CacheKeys } from '@/lib/utils/simple-cache';
import { isReadOnlyFileSystem } from '@/lib/utils/environment-helpers';

const isProduction = process.env.NODE_ENV === "production";

function debugLog(message: string): void {
  if (!isProduction) {
    console.log(message);
  }
}

interface RouteParams {
  params: Promise<{
    filename: string;
  }>;
}

/**
 * GET /api/json-pages/[filename] - Get a specific page (database first, JSON fallback)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = await params;
    
    if (!filename.endsWith('.json')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid filename format'
      }, { status: 400 });
    }
    
    const pageId = filename.replace('.json', '');
    const cacheKey = CacheKeys.page(pageId);
    
    // Try cache first
    const cached = globalCache.get(cacheKey);
    if (cached) {
      debugLog(`🗄️ Using cached page data for '${pageId}' (source: ${cached.source})`);
      return NextResponse.json({
        success: true,
        data: cached.data,
        fromCache: true,
        source: cached.source
      });
    }

    // Try database first
    try {
      const dbPage = await PageService.getPageByPageId(pageId);
      if (dbPage && dbPage.content && dbPage.isPublished) {
        debugLog(`📊 ✅ Retrieved page '${pageId}' from database`);
        
        // Cache the result
        globalCache.set(cacheKey, dbPage.content, 'database');
        
        return NextResponse.json({
          success: true,
          data: dbPage.content,
          fromCache: false,
          source: 'database'
        });
      }
    } catch (dbError) {
      console.warn(`⚠️ Database lookup failed for '${pageId}':`, dbError);
    }

    // Fallback to JSON file
    try {
      const jsonPage = await JsonPageService.getPageByFilename(filename);
      if (jsonPage) {
        debugLog(`📄 Retrieved page '${pageId}' from JSON file (fallback)`);
        
        // Cache the JSON result
        globalCache.set(cacheKey, jsonPage, 'json');
        
        return NextResponse.json({
          success: true,
          data: jsonPage,
          fromCache: false,
          source: 'json'
        });
      }
    } catch (jsonError) {
      console.error(`❌ JSON lookup failed for '${pageId}':`, jsonError);
    }

    // Nothing found
    return NextResponse.json({
      success: false,
      error: 'Page not found'
    }, { status: 404 });
    
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch page'
    }, { status: 500 });
  }
}

/**
 * PUT /api/json-pages/[filename] - Update a page (database + environment-appropriate JSON sync)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = await params;
    
    if (!filename.endsWith('.json')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid filename format'
      }, { status: 400 });
    }
    
    const body = await request.json();
    const pageId = filename.replace('.json', '');
    
    // Prepare content with updated timestamp
    const updatedContent = {
      ...body,
      lastModified: new Date().toISOString(),
    };

    let databaseSuccess = false;
    let jsonSuccess = false;

    // Always try to update database
    try {
      const existingPage = await PageService.getPageByPageId(pageId);
      
      if (existingPage) {
        await PageService.patchPage(existingPage.id, { content: updatedContent });
        debugLog(`📊 ✅ Updated page '${pageId}' in database`);
        databaseSuccess = true;
      } else {
        // Create new page in database
        await PageService.createPage({
          pageId,
          title: updatedContent.title || 'Untitled Page',
          description: updatedContent.description || 'No description',
          isPublished: updatedContent.published || false,
          content: updatedContent
        });
        debugLog(`📊 ✅ Created page '${pageId}' in database`);
        databaseSuccess = true;
      }
    } catch (dbError) {
      console.error(`❌ Database update failed for '${pageId}':`, dbError);
    }

    // Update JSON file (only in development or if not read-only)
    if (!isReadOnlyFileSystem()) {
      try {
        await JsonPageService.updatePageByFilename(filename, updatedContent);
        debugLog(`📄 ✅ Updated JSON file '${filename}'`);
        jsonSuccess = true;
      } catch (jsonError) {
        console.warn(`⚠️ JSON file update failed for '${filename}':`, jsonError);
      }
    } else {
      debugLog(`📝 Skipping JSON file update for '${filename}' (read-only environment)`);
      jsonSuccess = true; // Consider it successful in production
    }

    // Invalidate cache
    globalCache.delete(CacheKeys.page(pageId));
    globalCache.invalidateByPattern(/^pages:/); // Also invalidate pages list cache

    if (databaseSuccess) {
      const message = jsonSuccess 
        ? `Page '${pageId}' updated successfully in both database and JSON`
        : `Page '${pageId}' updated in database only (JSON update failed)`;
      
      return NextResponse.json({
        success: true,
        message,
        databaseUpdated: databaseSuccess,
        jsonUpdated: jsonSuccess
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `Failed to update page '${pageId}' in database`
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update page'
    }, { status: 500 });
  }
}
