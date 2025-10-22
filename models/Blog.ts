import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBlog extends Document {
  title: string;
  content: string;
  excerpt?: string;
  author: Types.ObjectId;
  slug: string;
  tags: string[];
  status: "draft" | "published";
  publishedAt?: Date;
  readingTime?: number;
  viewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      minlength: [3, "Title must be at least 3 characters long"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: [10, "Content must be at least 10 characters long"],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    tags: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
          maxlength: [50, "Tag cannot exceed 50 characters"],
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ["draft", "published"],
        message: "Status must be either 'draft' or 'published'",
      },
      default: "draft",
      index: true,
    },
    publishedAt: {
      type: Date,
    },
    readingTime: {
      type: Number,
      default: 1,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

BlogSchema.index({ author: 1, status: 1 });
BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ slug: 1 }, { unique: true });

BlogSchema.pre("save", function (next) {
  if (this.title && (!this.slug || this.isModified("title") || this.isNew)) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!baseSlug) {
      baseSlug = "blog-post";
    }

    if (this.isNew) {
      this.slug = `${baseSlug}-${Date.now()}`;
    } else {
      this.slug = baseSlug;
    }
  }

  if (this.isModified("status")) {
    if (this.status === "published" && !this.publishedAt) {
      this.publishedAt = new Date();
    } else if (this.status === "draft") {
      this.publishedAt = undefined;
    }
  }
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 200).replace(/\s+$/, "") + "...";
  }

  if (this.content) {
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
  }

  next();
});

BlogSchema.statics.findByAuthor = function (authorId: string, status?: string) {
  const query: any = { author: authorId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ updatedAt: -1 });
};

BlogSchema.statics.findPublished = function () {
  return this.find({ status: "published" })
    .populate("author", "username email")
    .sort({ publishedAt: -1 });
};

BlogSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug }).populate("author", "username email");
};

export default mongoose.models.Blog ||
  mongoose.model<IBlog>("Blog", BlogSchema);