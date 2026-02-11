import { NextResponse } from 'next/server';
import { JsonContentValidationService } from '@/lib/services/json-content-validation-service';

/**
 * GET /api/json-content/validation - Get validation status for all JSON content
 */
export async function GET() {
  try {
    const validations = await JsonContentValidationService.getAllPageValidations();
    
    return NextResponse.json({
      success: true,
      data: validations
    });
    
  } catch (error) {
    console.error('Error fetching JSON content validations:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch content validations'
    }, { status: 500 });
  }
}