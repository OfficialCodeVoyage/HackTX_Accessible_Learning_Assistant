'use client'

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, FileText, ChevronDown, ChevronUp, Copy, Download } from "lucide-react"

export default function EnhancedUploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [summary, setSummary] = useState<string | null>(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (file) {
            setIsUploading(true)
            const formData = new FormData()
            formData.append("file", file)

            try {
                const uploadResponse = await fetch("http://localhost:8000/upload", {
                    method: "POST",
                    body: formData,
                })

                if (uploadResponse.ok) {
                    console.log("Upload successful")
                    // Fetch the summary after successful upload
                    const summaryResponse = await fetch("http://localhost:8000/summary")
                    if (summaryResponse.ok) {
                        const summaryData = await summaryResponse.json()
                        setSummary(summaryData.summary)
                    } else {
                        console.error("Failed to fetch summary")
                    }
                } else {
                    console.error("Upload failed")
                }
                
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                }
                setFile(null)
            } catch (error) {
                console.error("Upload or summary error:", error)
            }

            setIsUploading(false)
        }
    }

    const toggleExpand = () => setIsExpanded(!isExpanded)

    const copyToClipboard = () => {
        if (summary) {
            navigator.clipboard.writeText(summary)
                .then(() => alert('Summary copied to clipboard!'))
                .catch(err => console.error('Failed to copy text: ', err))
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Upload Document</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2">
                    <Input
                        type="file"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="flex-grow"
                    />
                    <Button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                </div>
                {file && (
                    <p className="mt-2 text-sm text-muted-foreground">
                        <FileText className="inline mr-1 h-4 w-4" />
                        {file.name}
                    </p>
                )}
                {summary && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md overflow-hidden"
                    >
                        <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500">
                            <h3 className="text-xl font-bold text-white">Document Summary</h3>
                        </div>
                        <div className="p-4">
                            <AnimatePresence initial={false}>
                                <motion.div
                                    key="content"
                                    initial="collapsed"
                                    animate={isExpanded ? "expanded" : "collapsed"}
                                    exit="collapsed"
                                    variants={{
                                        expanded: { height: "auto" },
                                        collapsed: { height: "100px" }
                                    }}
                                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                                >
                                    <ScrollArea className="h-full">
                                        <p className="text-sm leading-relaxed text-gray-700">{summary}</p>
                                    </ScrollArea>
                                </motion.div>
                            </AnimatePresence>
                            <div className="flex justify-between items-center mt-4">
                                <Button variant="outline" size="sm" onClick={toggleExpand}>
                                    {isExpanded ? (
                                        <>
                                            <ChevronUp className="h-4 w-4 mr-2" />
                                            Show Less
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-4 w-4 mr-2" />
                                            Show More
                                        </>
                                    )}
                                </Button>
                                <div className="space-x-2">
                                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    )
}