
"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { clsx } from "clsx";

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    initialUrl?: string;
    onRemove: () => void;
}

export function ImageUpload({ onUploadComplete, initialUrl, onRemove }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file) return;

        // Validation
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!allowedTypes.includes(file.type)) {
            alert("Only JPG, PNG, and PDF files are allowed.");
            return;
        }

        setUploading(true);
        try {
            const result = await api.uploadFile(file);
            setPreviewUrl(result.url);
            onUploadComplete(result.url);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const removeFile = () => {
        setPreviewUrl(null);
        onRemove();
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const isPdf = previewUrl?.toLowerCase().endsWith(".pdf");
    const fullUrl = previewUrl ? (previewUrl.startsWith("http") ? previewUrl : `http://localhost:8000${previewUrl}`) : null;

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
                Receipt Attachment
            </label>

            {!previewUrl ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={clsx(
                        "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-theme bg-background-secondary p-8 transition-all hover:border-blue-500 hover:bg-background-hover",
                        isDragging && "border-blue-500 bg-background-hover scale-[0.99]"
                    )}
                >
                    <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={onFileChange}
                    />

                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                            <p className="text-sm font-medium text-foreground">Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-3 rounded-full bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 transition-colors group-hover:scale-110">
                                <Upload className="h-6 w-6" />
                            </div>
                            <p className="mb-1 text-sm font-semibold text-foreground">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                                PNG, JPG or PDF (MAX. 5MB)
                            </p>
                        </>
                    )}
                </div>
            ) : (
                <div className="relative overflow-hidden rounded-xl border border-border-theme bg-background shadow-sm transition-colors">
                    {isPdf ? (
                        <div className="flex items-center gap-4 p-4">
                            <div className="rounded-lg bg-red-50 p-2 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                                <FileText className="h-8 w-8" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate text-sm font-medium text-foreground">Receipt PDF Document</p>
                                <a
                                    href={fullUrl!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                                >
                                    View Full Document
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="relative aspect-video w-full bg-gray-100 dark:bg-gray-800">
                            <img
                                src={fullUrl!}
                                alt="Receipt preview"
                                className="h-full w-full object-contain"
                            />
                        </div>
                    )}

                    <button
                        onClick={removeFile}
                        className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-md transition-colors hover:bg-black/70"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
