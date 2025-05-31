"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, X, Check, Maximize, Minimize } from "lucide-react"
import Modal from "./modal"

interface ImageCropperProps {
  onCropComplete: (croppedImageUrl: string) => void
  currentImage?: string
  aspectRatio?: number // width/height ratio for the crop area
  cropWidth?: number
  cropHeight?: number
  uniqueId?: string // Add unique identifier to prevent state conflicts
}

export default function ImageCropper({
  onCropComplete,
  currentImage,
  aspectRatio = 16 / 9, // Default to slide aspect ratio
  cropWidth = 600,
  cropHeight = 400,
  uniqueId = "default",
}: ImageCropperProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [imageError, setImageError] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cropMode, setCropMode] = useState<"fit" | "fill">("fit")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Convert blob to data URL for better persistence
  const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  // Initialize with current image on mount and when currentImage changes
  useEffect(() => {
    if (currentImage && currentImage !== imageUrl && !isModalOpen) {
      setImageUrl(currentImage)
      setImageError(false)
      setIsInitialized(true)
    } else if (!currentImage && !isModalOpen) {
      setImageUrl(null)
      setImageError(false)
      setIsInitialized(true)
    }
  }, [currentImage, isModalOpen])

  // Initialize crop area when image loads in modal
  const initializeCropArea = useCallback(
    (img: HTMLImageElement) => {
      const container = containerRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const maxWidth = containerRect.width - 40 // padding
      const maxHeight = containerRect.height - 40

      // Scale image to fit container while maintaining aspect ratio
      const imageAspect = img.naturalWidth / img.naturalHeight
      let displayWidth = maxWidth
      let displayHeight = maxWidth / imageAspect

      if (displayHeight > maxHeight) {
        displayHeight = maxHeight
        displayWidth = maxHeight * imageAspect
      }

      setImageSize({ width: displayWidth, height: displayHeight })

      // Calculate crop area based on mode
      if (cropMode === "fill") {
        // Fill mode: crop area covers the entire image
        setCropArea({ x: 0, y: 0, width: displayWidth, height: displayHeight })
      } else {
        // Fit mode: crop area maintains aspect ratio and fits within image
        const cropAspect = aspectRatio
        let cropW = Math.min(displayWidth * 0.8, displayHeight * cropAspect * 0.8)
        let cropH = cropW / cropAspect

        if (cropH > displayHeight * 0.8) {
          cropH = displayHeight * 0.8
          cropW = cropH * cropAspect
        }

        const cropX = (displayWidth - cropW) / 2
        const cropY = (displayHeight - cropH) / 2

        setCropArea({ x: cropX, y: cropY, width: cropW, height: cropH })
      }
    },
    [aspectRatio, cropMode],
  )

  // Update crop area when mode changes
  useEffect(() => {
    if (imageRef.current && isModalOpen) {
      initializeCropArea(imageRef.current)
    }
  }, [cropMode, initializeCropArea, isModalOpen])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.")
      return
    }

    setIsProcessing(true)

    try {
      // Convert file to data URL for better persistence
      const dataUrl = await blobToDataURL(file)

      // Clean up previous URL if it's a blob
      if (tempImageUrl && tempImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(tempImageUrl)
      }

      setSelectedFile(file)
      setTempImageUrl(dataUrl)
      setImageError(false)
      setIsModalOpen(true)
    } catch (error) {
      console.error("Error processing file:", error)
      alert("Error processing the image file. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImageLoad = () => {
    if (imageRef.current && isModalOpen) {
      initializeCropArea(imageRef.current)
    }
  }

  const handleImageError = () => {
    console.error("Image failed to load in cropper")
    setImageError(true)
    setIsModalOpen(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isModalOpen || cropMode === "fill") return // Disable dragging in fill mode
    setIsDragging(true)
    setDragStart({ x: e.clientX - cropArea.x, y: e.clientY - cropArea.y })
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !isModalOpen || cropMode === "fill") return

      const newX = Math.max(0, Math.min(imageSize.width - cropArea.width, e.clientX - dragStart.x))
      const newY = Math.max(0, Math.min(imageSize.height - cropArea.height, e.clientY - dragStart.y))

      setCropArea((prev) => ({ ...prev, x: newX, y: newY }))
    },
    [isDragging, dragStart, imageSize, cropArea.width, cropArea.height, isModalOpen, cropMode],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging && isModalOpen && cropMode === "fit") {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, isModalOpen, cropMode, handleMouseMove, handleMouseUp])

  const cropImage = async () => {
    if (!imageRef.current || !canvasRef.current || !isModalOpen) return

    setIsProcessing(true)

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const img = imageRef.current
      const scaleX = img.naturalWidth / imageSize.width
      const scaleY = img.naturalHeight / imageSize.height

      // Set canvas size to desired output size
      canvas.width = cropWidth
      canvas.height = cropHeight

      if (cropMode === "fill") {
        // Fill mode: scale image to fill the entire canvas, may crop parts
        const imageAspect = img.naturalWidth / img.naturalHeight
        const canvasAspect = cropWidth / cropHeight

        let sourceWidth = img.naturalWidth
        let sourceHeight = img.naturalHeight
        let sourceX = 0
        let sourceY = 0

        if (imageAspect > canvasAspect) {
          // Image is wider than canvas aspect ratio
          sourceWidth = img.naturalHeight * canvasAspect
          sourceX = (img.naturalWidth - sourceWidth) / 2
        } else {
          // Image is taller than canvas aspect ratio
          sourceHeight = img.naturalWidth / canvasAspect
          sourceY = (img.naturalHeight - sourceHeight) / 2
        }

        ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, cropWidth, cropHeight)
      } else {
        // Fit mode: use the crop area
        const sourceX = cropArea.x * scaleX
        const sourceY = cropArea.y * scaleY
        const sourceWidth = cropArea.width * scaleX
        const sourceHeight = cropArea.height * scaleY

        ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, cropWidth, cropHeight)
      }

      // Convert canvas to data URL instead of blob for better persistence
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9)

      // Clean up previous URL if it's a blob
      if (imageUrl && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl)
      }

      setImageUrl(dataUrl)
      onCropComplete(dataUrl)
      setIsModalOpen(false)

      console.log("Crop complete, new image data URL created")
    } catch (error) {
      console.error("Error cropping image:", error)
      alert("Error cropping the image. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const cancelCrop = () => {
    // Clean up the temporary image URL if it's a blob
    if (tempImageUrl && tempImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(tempImageUrl)
      setTempImageUrl(null)
    }

    setIsModalOpen(false)

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const openCropModal = () => {
    // If we already have an image, use it as the temp image for editing
    if (imageUrl) {
      setTempImageUrl(imageUrl)
    }
    setIsModalOpen(true)
  }

  const clearImage = () => {
    // Clean up any blob URLs
    if (imageUrl && imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl)
    }
    if (tempImageUrl && tempImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(tempImageUrl)
    }

    setImageUrl(null)
    setTempImageUrl(null)
    setSelectedFile(null)
    setIsModalOpen(false)
    setImageError(false)
    onCropComplete("")

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith("blob:") && imageUrl !== currentImage) {
        URL.revokeObjectURL(imageUrl)
      }
      if (tempImageUrl && tempImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(tempImageUrl)
      }
    }
  }, [])

  if (!isInitialized) {
    return (
      <div className="space-y-3">
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-md text-center text-gray-500 text-sm">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label
          htmlFor={`image-upload-${uniqueId}`}
          className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
            isProcessing ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm">{isProcessing ? "Processing..." : imageUrl ? "Change Image" : "Upload Image"}</span>
        </label>
        <input
          ref={fileInputRef}
          id={`image-upload-${uniqueId}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isProcessing}
        />
        {imageUrl && !imageError && !isProcessing && (
          <button
            onClick={clearImage}
            className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {imageUrl && !imageError && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt="Current image"
            className="w-full h-32 object-cover"
            onError={() => setImageError(true)}
          />
          <div className="p-2 bg-gray-50 border-t border-gray-200">
            <button
              onClick={openCropModal}
              className="text-sm text-[#00BFA5] hover:text-[#00A693] font-medium disabled:opacity-50"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Edit Crop"}
            </button>
          </div>
        </div>
      )}

      {imageError && (
        <div className="p-4 border border-red-200 rounded-md bg-red-50">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <X className="w-4 h-4" />
            <span>Failed to load image. Please try uploading again.</span>
          </div>
          <button onClick={clearImage} className="mt-2 text-xs text-red-500 hover:text-red-700 underline">
            Clear and try again
          </button>
        </div>
      )}

      {!imageUrl && !imageError && (
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-md text-center text-gray-500 text-sm">
          <div className="mb-2">No image selected</div>
          <div className="text-xs text-gray-400">
            Recommended: {cropWidth}×{cropHeight}px ({aspectRatio.toFixed(1)}:1 ratio)
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={cancelCrop} title="Crop Image" maxWidth="max-w-5xl">
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-500">
              {cropMode === "fit"
                ? "Drag the crop area to select the visible portion. Maintains aspect ratio."
                : "Image will be scaled to fill the entire area. May crop parts of the image."}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Crop Mode:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCropMode("fit")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors ${
                    cropMode === "fit"
                      ? "bg-[#00BFA5] text-white"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  <Minimize className="w-4 h-4" />
                  Fit
                </button>
                <button
                  onClick={() => setCropMode("fill")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors ${
                    cropMode === "fill"
                      ? "bg-[#00BFA5] text-white"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  <Maximize className="w-4 h-4" />
                  Fill
                </button>
              </div>
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative bg-gray-900 flex items-center justify-center flex-1 min-h-[400px]"
          >
            {tempImageUrl && (
              <img
                ref={imageRef}
                src={tempImageUrl || "/placeholder.svg"}
                alt="Crop preview"
                className="max-w-full max-h-full object-contain"
                style={{ width: imageSize.width, height: imageSize.height }}
                onLoad={handleImageLoad}
                onError={handleImageError}
                draggable={false}
              />
            )}

            {imageSize.width > 0 && tempImageUrl && (
              <>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none" />

                {/* Crop area */}
                <div
                  className={`absolute border-2 border-[#00BFA5] bg-transparent ${
                    cropMode === "fit" ? "cursor-move" : "cursor-default"
                  }`}
                  style={{
                    left: `calc(50% - ${imageSize.width / 2}px + ${cropArea.x}px)`,
                    top: `calc(50% - ${imageSize.height / 2}px + ${cropArea.y}px)`,
                    width: cropArea.width,
                    height: cropArea.height,
                  }}
                  onMouseDown={handleMouseDown}
                >
                  <div className="absolute inset-0 bg-white bg-opacity-10" />
                  <div className="absolute top-1 left-1 text-[#00BFA5] text-xs font-medium bg-black bg-opacity-50 px-1 rounded">
                    {cropMode === "fit" ? "Crop Area (Draggable)" : "Fill Area"}
                  </div>
                </div>

                {/* Corner indicators - only show in fit mode */}
                {cropMode === "fit" && (
                  <>
                    <div
                      className="absolute w-3 h-3 border-2 border-[#00BFA5] bg-white pointer-events-none"
                      style={{
                        left: `calc(50% - ${imageSize.width / 2}px + ${cropArea.x}px - 1px)`,
                        top: `calc(50% - ${imageSize.height / 2}px + ${cropArea.y}px - 1px)`,
                      }}
                    />
                    <div
                      className="absolute w-3 h-3 border-2 border-[#00BFA5] bg-white pointer-events-none"
                      style={{
                        left: `calc(50% - ${imageSize.width / 2}px + ${cropArea.x + cropArea.width}px - 2px)`,
                        top: `calc(50% - ${imageSize.height / 2}px + ${cropArea.y}px - 1px)`,
                      }}
                    />
                    <div
                      className="absolute w-3 h-3 border-2 border-[#00BFA5] bg-white pointer-events-none"
                      style={{
                        left: `calc(50% - ${imageSize.width / 2}px + ${cropArea.x}px - 1px)`,
                        top: `calc(50% - ${imageSize.height / 2}px + ${cropArea.y + cropArea.height}px - 2px)`,
                      }}
                    />
                    <div
                      className="absolute w-3 h-3 border-2 border-[#00BFA5] bg-white pointer-events-none"
                      style={{
                        left: `calc(50% - ${imageSize.width / 2}px + ${cropArea.x + cropArea.width}px - 2px)`,
                        top: `calc(50% - ${imageSize.height / 2}px + ${cropArea.y + cropArea.height}px - 2px)`,
                      }}
                    />
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4 border-t border-gray-200 pt-4">
            <button
              onClick={cancelCrop}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={cropImage}
              className="px-4 py-2 bg-[#00BFA5] text-white rounded-md hover:bg-[#00A693] transition-colors flex items-center gap-2 disabled:opacity-50"
              disabled={isProcessing}
            >
              <Check className="w-4 h-4" />
              {isProcessing ? "Processing..." : "Apply Crop"}
            </button>
          </div>
        </div>
      </Modal>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
