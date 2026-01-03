import { useState, useRef } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";
import { Upload, X, Image as ImageIcon, Video } from "lucide-react";

interface CreatePostProps {
    onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
    const [caption, setCaption] = useState("");
    const [mediaUrl, setMediaUrl] = useState("");
    const [mediaType, setMediaType] = useState<"image" | "video">("image");
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        // Validate file type
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
            toast.error("Please upload an image or video file");
            return;
        }

        // Set media type based on file
        setMediaType(isImage ? "image" : "video");

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setMediaUrl(result);
            setPreviewUrl(result);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveFile = () => {
        setMediaUrl("");
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!caption.trim()) {
            toast.error("Please add a caption");
            return;
        }

        if (!mediaUrl.trim()) {
            toast.error("Please upload an image or video");
            return;
        }

        setLoading(true);

        try {
            await axiosInstance.post("/public/create", {
                caption: caption.trim(),
                mediaUrl: mediaUrl,
                mediaType,
            });

            toast.success("Post created successfully!");
            setCaption("");
            setMediaUrl("");
            setPreviewUrl(null);
            setMediaType("image");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            onPostCreated();
        } catch (error: any) {
            console.error("Error creating post:", error);
            const message = error.response?.data?.message || "Failed to create post";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">Create a Post</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Caption */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Caption
                    </label>
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                        disabled={loading}
                    />
                </div>

                {/* File Upload Area */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Image or Video
                    </label>

                    {!previewUrl ? (
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileInputChange}
                                className="hidden"
                                disabled={loading}
                            />

                            <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Upload className="w-6 h-6 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        Drag and drop your file here, or
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleBrowseClick}
                                        disabled={loading}
                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
                                    >
                                        browse to upload
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Supports: JPG, PNG, GIF, MP4, WebM
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative border border-gray-300 rounded-lg p-4">
                            {/* Preview */}
                            <div className="mb-3">
                                {mediaType === "image" ? (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="max-h-48 mx-auto rounded"
                                    />
                                ) : (
                                    <video
                                        src={previewUrl}
                                        controls
                                        className="max-h-48 mx-auto rounded"
                                    />
                                )}
                            </div>

                            {/* File Info */}
                            <div className="flex items-center justify-between bg-gray-50 rounded p-2">
                                <div className="flex items-center gap-2">
                                    {mediaType === "image" ? (
                                        <ImageIcon className="w-5 h-5 text-blue-600" />
                                    ) : (
                                        <Video className="w-5 h-5 text-blue-600" />
                                    )}
                                    <span className="text-sm text-gray-700">
                                        {mediaType === "image" ? "Image" : "Video"} uploaded
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    disabled={loading}
                                    className="text-red-600 hover:text-red-700 p-1"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Creating...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4" />
                            Create Post
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
