import { NextRequest, NextResponse } from 'next/server';
import Blog from '@/models/Blog';
import User from '@/models/User';
import { verifyToken } from '@/utils/verifyToken';
import { connectDB } from '@/lib/mongoose';

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;


    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }


    const posts = await Blog.find(query)
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments(query);

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const { postIds, action } = await request.json();

    let updateData: Record<string, unknown> = {};
    
    switch (action) {
      case 'publish':
        updateData = { status: 'published' };
        break;
      case 'draft':
        updateData = { status: 'draft' };
        break;
      case 'feature':
        updateData = { featured: true };
        break;
      case 'unfeature':
        updateData = { featured: false };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const result = await Blog.updateMany(
      { _id: { $in: postIds } },
      updateData
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} posts updated successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error updating posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}