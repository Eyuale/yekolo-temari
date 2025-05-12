"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UploadCloud, X } from "lucide-react";

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a valid number.",
  }),
  video: z.any().optional(),
  thumbnail: z.any().optional(),
});

const CreateCoursePage = () => {
  // State for file previews
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
    },
  });

  // Handle video file selection
  const handleVideoChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      // Revoke previous object URL to avoid memory leaks
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }

      // Create a new object URL for the selected video
      const url = URL.createObjectURL(files[0]);
      setVideoPreview(url);

      // Update form value
      form.setValue("video", files);
    }
  };

  // Handle thumbnail file selection
  const handleThumbnailChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      // Revoke previous object URL to avoid memory leaks
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }

      // Create a new object URL for the selected image
      const url = URL.createObjectURL(files[0]);
      setThumbnailPreview(url);

      // Update form value
      form.setValue("thumbnail", files);
    }
  };

  // Clear video preview
  const clearVideoPreview = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
      form.setValue("video", undefined);
    }
  };

  // Clear thumbnail preview
  const clearThumbnailPreview = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(null);
      form.setValue("thumbnail", undefined);
    }
  };

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsUploading(true);
    // Client-side validation for files
    if (!videoPreview) {
      form.setError("video", {
        type: "manual",
        message: "Video is required.",
      });
      return;
    }

    if (!thumbnailPreview) {
      form.setError("thumbnail", {
        type: "manual",
        message: "Thumbnail is required.",
      });
      return;
    }

    try {
      // Get the actual files
      const videoFile = (form.getValues("video") as FileList)[0];
      const thumbnailFile = (form.getValues("thumbnail") as FileList)[0];

      // Get presigned URLs for both files
      const videoUploadData = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          fileType: "video",
          contentType: videoFile.type,
        }),
      }).then((res) => res.json());

      const thumbnailUploadData = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          fileType: "thumbnail",
          contentType: thumbnailFile.type,
        }),
      }).then((res) => res.json());

      // Upload files to S3 using presigned URLs
      await Promise.all([
        // Upload video
        fetch(videoUploadData.url, {
          method: "PUT",
          body: videoFile,
          headers: {
            "Content-Type": videoFile.type,
          },
        }),
        // Upload thumbnail
        fetch(thumbnailUploadData.url, {
          method: "PUT",
          body: thumbnailFile,
          headers: {
            "Content-Type": thumbnailFile.type,
          },
        }),
      ]);

      const courseData = {
        ...values,
        videoKey: videoUploadData.key,
        thumbnailKey: thumbnailUploadData.key,
      };

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        throw new Error("Failed to create course");
      }

      // No need to store the response if we're not using it
      await response.json();

       // Clear form and previews
       form.reset();
       clearVideoPreview();
       clearThumbnailPreview();

      // 4. Handle success
      alert("Course created successfully!");
      // Optionally redirect to the course page or dashboard
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error creating course. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [videoPreview, thumbnailPreview]);

  return (
    <div className="flex flex-col w-full p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Course</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title Field */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter course title" {...field} />
                </FormControl>
                <FormDescription>
                  Give your course a clear and descriptive title.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description Field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what students will learn in this course"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide a detailed description of your course content.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price Field */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Set a price for your course (in USD).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Video Upload Field */}
          <FormField
            control={form.control}
            name="video"
            render={() => (
              <FormItem>
                <FormLabel>Course Video</FormLabel>
                <FormControl>
                  <div className="flex flex-col items-center justify-center w-full">
                    {videoPreview ? (
                      <div className="relative w-full">
                        <div className="absolute top-2 right-2 z-10">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="rounded-full p-1 h-8 w-8"
                            onClick={clearVideoPreview}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove video</span>
                          </Button>
                        </div>
                        <video
                          src={videoPreview}
                          controls
                          className="w-full rounded-lg border border-gray-300 max-h-[300px]"
                        />
                      </div>
                    ) : (
                      <label
                        htmlFor="video-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            MP4, MOV, or AVI (MAX. 2GB)
                          </p>
                        </div>
                        <input
                          id="video-upload"
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            handleVideoChange(e.target.files);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Upload the main video for your course.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Thumbnail Upload Field */}
          <FormField
            control={form.control}
            name="thumbnail"
            render={() => (
              <FormItem>
                <FormLabel>Course Thumbnail</FormLabel>
                <FormControl>
                  <div className="flex flex-col items-center justify-center w-full">
                    {thumbnailPreview ? (
                      <div className="relative w-full">
                        <div className="absolute top-2 right-2 z-10">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="rounded-full p-1 h-8 w-8"
                            onClick={clearThumbnailPreview}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove thumbnail</span>
                          </Button>
                        </div>
                        <div className="relative w-full h-[200px] rounded-lg border border-gray-300 overflow-hidden">
                          <Image
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            fill
                            sizes="(max-width: 768px) 100vw, 500px"
                            quality={100}
                            priority
                            style={{ objectFit: "contain" }}
                            unoptimized
                          />
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="thumbnail-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG or GIF (MAX. 5MB)
                          </p>
                        </div>
                        <input
                          id="thumbnail-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            handleThumbnailChange(e.target.files);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Upload a thumbnail image for your course.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Course...
              </>
            ) : (
              "Create Course"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateCoursePage;
