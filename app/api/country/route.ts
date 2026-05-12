import { NextRequest, NextResponse } from 'next/server';
import { logApiError } from '@/utils/errorLogger';

export async function GET(request: NextRequest) {
  try {
    // Get client IP address from request headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown';
        
    const response = await fetch(`https://api.country.is/${ip}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch country: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Add IP address to the response data
    const responseData = {
      ...data,
      client_ip: ip
    };
    
    return NextResponse.json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    logApiError({ error, context: 'Error fetching country' });
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch country information'
      },
      { status: 500 }
    );
  }
}