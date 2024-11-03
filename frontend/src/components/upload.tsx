"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ProgressScreen";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";

export default function UploadScreen() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(
            acceptedFiles.map((file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                })
            )
        );
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });

    const removeFile = (file) => {
        const newFiles = [...files];
        newFiles.splice(newFiles.indexOf(file), 1);
        setFiles(newFiles);
    };

    const uploadFiles = () => {
        setUploading(true);
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setUploading(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 500);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Upload Course Materials</h1>

            <Card>
                <CardHeader>
                    <CardTitle>File Upload</CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            isDragActive
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 hover:border-blue-500"
                        }`}
                    >
                        <input {...getInputProps()} />
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                            Drag 'n' drop some files here, or click to select
                            files
                        </p>
                    </div>

                    <AnimatePresence>
                        {files.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 space-y-2"
                            >
                                {files.map((file) => (
                                    <div
                                        key={file.name}
                                        className="flex items-center justify-between p-2 bg-gray-100 rounded"
                                    >
                                        <div className="flex items-center">
                                            <img
                                                src={file.preview}
                                                alt={file.name}
                                                className="h-10 w-10 object-cover rounded mr-2"
                                                onLoad={() =>
                                                    URL.revokeObjectURL(
                                                        file.preview
                                                    )
                                                }
                                            />
                                            <span className="text-sm">
                                                {file.name}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(file)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {files.length > 0 && (
                        <div className="mt-4">
                            <Button onClick={uploadFiles} disabled={uploading}>
                                {uploading ? "Uploading..." : "Upload Files"}
                            </Button>
                        </div>
                    )}

                    {uploading && (
                        <div className="mt-4">
                            <Progress value={uploadProgress} className="h-2" />
                            <p className="mt-2 text-sm text-gray-600">
                                Uploading... {uploadProgress}%
                            </p>
                        </div>
                    )}

                    {uploadProgress === 100 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center"
                        >
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Files uploaded successfully!
                        </motion.div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Upload Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>Maximum file size: 50MB</li>
                        <li>Accepted file types: PDF, DOCX, PPT, MP4</li>
                        <li>
                            Ensure all content is original or properly licensed
                        </li>
                        <li>Organize files by topic for easier navigation</li>
                    </ul>
                    <div className="mt-4 p-4 bg-yellow-100 text-yellow-700 rounded-lg flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Please review our content guidelines before uploading.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
