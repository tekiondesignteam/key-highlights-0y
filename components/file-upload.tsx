"use client"

import type React from "react"
import { useState, useId, useEffect } from "react"
import { Upload, X } from "lucide-react"

interface FileUploadProps {
  onUploadComplete: (imageUrl: string) => void
  currentImage?: string
}

export default function FileUpload({ onUploadComplete, currentImage }: FileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null)
  const [imageError, setImageError] = useState(false)
  const inputId = useId()

  // Update preview when currentImage changes
  useEffect(() => {
    if (currentImage !== previewUrl) {
      setPreviewUrl(currentImage || null)
      setImageError(false)
    }
  }, [currentImage])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.")
      return
    }

    // Clean up previous blob URL if it exists
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    // Create a new blob URL
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setImageError(false)

    // Immediately update the configuration with the new image
    onUploadComplete(objectUrl)
  }

  const clearImage = () => {
    // Clean up blob URL
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setImageError(false)
    onUploadComplete("")

    // Clear the input
    const input = document.getElementById(inputId) as HTMLInputElement
    if (input) {
      input.value = ""
    }
  }

  const handleImageError = () => {
    console.warn("Failed to load image:", previewUrl)
    setImageError(true)

    // If it's a blob URL that failed, clean it up
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      onUploadComplete("")
    }
  }

  const handleImageLoad = () => {
    setImageError(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label
          htmlFor={inputId}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm">Upload Image</span>
        </label>
        <input id={inputId} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        {previewUrl && !imageError && (
          <button
            onClick={clearImage}
            className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {previewUrl && !imageError && (
        <div className="relative mt-2 border border-gray-200 rounded-md overflow-hidden">
          <img
            src={previewUrl || "/placeholder.svg"}
            alt="Preview"
            className="w-full h-32 object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </div>
      )}

      {imageError && (
        <div className="mt-2 p-4 border border-red-200 rounded-md bg-red-50">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <X className="w-4 h-4" />
            <span>Failed to load image. Please try uploading again.</span>
          </div>
          <button onClick={clearImage} className="mt-2 text-xs text-red-500 hover:text-red-700 underline">
            Clear and try again
          </button>
        </div>
      )}

      {!previewUrl && !imageError && (
        <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-md text-center text-gray-500 text-sm">
          No image selected
        </div>
      )}
    </div>
  )
}
