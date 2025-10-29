

// import { Metadata } from "next";
// import Header from "@/components/layout/Header";
// import Footer from "@/components/layout/Footer";
// import Link from "next/link";

// export const metadata: Metadata = {
//   title: "Test Blogs",
//   description: "Server-side rendered blog test page",
// };

// // Define TypeScript types for clarity
// interface Blog {
//   _id: string;
//   title: string;
//   excerpt: string;
//   slug: string;
//   tags: string[];
//   author: {
//     _id: string;
//     name: string;
//     email: string;
//   };
//   status: "draft" | "published";
//   publishedAt?: string;
//   createdAt: string;
//   readingTime: number;
//   viewCount: number;
// }

// interface BlogsResponse {
//   success: boolean;
//   data: {
//     blogs: Blog[];
//     totalBlogs: number;
//     totalPages: number;
//     currentPage: number;
//   };
//   message: string;
// }

// interface PageProps {
//   searchParams: {
//     page?: string;
//   };
// }

// // ✅ Server Component
// export default async function TestPage({ searchParams }: PageProps) {
//   const currentPage = Number(searchParams.page) || 1;
//   const limit = 6; // blogs per page

//   let blogs: Blog[] = [];
//   let totalPages = 1;
//   let error: string | null = null;

//   try {
//     const res = await fetch(
//       `http://localhost:3000/api/blogs?status=published&page=${currentPage}&limit=${limit}`,
//       {
//         cache: "no-store", // always fresh
//       }
//     );

//     const data: BlogsResponse = await res.json();

//     if (data.success) {
//       blogs = data.data.blogs;
//       totalPages = data.data.totalPages;
//     } else {
//       error = data.message || "Failed to fetch blogs";
//     }
//   } catch (err) {
//     console.error(err);
//     error = "Error fetching blogs";
//   }

//   return (
//     <div className="min-h-screen bg-background py-10 px-6">
//       <Header />
//       <h1 className="text-4xl font-bold mb-10 text-center">Server-side Blogs Test</h1>

//       {error ? (
//         <p className="text-red-500 text-center">{error}</p>
//       ) : blogs.length === 0 ? (
//         <p className="text-muted-foreground text-center">No blogs found.</p>
//       ) : (
//         <div className="max-w-3xl mx-auto space-y-6">
//           {blogs.map((blog) => (
//             <div key={blog._id} className="p-6 border rounded-2xl shadow-sm bg-white">
//               <h2 className="text-2xl font-semibold mb-2">{blog.title}</h2>
//               <p className="text-muted-foreground mb-2">{blog.excerpt}</p>
//               <p className="text-sm text-gray-500">
//                 By <span className="font-medium">{blog.author.name}</span> •{" "}
//                 {new Date(blog.createdAt).toLocaleDateString()}
//               </p>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ✅ Pagination */}
//       <div className="flex justify-center gap-3 mt-10">
//         {currentPage > 1 && (
//           <Link
//             href={`?page=${currentPage - 1}`}
//             className="px-4 py-2 border rounded-lg hover:bg-gray-100"
//           >
//             Previous
//           </Link>
//         )}

//         <span className="px-4 py-2 font-medium">
//           Page {currentPage} of {totalPages}
//         </span>

//         {currentPage < totalPages && (
//           <Link
//             href={`?page=${currentPage + 1}`}
//             className="px-4 py-2 border rounded-lg hover:bg-gray-100"
//           >
//             Next
//           </Link>
//         )}
//       </div>

//       <Footer />
//     </div>
//   );
// }


















// // app/posts/page/[page]/page.tsx
// import Header from "@/components/layout/Header";
// import Footer from "@/components/layout/Footer";
// import Link from "next/link";
// import { Metadata } from "next";


// export const metadata: Metadata = {
//   title: "Test Blogs - Page",
//   description: "SSG blog pages",
// };



// // If you want ISR instead of purely static uncomment below:
// // export const revalidate = 60; // seconds - page will be revalidated in background

// interface PageParams {
//   page: string;
// }

// interface Blog { /* same as your Blog interface */ 
//   _id: string;
//   title: string;
//   excerpt: string;
//   slug: string;
//   tags: string[];
//   author: { _id: string; name: string; email: string };
//   status: "draft" | "published";
//   publishedAt?: string;
//   createdAt: string;
//   readingTime: number;
//   viewCount: number;
// }

// interface BlogsResponse {
//   success: boolean;
//   data: { blogs: Blog[]; totalBlogs: number; totalPages: number; currentPage: number; };
//   message: string;
// }

// const limit = 6;

// // generateStaticParams runs at build-time and returns pages to pre-render
// export async function generateStaticParams() {
//   // call your API to find totalPages
//   const res = await fetch(`http://localhost:3000/api/blogs?status=published&page=1&limit=${limit}`, {
//     // no-store would force dynamic — don't use it here
//     // fetch defaults to cache behavior that allows SSG; optionally you may pass next: { revalidate: 60 } for ISR
//     // next: { revalidate: 60 }
//   });
//   const data: BlogsResponse = await res.json();

//   const totalPages = data?.data?.totalPages ?? 1;

//   // return an array like [{ page: '1' }, { page: '2' }, ...]
//   const pages = Array.from({ length: totalPages }, (_, i) => ({ page: String(i + 1) }));
//   return pages;
// }

// export default async function Page({ params }: { params: PageParams }) {
//   const currentPage = Number(params.page) || 1;

