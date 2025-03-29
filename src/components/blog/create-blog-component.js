"use client";

import { Controller, useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { UploadButton } from "@uploadthing/react";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";
import "./custom-quill.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const blogSchema = z.object({
  title: z.string().min(1, "Blog title is required"),
  content: z.string().min(1, "Blog content is required"),
  category: z.string().min(1, "Blog category is required"),
  coverPhoto: z.string().min(1, "Blog cover photo is required"),
});

const BLOG_CATEGORIES = [
  { key: "technology", value: "Technology" },
  { key: "programming", value: "Programming" },
  { key: "webDevelopment", value: "Web Development" },
  { key: "dataScience", value: "Data Science" },
  { key: "artificialIntelligence", value: "Artificial Intelligence" },
  { key: "cybersecurity", value: "Cybersecurity" },
  { key: "cloudComputing", value: "Cloud Computing" },
  { key: "mobileDevelopment", value: "Mobile Development" },
  { key: "devOps", value: "DevOps" },
  { key: "blockchain", value: "Blockchain" },
];

//to check for user injecting suspicious content
const suspiciousContent = (data) => {
  const suspiciousPatterns = [
    /<script>/i,
    /javascript:/i,
    /onload=/i,
    /onClick=/i,
    /'.*OR.*'/i,
    /UNION SELECT/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(data.content));
};

function CreateBlogForm({ user }) {
  const [quillLoaded, setQuillLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const quillRef = useRef(null);
  const router = useRouter();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      coverPhoto: "",
    },
  });

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        ["blockquote", "code-block"],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  const onBlogSubmit = async (data) => {
    console.log("You clicked the publish button");
    toast("Debug", { description: "Shows" });

    setLoading(true);

    try {
      const isSus = suspiciousContent(data);

      const result = await fetch("/api/create-post", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "x-arcjet-suspicious": isSus.toString(),
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());

      if (result?.success) {
        toast("Success", {
          description: result?.success,
        });
        router.push("/");
      } else {
        toast("Error", {
          description: result?.error,
        });
      }
    } catch (error) {
      toast("ERROR", {
        description: "Some other error occured!",
      });
    } finally {
      setLoading(false);
    }
  };

  const title = watch("title");
  const category = watch("category");
  const content = watch("content");
  const coverPhoto = watch("coverPhoto");

  useEffect(() => {
    setQuillLoaded(true);
  }, []);

  console.log(title, category, coverPhoto, content);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>AV</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user?.username}</p>
          </div>
        </div>
        <Button onClick={handleSubmit(onBlogSubmit)}>Publish</Button>
      </header>
      <main>
        <form>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                placeholder="Title"
                className="text-4xl font-bold border-none outline-none mb-4 p-0 focus-visible:ring-0"
              />
            )}
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-2">{errors.title.message}</p>
          )}
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a Category" />
                </SelectTrigger>
                <SelectContent>
                  {BLOG_CATEGORIES.map((singleCategory) => (
                    <SelectItem
                      key={singleCategory.key}
                      value={singleCategory.key}
                    >
                      {singleCategory.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <div className="flex items-center mb-5">
            <UploadButton
              className="mt-4 bg-blue-500 text-black p-4 rounded-lg ut-button:bg-black ut-button:ut-readying:bg-black"
              content={{
                button: (
                  <div className="flex gap-3">
                    <PlusCircle className="h-4 w-4 text-green" />
                    <span className="text-[13px]">Add Cover Image</span>
                  </div>
                ),
              }}
              appearance={{
                allowedContent: {
                  display: "none",
                },
              }}
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res && res[0]) {
                  setValue("coverImage", res[0].ufsUrl);
                  toast("Success", {
                    description: "Image uploaded!",
                  });
                }
              }}
              onUploadError={(error) => {
                //error message log
                toast("Failed", {
                  description: `Image upload failed! ${error.message}`,
                  variant: "destructive",
                });
              }}
            />
          </div>
          {quillLoaded && (
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  modules={modules}
                  {...field}
                  onChange={(content) => field.onChange(content)}
                  placeholder="Write a blog content"
                  className="quill-editor"
                />
              )}
            />
          )}
        </form>
      </main>
    </div>
  );
}

export default CreateBlogForm;
