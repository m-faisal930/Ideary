"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Eye,
  Edit,
  Heading2,
  Heading3,
  Pilcrow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  error,
  placeholder = "Write your blog content here...",
}: RichTextEditorProps) {
  const [activeView, setActiveView] = useState<"edit" | "preview">("edit");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-gray-300 pl-4 italic text-gray-600",
          },
        },
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[400px] p-4 focus:outline-none prose prose-sm sm:prose-base lg:prose-lg max-w-none",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="border rounded-lg min-h-[400px] flex items-center justify-center text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  const getPreviewContent = () => {
    if (!value || value === "<p></p>") {
      return '<p class="text-muted-foreground italic">Nothing to preview</p>';
    }
    return value;
  };

  const handleEditorKeyDown = (event: React.KeyboardEvent) => {
    const { from, to } = editor.state.selection;

    if (event.key === "Enter") {
      if (editor.isActive("bulletList") || editor.isActive("orderedList")) {
        return;
      }
    }

    if (event.key === " " && from === to) {
      const lineStart = editor.state.doc.resolve(from).start();
      const text = editor.state.doc.textBetween(lineStart, from);

      if (text === "-" || text === "*") {
        event.preventDefault();
        editor
          .chain()
          .focus()
          .deleteRange({ from: lineStart, to: from })
          .toggleBulletList()
          .run();
      } else if (text === "1") {
        event.preventDefault();
        editor
          .chain()
          .focus()
          .deleteRange({ from: lineStart, to: from })
          .toggleOrderedList()
          .run();
      } else if (text === ">") {
        event.preventDefault();
        editor
          .chain()
          .focus()
          .deleteRange({ from: lineStart, to: from })
          .toggleBlockquote()
          .run();
      }
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/50 border-b">
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setActiveView("edit")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors",
              activeView === "edit"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveView("preview")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors",
              activeView === "preview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>

        {activeView === "edit" && (
          <div className="flex items-center gap-1 p-2 flex-wrap">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive("bold") && "bg-accent text-accent-foreground"
              )}
            >
              <Bold className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive("italic") && "bg-accent text-accent-foreground"
              )}
            >
              <Italic className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive("bulletList") &&
                  "bg-accent text-accent-foreground"
              )}
            >
              <List className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive("orderedList") &&
                  "bg-accent text-accent-foreground"
              )}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive("blockquote") &&
                  "bg-accent text-accent-foreground"
              )}
            >
              <Quote className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive("code") && "bg-accent text-accent-foreground"
              )}
            >
              <Code className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={cn(
                "h-8 px-2 text-xs",
                editor.isActive("paragraph") &&
                  "bg-accent text-accent-foreground"
              )}
            >
              <Pilcrow className="h-3 w-3 mr-1" />
              Text
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={cn(
                "h-8 px-2 text-xs",
                editor.isActive("heading", { level: 2 }) &&
                  "bg-accent text-accent-foreground"
              )}
            >
              <Heading2 className="h-3 w-3 mr-1" />
              H2
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              className={cn(
                "h-8 px-2 text-xs",
                editor.isActive("heading", { level: 3 }) &&
                  "bg-accent text-accent-foreground"
              )}
            >
              <Heading3 className="h-3 w-3 mr-1" />
              H3
            </Button>
          </div>
        )}
      </div>

      <div className="bg-background">
        {/* Edit View */}
        {activeView === "edit" && (
          <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
            <EditorContent
              editor={editor}
              onKeyDown={handleEditorKeyDown}
              className={cn("min-h-[400px]", error && "border-destructive")}
            />
          </div>
        )}

        {activeView === "preview" && (
          <div
            className="min-h-[400px] max-h-[600px] overflow-y-auto p-4 prose prose-sm sm:prose-base lg:prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
          />
        )}
      </div>

      {error && (
        <div className="px-4 pb-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="px-4 py-2 bg-muted/30 border-t">
        <p className="text-xs text-muted-foreground">
          <strong>Tips:</strong> Use * + Space or - + Space for bullet points •
          1. + Space for numbered lists • {">"} + Space for quotes
        </p>
      </div>
    </div>
  );
}
