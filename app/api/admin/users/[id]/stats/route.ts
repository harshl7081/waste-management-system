import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const userId = new ObjectId(params.id);

    // Get user's detailed statistics
    const stats = await db.collection('waste').aggregate([
      {
        $match: { userId }
      },
      {
        $facet: {
          // Daily stats for the last 30 days
          dailyStats: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
              }
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                totalWaste: { $sum: '$weight' },
                recyclableWaste: {
                  $sum: {
                    $cond: [{ $eq: ['$type', 'recyclable'] }, '$weight', 0]
                  }
                },
                nonRecyclableWaste: {
                  $sum: {
                    $cond: [{ $eq: ['$type', 'non-recyclable'] }, '$weight', 0]
                  }
                }
              }
            },
            { $sort: { _id: 1 } }
          ],
          // Monthly stats for the last 12 months
          monthlyStats: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
                }
              }
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m', date: '$createdAt' }
                },
                totalWaste: { $sum: '$weight' },
                recyclableWaste: {
                  $sum: {
                    $cond: [{ $eq: ['$type', 'recyclable'] }, '$weight', 0]
                  }
                },
                nonRecyclableWaste: {
                  $sum: {
                    $cond: [{ $eq: ['$type', 'non-recyclable'] }, '$weight', 0]
                  }
                }
              }
            },
            { $sort: { _id: 1 } }
          ],
          // Waste type distribution
          wasteTypes: [
            {
              $group: {
                _id: '$type',
                total: { $sum: '$weight' }
              }
            }
          ],
          // Collection locations
          locations: [
            {
              $group: {
                _id: '$location',
                count: { $sum: 1 },
                totalWeight: { $sum: '$weight' }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ],
          // Overall stats
          overall: [
            {
              $group: {
                _id: null,
                totalCollections: { $sum: 1 },
                totalWeight: { $sum: '$weight' },
                avgWeight: { $avg: '$weight' },
                firstCollection: { $min: '$createdAt' },
                lastCollection: { $max: '$createdAt' }
              }
            }
          ]
        }
      }
    ]).toArray();

    // Get user's activity summary
    const activitySummary = await db.collection('activity_logs').aggregate([
      {
        $match: { userId }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          lastActivity: { $max: '$timestamp' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    // Get user's rewards and points history
    const rewardsHistory = await db.collection('rewards').aggregate([
      {
        $match: { userId }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 10
      }
    ]).toArray();

    return NextResponse.json({
      stats: stats[0],
      activitySummary,
      rewardsHistory
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
} 