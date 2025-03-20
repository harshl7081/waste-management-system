import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth();
    const { db } = await connectToDatabase();
    const data = await request.json();

    // Validate request data
    if (!data.weight || !data.type || !['recyclable', 'non-recyclable'].includes(data.type)) {
      return NextResponse.json(
        { error: 'Invalid waste data' },
        { status: 400 }
      );
    }

    // Add waste collection record with user tracking
    const result = await db.collection('waste').insertOne({
      weight: data.weight,
      type: data.type,
      location: data.location,
      notes: data.notes,
      createdAt: new Date(),
      userId: user.id,
      userName: data.userName, // Include user's name for easy reference
    });

    // Add to user's activity log
    await db.collection('activity_logs').insertOne({
      userId: user.id,
      action: 'waste_collection',
      details: {
        wasteId: result.insertedId,
        weight: data.weight,
        type: data.type,
        location: data.location,
      },
      createdAt: new Date(),
    });

    return NextResponse.json({ 
      message: 'Waste collection recorded successfully',
      id: result.insertedId 
    });
  } catch (error) {
    console.error('Error recording waste collection:', error);
    return NextResponse.json(
      { error: 'Failed to record waste collection' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth();
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);

    // Build query based on filters
    const query: any = {};
    
    // If not admin, only show user's own records
    if (user.role !== 'admin') {
      query.userId = user.id;
    }

    // Date range filter
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Type filter
    const type = searchParams.get('type');
    if (type) {
      query.type = type;
    }

    const collections = await db.collection('waste')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ collections });
  } catch (error) {
    console.error('Error fetching waste collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waste collections' },
      { status: 500 }
    );
  }
} 