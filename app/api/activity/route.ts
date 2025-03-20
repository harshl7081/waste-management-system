import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth();
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);

    // Build query based on filters
    const query: any = {};
    
    // If not admin, only show user's own activities
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

    // Action type filter
    const action = searchParams.get('action');
    if (action) {
      query.action = action;
    }

    // Get activities with user details
    const activities = await db.collection('activity_logs')
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 1,
            action: 1,
            details: 1,
            createdAt: 1,
            'user.name': 1,
            'user.email': 1
          }
        },
        { $sort: { createdAt: -1 } },
        { $limit: 50 }
      ])
      .toArray();

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
} 