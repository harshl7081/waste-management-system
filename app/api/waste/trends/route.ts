import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Get daily waste collection data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await db.collection('waste').aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          recyclable: {
            $sum: {
              $cond: [{ $eq: ['$type', 'recyclable'] }, '$weight', 0],
            },
          },
          nonRecyclable: {
            $sum: {
              $cond: [{ $eq: ['$type', 'non-recyclable'] }, '$weight', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          recyclable: 1,
          nonRecyclable: 1,
        },
      },
      {
        $sort: { date: 1 },
      },
    ]).toArray();

    // Fill in missing dates with zero values
    const data = [];
    let currentDate = new Date(thirtyDaysAgo);
    const today = new Date();

    while (currentDate <= today) {
      const dateString = currentDate.toISOString().split('T')[0];
      const existingData = trends.find((t) => t.date === dateString);

      data.push({
        date: dateString,
        recyclable: existingData ? existingData.recyclable : 0,
        nonRecyclable: existingData ? existingData.nonRecyclable : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching waste trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waste trends' },
      { status: 500 }
    );
  }
} 