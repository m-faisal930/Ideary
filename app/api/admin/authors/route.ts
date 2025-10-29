import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import { verifyToken } from '@/utils/verifyToken';

export async function GET(request: NextRequest) {
  try {
    await connectDB();


    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded.payload || decoded.tokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const currentUser = await User.findById(decoded.payload.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }


    const authors = await User.find({}).select('-password').lean();
    

    const authorsWithStats = await Promise.all(
      authors.map(async (author) => {

        return {
          ...author,
          blogCount: 0, 
          totalViews: 0, 
          joinedDate: author.createdAt || new Date(),
        };
      })
    );

    return NextResponse.json({
      success: true,
      authors: authorsWithStats,
      total: authors.length,
    });
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}