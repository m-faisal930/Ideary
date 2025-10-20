// import { NextRequest, NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongoose";
// import Blog from "@/models/Blog";

// export async function GET(request: NextRequest) {
//   try {
//     await connectDB();

//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//     const blogs = await Blog.find({
//       createdAt: { $gte: thirtyDaysAgo },
//     }).sort({ createdAt: 1 });

//     const dailyData = blogs.reduce((acc: any, blog) => {
//       const date = blog.createdAt.toISOString().split("T")[0];

//       if (!acc[date]) {
//         acc[date] = {
//           date,
//           posts: 0,
//           views: 0,
//           readingTime: 0,
//         };
//       }

//       acc[date].posts += 1;
//       acc[date].views += blog.viewCount || 0;
//       acc[date].readingTime += blog.readingTime || 0;

//       return acc;
//     }, {});

//     const dailyArray = Object.values(dailyData);
//     const filledData = [];

//     for (let i = 0; i < 30; i++) {
//       const date = new Date();
//       date.setDate(date.getDate() - (29 - i));
//       const dateString = date.toISOString().split("T")[0];

//       const existingData = dailyArray.find((d: any) => d.date === dateString);
//       if (existingData) {
//         filledData.push(existingData);
//       } else {
//         filledData.push({
//           date: dateString,
//           posts: 0,
//           views: 0,
//           readingTime: 0,
//         });
//       }
//     }

//     const publishedBlogs = blogs.filter((blog) => blog.status === "published");
//     const totalViews = publishedBlogs.reduce(
//       (sum, blog) => sum + (blog.viewCount || 0),
//       0
//     );
//     const avgViews =
//       publishedBlogs.length > 0
//         ? Math.round(totalViews / publishedBlogs.length)
//         : 0;

//     const engagementRate =
//       publishedBlogs.length > 0
//         ? Math.min(
//             100,
//             Math.round((totalViews / (publishedBlogs.length * 100)) * 100)
//           )
//         : 0;

//     return NextResponse.json({
//       success: true,
//       data: {
//         dailyTrends: filledData,
//         performanceMetrics: {
//           totalViews,
//           avgViews,
//           engagementRate,
//           totalReadingTime: publishedBlogs.reduce(
//             (sum, blog) => sum + (blog.readingTime || 0),
//             0
//           ),
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Analytics API error:", error);
//     return NextResponse.json(
//       { success: false, message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }









import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Blog from "@/models/Blog";

interface DailyStats {
  date: string;
  posts: number;
  views: number;
  readingTime: number;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const blogs = await Blog.find({
      createdAt: { $gte: thirtyDaysAgo },
    }).sort({ createdAt: 1 });

    // ✅ Define the shape of the accumulator explicitly
    const dailyData = blogs.reduce<Record<string, DailyStats>>((acc, blog) => {
      const date = blog.createdAt.toISOString().split("T")[0];

      if (!acc[date]) {
        acc[date] = {
          date,
          posts: 0,
          views: 0,
          readingTime: 0,
        };
      }

      acc[date].posts += 1;
      acc[date].views += blog.viewCount || 0;
      acc[date].readingTime += blog.readingTime || 0;

      return acc;
    }, {});

    const dailyArray: DailyStats[] = Object.values(dailyData);
    const filledData: DailyStats[] = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateString = date.toISOString().split("T")[0];

      const existingData = dailyArray.find((d) => d.date === dateString);
      if (existingData) {
        filledData.push(existingData);
      } else {
        filledData.push({
          date: dateString,
          posts: 0,
          views: 0,
          readingTime: 0,
        });
      }
    }

    const publishedBlogs = blogs.filter((blog) => blog.status === "published");
    const totalViews = publishedBlogs.reduce(
      (sum, blog) => sum + (blog.viewCount || 0),
      0
    );

    const avgViews =
      publishedBlogs.length > 0
        ? Math.round(totalViews / publishedBlogs.length)
        : 0;

    const engagementRate =
      publishedBlogs.length > 0
        ? Math.min(
            100,
            Math.round((totalViews / (publishedBlogs.length * 100)) * 100)
          )
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        dailyTrends: filledData,
        performanceMetrics: {
          totalViews,
          avgViews,
          engagementRate,
          totalReadingTime: publishedBlogs.reduce(
            (sum, blog) => sum + (blog.readingTime || 0),
            0
          ),
        },
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