//   let error: string | null = null;
//   let blogs: Blog[] = [];
//   let totalPages = 1;

//   try {
//     // For pure SSG: omit any cache: "no-store"
//     // For ISR: add next: { revalidate: 60 } to let Next revalidate every 60s
//     const res = await fetch(
//       `http://localhost:3000/api/blogs?status=published&page=${currentPage}&limit=${limit}`,
//       {
//         // next: { revalidate: 60 } // uncomment if you want ISR
//       }
//     );

//     const data: BlogsResponse = await res.json();
//     if (data.success) {
//       blogs = data.data.blogs;
//       totalPages = data.data.totalPages;
//     } else {
//       error = data.message || "Failed to fetch blogs";
//     }
//   } catch (err) {
//     console.error(err);
//     error = "Error fetching blogs";
//   }

//   return (
//     <div className="min-h-screen bg-background py-10 px-6">
//       <Header />
//       <h1 className="text-4xl font-bold mb-10 text-center">Server-side Blogs Test (SSG)</h1>

//       {error ? (
//         <p className="text-red-500 text-center">{error}</p>
//       ) : blogs.length === 0 ? (
//         <p className="text-muted-foreground text-center">No blogs found.</p>
//       ) : (
//         <div className="max-w-3xl mx-auto space-y-6">
//           {blogs.map((blog) => (
//             <div key={blog._id} className="p-6 border rounded-2xl shadow-sm bg-white">
//               <h2 className="text-2xl font-semibold mb-2">{blog.title}</h2>
//               <p className="text-muted-foreground mb-2">{blog.excerpt}</p>
//               <p className="text-sm text-gray-500">
//                 By <span className="font-medium">{blog.author.name}</span> •{" "}
//                 {new Date(blog.createdAt).toLocaleDateString()}
//               </p>
//             </div>
//           ))}
//         </div>
//       )}

//       <div className="flex justify-center gap-3 mt-10">
//         {currentPage > 1 && (
//           <Link href={`/test/${currentPage - 1}`} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
//             Previous
//           </Link>
//         )}

//         <span className="px-4 py-2 font-medium">Page {currentPage} of {totalPages}</span>

//         {currentPage < totalPages && (
//           <Link href={`/test/${currentPage + 1}`} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
//             Next
//           </Link>
//         )}
//       </div>

//       <Footer />
//     </div>
//   );
// }




















import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Blogs - Page",
  description: "SSG blog pages",
};

interface PageParams {
  page: string;
}

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  tags: string[];
  author: { _id: string; name: string; email: string };
  status: "draft" | "published";
  publishedAt?: string;
  createdAt: string;
  readingTime: number;
  viewCount: number;
}

interface BlogsResponse {
  success: boolean;
  data: { blogs: Blog[]; totalBlogs: number; totalPages: number; currentPage: number };
  message: string;
}

const limit = 6;

// ✅ Get base URL that works both locally and in production
function getBaseUrl() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  return "http://localhost:3000";
}

// ✅ Generate static params for SSG
export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${getBaseUrl()}/api/blogs?status=published&page=1&limit=${limit}`,
      { next: { revalidate: 3600 } } // ISR option
    );
    const data: BlogsResponse = await res.json();
    const totalPages = data?.data?.totalPages ?? 1;

    return Array.from({ length: totalPages }, (_, i) => ({ page: String(i + 1) }));
  } catch (err) {
    console.error("generateStaticParams failed:", err);
    return [{ page: "1" }]; // fallback so build never fails
  }
}

// ✅ Page component (Server Component)
export default async function Page({ params }: { params: PageParams }) {
  const currentPage = Number(params.page) || 1;

  let error: string | null = null;
  let blogs: Blog[] = [];
  let totalPages = 1;

  try {
    const res = await fetch(
      `${getBaseUrl()}/api/blogs?status=published&page=${currentPage}&limit=${limit}`,
      { next: { revalidate: 60 } } // ISR (optional)
    );

    const data: BlogsResponse = await res.json();

    if (data.success) {
      blogs = data.data.blogs;
      totalPages = data.data.totalPages;
    } else {
      error = data.message || "Failed to fetch blogs";
    }
  } catch (err) {
    console.error(err);
    error = "Error fetching blogs";
  }

  return (
    <div className="min-h-screen bg-background py-10 px-6 mt-30">
      <Header />
      <h1 className="text-4xl font-bold mb-10 text-center">Server-side Blogs Test (SSG)</h1>

      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : blogs.length === 0 ? (
        <p className="text-muted-foreground text-center">No blogs found.</p>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          {blogs.map((blog) => (
            <div key={blog._id} className="p-6 border rounded-2xl shadow-sm bg-white">
              <h2 className="text-2xl font-semibold mb-2">{blog.title}</h2>
              <p className="text-muted-foreground mb-2">{blog.excerpt}</p>
              <p className="text-sm text-gray-500">
                By <span className="font-medium">{blog.author.name}</span> •{" "}
                {new Date(blog.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-3 mt-10">
        {currentPage > 1 && (
          <Link href={`/test/${currentPage - 1}`} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
            Previous
          </Link>
        )}

        <span className="px-4 py-2 font-medium">
          Page {currentPage} of {totalPages}
        </span>

        {currentPage < totalPages && (
          <Link href={`/test/${currentPage + 1}`} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
            Next
          </Link>
        )}
      </div>

      <Footer />
    </div>
  );
}
