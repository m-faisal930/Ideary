"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { RichTextEditor } from "@/components/blog/RichTextEditor";
import { GenerateBlogModal } from "@/components/blog/GenerateBlogModal";

const blogFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),
  content: z.string().min(1, "Content is required"),
  excerpt: z
    .string()
    .max(300, "Excerpt cannot exceed 300 characters")
    .optional(),
  metaDescription: z
    .string()
    .max(160, "Meta description cannot exceed 160 characters")
    .optional(),
  status: z.enum(["draft", "published"]),
  tags: z.array(z.string()).max(10, "Cannot have more than 10 tags"),
});

type BlogFormData = z.infer<typeof blogFormSchema>;

interface BlogFormProps {
  initialData?: Partial<BlogFormData>;
  onSubmit: (data: BlogFormData) => Promise<void>;
  isLoading?: boolean;
  submitText?: string;
}

export function BlogForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitText = "Save Blog",
}: BlogFormProps) {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      metaDescription: initialData?.metaDescription || "",
      status: initialData?.status || "draft",
      tags: initialData?.tags || [],
    },
  });

  const watchedStatus = watch("status");
  const contentValue = watch("content");

  const addTag = () => {
    if (
      newTag.trim() &&
      !tags.includes(newTag.trim().toLowerCase()) &&
      tags.length < 10
    ) {
      const updatedTags = [...tags, newTag.trim().toLowerCase()];
      setTags(updatedTags);
      setValue("tags", updatedTags);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    setValue("tags", updatedTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleContentChange = (content: string) => {
    setValue("content", content);
    trigger("content");
  };

  const onFormSubmit = async (data: BlogFormData) => {
    await onSubmit({ ...data, tags });
  };

  const handleAIGenerate = (data: {
    title: string;
    description: string;
    content: string;
    tags: string[];
  }) => {

    setValue("title", data.title);
    setValue("content", data.content);
    setValue("excerpt", data.description);
    setValue("metaDescription", data.description.slice(0, 160));
    

    const newTags = data.tags.slice(0, 10);
    setTags(newTags);
    setValue("tags", newTags);
    

    trigger();
  };

  return (
    <>
      <GenerateBlogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleAIGenerate}
      />
      
      <Card className="max-w-8xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {initialData ? "Edit Blog Post" : "Create New Blog Post"}
            </CardTitle>
            <Button
              type="button"
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="gap-2"
              disabled={isLoading}
            >
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </Button>
          </div>
        </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="flex flex-col md:flex-row w-full">
            
            <div className="md:flex-[2]  p-4">
              <div className="space-y-4 mt-6">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Enter blog title..."
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-4 mt-6">
                <Label htmlFor="content">Content *</Label>
                <RichTextEditor
                  value={contentValue}
                  onChange={handleContentChange}
                  error={errors.content?.message}
                  placeholder="Write your blog content here..."
                />
              </div>
            </div>


            <div className="md:flex-[1] p-4">
              <div className="space-y-4 mt-6">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  {...register("excerpt")}
                  placeholder="Brief description of your blog post..."
                  rows={3}
                  className={errors.excerpt ? "border-destructive" : ""}
                />
                {errors.excerpt && (
                  <p className="text-sm text-destructive">
                    {errors.excerpt.message}
                  </p>
                )}f
              </div>

              <div className="space-y-4 mt-6">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  {...register("metaDescription")}
                  placeholder="SEO meta description..."
                  rows={2}
                  className={errors.metaDescription ? "border-destructive" : ""}
                />
                {errors.metaDescription && (
                  <p className="text-sm text-destructive">
                    {errors.metaDescription.message}
                  </p>
                )}
              </div>

              <div className="space-y-4 mt-6">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag..."
                    className="flex-1"
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.tags && (
                  <p className="text-sm text-destructive">
                    {errors.tags.message}
                  </p>
                )}
              </div>

              <div className="space-y-4 mt-6">
                <Label>Status</Label>
                <Select
                  defaultValue={initialData?.status || "draft"}
                  onValueChange={(value) =>
                    setValue("status", value as "draft" | "published")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Saving..." : submitText}
                </Button>
                {watchedStatus === "draft" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setValue("status", "published");
                      handleSubmit(onFormSubmit)();
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Publishing..." : "Save & Publish"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
    </>
  );
}
