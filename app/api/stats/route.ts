import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Get total waste collected
    const totalWaste = await db.collection('waste').aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$weight' },
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
    ]).toArray();

    // Get previous period stats for comparison
    const previousPeriod = await db.collection('waste').aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            $lt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15-30 days ago
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$weight' },
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
    ]).toArray();

    const current = totalWaste[0] || { total: 0, recyclable: 0, nonRecyclable: 0 };
    const previous = previousPeriod[0] || { total: 0, recyclable: 0, nonRecyclable: 0 };

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const recyclingRate = current.total > 0 
      ? Math.round((current.recyclable / current.total) * 100)
      : 0;

    const previousRecyclingRate = previous.total > 0
      ? Math.round((previous.recyclable / previous.total) * 100)
      : 0;

    const stats = [
      {
        name: 'Total Waste Collected',
        value: Math.round(current.total * 10) / 10,
        unit: 'kg',
        change: calculateChange(current.total, previous.total),
        changeType: current.total >= previous.total ? 'increase' : 'decrease',
      },
      {
        name: 'Recyclable Waste',
        value: Math.round(current.recyclable * 10) / 10,
        unit: 'kg',
        change: calculateChange(current.recyclable, previous.recyclable),
        changeType: current.recyclable >= previous.recyclable ? 'increase' : 'decrease',
      },
      {
        name: 'Non-Recyclable Waste',
        value: Math.round(current.nonRecyclable * 10) / 10,
        unit: 'kg',
        change: calculateChange(current.nonRecyclable, previous.nonRecyclable),
        changeType: current.nonRecyclable >= previous.nonRecyclable ? 'increase' : 'decrease',
      },
      {
        name: 'Recycling Rate',
        value: recyclingRate,
        unit: '%',
        change: calculateChange(recyclingRate, previousRecyclingRate),
        changeType: recyclingRate >= previousRecyclingRate ? 'increase' : 'decrease',
      },
    ];

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
} 