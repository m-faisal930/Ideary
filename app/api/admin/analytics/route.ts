import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Blog from '@/models/Blog';
import User from '@/models/User';
import Comment from '@/models/Comment';
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

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7'; // days

    const days = parseInt(range);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    
    const [
      totalUsers,
      totalAuthors,
      totalPosts,
      totalComments,
      recentUsers,
      recentPosts,
      recentComments,
      publishedPosts,
      draftPosts,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'author' }),
      Blog.countDocuments(),
      Comment.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Blog.countDocuments({ createdAt: { $gte: startDate } }),
      Comment.countDocuments({ createdAt: { $gte: startDate } }),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
    ]);


    const popularPosts = await Blog.aggregate([
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'blog',
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' }
        }
      },
      {
        $sort: { commentCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $unwind: '$author'
      },
      {
        $project: {
          title: 1,
          slug: 1,
          commentCount: 1,
          viewCount: 1,
          createdAt: 1,
          'author.username': 1,
          'author.email': 1
        }
      }
    ]);


    const recentActivity = await Promise.all([

      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('username email createdAt role')
        .lean()
        .then(users => users.map(user => ({
          type: 'user',
          message: `${user.username} joined as ${user.role}`,
          timestamp: user.createdAt,
          user: user.username
        }))),
      

      Blog.find()
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title author createdAt status')
        .lean()
        .then(posts => posts.map(post => ({
          type: 'post',
          message: `${post.author?.username} created "${post.title}"`,
          timestamp: post.createdAt,
          user: post.author?.username
        }))),
      

      Comment.find()
        .populate('author', 'username')
        .populate('blog', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('author blog createdAt')
        .lean()
        .then(comments => comments.map(comment => ({
          type: 'comment',
          message: `${comment.author?.username} commented on "${comment.blog?.title}"`,
          timestamp: comment.createdAt,
          user: comment.author?.username
        })))
    ]);


    const allActivity = [...recentActivity[0], ...recentActivity[1], ...recentActivity[2]]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);


    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (days * 2));
    previousPeriodStart.setDate(previousPeriodStart.getDate() + days);

    const [
      previousUsers,
      previousPosts,
      previousComments,
    ] = await Promise.all([
      User.countDocuments({ 
        createdAt: { 
          $gte: previousPeriodStart, 
          $lt: startDate 
        } 
      }),
      Blog.countDocuments({ 
        createdAt: { 
          $gte: previousPeriodStart, 
          $lt: startDate 
        } 
      }),
      Comment.countDocuments({ 
        createdAt: { 
          $gte: previousPeriodStart, 
          $lt: startDate 
        } 
      }),
    ]);

    const userGrowth = previousUsers > 0 ? ((recentUsers - previousUsers) / previousUsers) * 100 : 0;
    const postGrowth = previousPosts > 0 ? ((recentPosts - previousPosts) / previousPosts) * 100 : 0;
    const commentGrowth = previousComments > 0 ? ((recentComments - previousComments) / previousComments) * 100 : 0;

 

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalUsers,
          totalAuthors,
          totalPosts,
          totalComments,
          publishedPosts,
          draftPosts,
        },
        recent: {
          users: recentUsers,
          posts: recentPosts,
          comments: recentComments,
        },
        growth: {
          users: userGrowth,
          posts: postGrowth,
          comments: commentGrowth,
        },
        popularPosts,
        recentActivity: allActivity,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}