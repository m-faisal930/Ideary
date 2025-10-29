import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { verifyToken } from '@/utils/verifyToken';

export async function GET(request: NextRequest) {
  try {
    await connectDB();


    const UserModel = User;
    const CommentModel = Comment;


    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded.payload || decoded.tokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const currentUser = await UserModel.findById(decoded.payload.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;


    const query: Record<string, unknown> = {};
    
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }


    const comments = await CommentModel.find(query)
      .populate('author', 'name email')
      .populate('blog', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await CommentModel.countDocuments(query);

    return NextResponse.json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();


    const UserModel = User;
    const CommentModel = Comment;


    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded.payload || decoded.tokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const currentUser = await UserModel.findById(decoded.payload.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { commentIds } = await request.json();

    if (!commentIds || !Array.isArray(commentIds)) {
      return NextResponse.json({ error: 'Comment IDs are required' }, { status: 400 });
    }

    const result = await CommentModel.deleteMany({ _id: { $in: commentIds } });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} comments deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
