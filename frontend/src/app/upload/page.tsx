'use client'

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, FileText, ChevronDown, ChevronUp, Copy, Download, File as FileIcon } from "lucide-react"

export default function EnhancedUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
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
          setUploadedFile(file)
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

  const downloadSummary = () => {
    if (summary) {
      const blob = new Blob([summary], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'document_summary.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <Card className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Document Uploader</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="flex-grow bg-background border-2 border-input focus:border-ring transition-colors duration-200"
                aria-label="Choose file to upload"
                accept=".pdf"
              />
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
            {file && (
              <p className="text-sm text-gray-600">
                <FileText className="inline mr-1 h-4 w-4" />
                Selected: {file.name}
              </p>
            )}
            {uploadedFile && (
              <div className="flex items-center p-3 bg-blue-50 rounded-md">
                <FileIcon className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="font-semibold text-blue-700">Uploaded File:</p>
                  <p className="text-sm text-gray-600">{uploadedFile.name}</p>
                </div>
              </div>
            )}
          </div>
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500">
                <h3 className="text-xl font-bold text-white">Summary</h3>
              </div>
              <div className="p-4">
                <AnimatePresence initial={false}>
                  <motion.div
                    key="content"
                    initial="collapsed"
                    animate={isExpanded ? "expanded" : "collapsed"}
                    exit="collapsed"
                    variants={{
                      expanded: { height: "auto", opacity: 1 },
                      collapsed: { height: "100px", opacity: 0.7 }
                    }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                  >
                    <ScrollArea className="h-full pr-4">
                      <p className="text-sm leading-relaxed text-gray-700">{summary}</p>
                    </ScrollArea>
                  </motion.div>
                </AnimatePresence>
                <div className="flex justify-between items-center mt-4">
                  <Button variant="outline" size="sm" onClick={toggleExpand} className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400">
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
                    <Button variant="outline" size="sm" onClick={copyToClipboard} className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadSummary} className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400">
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
    </div>
  )
}