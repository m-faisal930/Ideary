import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment extends Document {
  content: string;
  author: Types.ObjectId;
  blog: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      minlength: [1, "Comment must be at least 1 character long"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
      index: true,
    },
    blog: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: [true, "Blog is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

CommentSchema.index({ blog: 1, createdAt: -1 });

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
