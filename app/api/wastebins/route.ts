import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

// GET /api/wastebins
export async function GET() {
  try {
    const db = await connectToDatabase();
    const wasteBins = await db.collection('wasteBins').find().toArray();
    return NextResponse.json(wasteBins);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch waste bins' },
      { status: 500 }
    );
  }
}

// POST /api/wastebins
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await connectToDatabase();
    
    const newBin = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('wasteBins').insertOne(newBin);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create waste bin' },
      { status: 500 }
    );
  }
}

// PATCH /api/wastebins/[id]
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Waste bin ID is required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const result = await db.collection('wasteBins').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Waste bin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update waste bin' },
      { status: 500 }
    );
  }
} 