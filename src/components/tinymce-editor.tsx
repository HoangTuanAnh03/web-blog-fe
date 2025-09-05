"use client";

import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TinyMCEEditorProps {
  value: string;
  onChange: (value: string) => void;
  onTextChange: (text: string) => void;
  height?: number;
  placeholder?: string;
}

export interface TinyMCEEditorRef {
  getContent: () => string;
  getRawContent: () => string;
  getTextContent: () => string;
}

const TinyMCEEditor = forwardRef<TinyMCEEditorRef, TinyMCEEditorProps>(
  (
    {
      value,
      onChange,
      onTextChange,
      height = 500,
      placeholder = "Start writing your blog post...",
    },
    ref
  ) => {
    const editorRef = useRef<any>(null);
    const [isEditorLoaded, setIsEditorLoaded] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        getContent: () => {
          if (editorRef.current) {
            return editorRef.current.getContent();
          }
          return "";
        },
        getRawContent: () => {
          if (editorRef.current) {
            return editorRef.current.getContent({ format: "raw" });
          }
          return "";
        },
        getTextContent: () => {
          console.log(
            "TinyMCE getTextContent called, editorRef.current:",
            editorRef.current
          );
          if (editorRef.current) {
            try {
              // Method 1: Try TinyMCE's built-in text format
              const textContent = editorRef.current.getContent({
                format: "text",
              });
              console.log("TinyMCE text format result:", textContent);
              if (textContent && textContent.trim()) {
                return textContent;
              }
            } catch (error) {
              console.warn("TinyMCE text format failed:", error);
            }

            try {
              // Method 2: Fallback - Use DOM parser to strip HTML
              const htmlContent = editorRef.current.getContent();
              console.log("TinyMCE HTML content for parsing:", htmlContent);
              if (htmlContent) {
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = htmlContent;
                const textResult =
                  tempDiv.textContent || tempDiv.innerText || "";
                console.log("DOM parser result:", textResult);
                return textResult;
              }
            } catch (error) {
              console.warn("DOM parser fallback failed:", error);
            }
          }
          return "";
        },
      }),
      []
    );

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsEditorLoaded(true);
      }, 500);

      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="border rounded-md overflow-hidden">
        {!isEditorLoaded && (
          <Skeleton className="w-full" style={{ height: `${height}px` }} />
        )}

        <div className={!isEditorLoaded ? "hidden" : ""}>
          <Editor
            apiKey="c7g3bowjbi9v4vokvur1e5uskxie7ky57ykmuzyouehu6hfh"
            onInit={(_: any, editor: any) => {
              console.log("TinyMCE editor initialized:", editor);
              editorRef.current = editor;
            }}
            value={value}
            onEditorChange={(newValue: string) => {
              onChange(newValue);
              if (onTextChange) {
                console.log(
                  `🚀 ~ editorRef.current.getContent({ format: "text" }):`,
                  editorRef.current.getContent({ format: "text" })
                );
                onTextChange(
                  editorRef.current.getContent({ format: "text" }) ?? ""
                );
              }
            }}
            init={{
              height,
              plugins:
                "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
              toolbar:
                "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat",
              entity_encoding: "raw",
            }}
            initialValue={""}
          />
        </div>
      </div>
    );
  }
);

TinyMCEEditor.displayName = "TinyMCEEditor";

export default TinyMCEEditor;
