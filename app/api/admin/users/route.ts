import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Get all users with their stats
    const users = await db.collection('users').aggregate([
      {
        $lookup: {
          from: 'waste',
          localField: '_id',
          foreignField: 'userId',
          as: 'wasteRecords'
        }
      },
      {
        $lookup: {
          from: 'activity_logs',
          localField: '_id',
          foreignField: 'userId',
          as: 'activities'
        }
      },
      {
        $addFields: {
          totalWaste: {
            $reduce: {
              input: '$wasteRecords',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.weight'] }
            }
          },
          recyclableWaste: {
            $reduce: {
              input: {
                $filter: {
                  input: '$wasteRecords',
                  as: 'record',
                  cond: { $eq: ['$$record.type', 'recyclable'] }
                }
              },
              initialValue: 0,
              in: { $add: ['$$value', '$$this.weight'] }
            }
          }
        }
      },
      {
        $addFields: {
          recyclingRate: {
            $cond: {
              if: { $eq: ['$totalWaste', 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ['$recyclableWaste', '$totalWaste'] },
                  100
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          password: 0,
          wasteRecords: 0,
          activities: {
            $slice: ['$activities', -10] // Get only the last 10 activities
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// API endpoint to update user status
export async function PATCH(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const data = await request.json();
    const { userId, action } = data;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updates: any = {};
    
    switch (action) {
      case 'suspend':
        updates.status = 'suspended';
        updates.suspendedAt = new Date();
        break;
      case 'activate':
        updates.status = 'active';
        updates.suspendedAt = null;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updates }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'User not found or no changes made' },
        { status: 404 }
      );
    }

    // Log the action
    await db.collection('activity_logs').insertOne({
      userId: new ObjectId(userId),
      adminAction: true,
      type: `user_${action}`,
      timestamp: new Date()
    });

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
} 