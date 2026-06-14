'use client'

import { useRef, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Camera, SendHorizontal, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function ImageScanContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const topic = searchParams.get("topic") || "general"

  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleScan = async () => {
    if (!selectedFile) return
    setIsScanning(true)

    // Backend connection will be added later
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsScanning(false)
    // TODO SAVE RESPONSE ON LOCALSTORAGE, TO BE FETCHED AND CLEARED AFTER REDIRECT
    if(topic == 'general'){
      router.push("/app/calculator");
    } 
    else{
      router.push(`/app/calculator/${topic}`);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-full bg-scan-background px-4">
      <div className="flex flex-col items-center gap-6 w-full max-w-lg">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary-main/85">Image Scan</h1>
          <p className="text-base text-primary-dark/60">
            Solve your math question, step by step, by uploading an image
          </p>
        </div>

        <div className="w-full">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={handleUploadClick}
            className={`
              relative w-full rounded-2xl border-2 border-dashed transition-all duration-200
              cursor-pointer overflow-hidden
              ${preview
                ? "border-slate-200 bg-white shadow-sm hover:shadow-md"
                : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50 shadow-sm"
              }
            `}
          >
            {preview ? (
              <div className="relative group">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-80 object-contain rounded-2xl p-2"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-2xl" />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-600 
                    hover:text-red-500 hover:bg-white rounded-full p-1.5 shadow-md 
                    opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="p-4 rounded-full bg-slate-100">
                  <Camera size={36} className="text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600">
                    Click to upload an image
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {preview && (
          <Button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full h-12 rounded-xl text-base font-semibold shadow-md 
              hover:shadow-lg transition-all duration-200"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <SendHorizontal className="h-5 w-5" />
                Scan
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

export default function ImageScanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-full bg-scan-background">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      }
    >
      <ImageScanContent />
    </Suspense>
  )
}
