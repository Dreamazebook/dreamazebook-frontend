import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.country.is/');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch country: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Error fetching country:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch country information'
      },
      { status: 500 }
    );
  }
}