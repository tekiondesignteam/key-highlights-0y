"use client"

import { useState, useEffect } from "react"
import { usePresentationStore } from "./lib/use-presentation-store"
import TypewriterText from "./components/typewriter-text"
import ModuleIcon from "./components/module-icon"

export default function ShowcaseGallery() {
  const { config, isLoaded } = usePresentationStore()
  const [currentPage, setCurrentPage] = useState(0)
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0)
  const [showModules, setShowModules] = useState(false)
  const [titleComplete, setTitleComplete] = useState(false)
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({})

  const isIntroPage = currentPage === 0
  const visibleModules = config.modules.filter((mod) => mod.visible)
  const currentModulePage = currentPage > 0 ? visibleModules[currentPage - 1] : null
  const activeFeature = currentModulePage?.features[activeFeatureIndex]

  // Reset intro animations when returning to intro page
  useEffect(() => {
    if (isIntroPage) {
      setShowModules(false)
      setTitleComplete(false)
    }
  }, [isIntroPage])

  // Show modules after title and subtitle are complete
  useEffect(() => {
    if (titleComplete) {
      // Show modules after subtitle appears (1 second total delay)
      const timer = setTimeout(() => {
        setShowModules(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [titleComplete])

  const navigateToPage = (newPage: number) => {
    if (newPage === currentPage) return
    setCurrentPage(newPage)
  }

  const navigateToFeature = (newFeatureIndex: number) => {
    if (newFeatureIndex === activeFeatureIndex) return
    setActiveFeatureIndex(newFeatureIndex)
  }

  const handleImageError = (imageUrl: string) => {
    console.error("Image failed to load:", imageUrl)
    setImageErrors((prev) => ({ ...prev, [imageUrl]: true }))
  }

  const handleImageLoad = (imageUrl: string) => {
    console.log("Image loaded successfully:", imageUrl?.substring(0, 50) + "...")
    // Clear any previous error for this image
    setImageErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[imageUrl]
      return newErrors
    })
  }

  const getImageSrc = (imageUrl: string) => {
    // Handle empty or invalid URLs
    if (!imageUrl || imageUrl.trim() === "") {
      return "/placeholder.svg?height=400&width=600&text=No+Image"
    }

    // If there's an error with this specific image, return placeholder
    if (imageErrors[imageUrl]) {
      return "/placeholder.svg?height=400&width=600&text=Image+Error"
    }

    // For data URLs, return as-is
    if (imageUrl.startsWith("data:")) {
      return imageUrl
    }

    // For blob URLs, check if they're still valid
    if (imageUrl.startsWith("blob:")) {
      // Try to create a new Image to test if blob is still valid
      const testImg = new Image()
      testImg.onerror = () => {
        console.warn("Blob URL is no longer valid:", imageUrl)
        setImageErrors((prev) => ({ ...prev, [imageUrl]: true }))
      }
      testImg.src = imageUrl
      return imageUrl
    }

    // For regular URLs, return as-is
    return imageUrl
  }

  // Update the navigation logic
  const totalPages = visibleModules.length + 2 // intro + modules + thank you
  const isThankYouPage = currentPage === totalPages - 1

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault()
          if (!isIntroPage && !isThankYouPage && activeFeatureIndex > 0) {
            navigateToFeature(activeFeatureIndex - 1)
          } else {
            navigateToPage(Math.max(0, currentPage - 1))
          }
          break
        case "ArrowDown":
          event.preventDefault()
          if (
            !isIntroPage &&
            !isThankYouPage &&
            currentModulePage &&
            activeFeatureIndex < currentModulePage.features.length - 1
          ) {
            navigateToFeature(activeFeatureIndex + 1)
          } else {
            navigateToPage(Math.min(totalPages - 1, currentPage + 1))
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isIntroPage, isThankYouPage, currentModulePage, activeFeatureIndex, totalPages, currentPage])

  useEffect(() => {
    setActiveFeatureIndex(0)
  }, [currentPage])

  if (!isLoaded) {
    return (
      <div className="w-full aspect-[16/9] bg-white rounded-lg shadow-lg flex items-center justify-center">
        <p className="text-gray-500">Loading presentation...</p>
      </div>
    )
  }

  if (isIntroPage) {
    return (
      <div className="w-full aspect-[16/9] bg-white rounded-lg shadow-lg overflow-hidden flex relative">
        {/* Left Column - Image (30%) */}
        <div className="w-[30%] relative bg-gradient-to-br from-slate-800 to-slate-950">
          <img
            src={getImageSrc(config.heroImage) || "/placeholder.svg"}
            alt={config.introTitle}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => handleImageError(config.heroImage)}
            onLoad={() => handleImageLoad(config.heroImage)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        </div>

        {/* Right Column - Content (70%) */}
        <div className="w-[70%] bg-white flex flex-col justify-center px-8 py-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              <TypewriterText
                text={config.introTitle}
                speed={80}
                delay={500}
                onComplete={() => {
                  setTitleComplete(true)
                }}
              />
            </h1>

            <div
              className={`text-lg text-gray-600 transition-all duration-500 ${
                titleComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              {config.introSubtitle}
            </div>
          </div>

          <div
            className={`transition-all duration-500 ${
              showModules ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h2 className="text-base font-semibold text-gray-800 mb-4">What's New</h2>

            <div className="grid grid-cols-2 gap-2">
              {visibleModules.map((mod, index) => (
                <div
                  key={index}
                  className={`group flex items-center gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-500 cursor-pointer ${
                    showModules ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                  }`}
                  style={{
                    transitionDelay: `${index * 50 + 200}ms`,
                  }}
                  onClick={() => navigateToPage(index + 1)}
                >
                  <div
                    className={`p-2 ${mod.color} rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}
                  >
                    <ModuleIcon iconName={mod.icon} className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-gray-700 transition-colors truncate">
                      {mod.module}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {mod.features.length} feature{mod.features.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isThankYouPage) {
    return (
      <div className="w-full aspect-[16/9] bg-white rounded-lg shadow-lg overflow-hidden flex items-center justify-center relative">
        <div className="text-center px-8 py-6 max-w-2xl">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">{config.thankYouTitle}</h1>
          <p className="text-xl text-gray-600 leading-relaxed">{config.thankYouDescription}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full aspect-[16/9] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col relative">
      {/* Image Display Area - 70% of height */}
      <div className="flex-[7] relative">
        <div className="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-950">
          {activeFeature && (
            <img
              src={getImageSrc(activeFeature.image) || "/placeholder.svg"}
              alt={activeFeature.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => handleImageError(activeFeature.image)}
              onLoad={() => handleImageLoad(activeFeature.image)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

          {/* Module Tag */}
          {currentModulePage && (
            <div className="absolute top-4 left-4">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 ${currentModulePage.color} text-white text-sm font-medium rounded-lg`}
              >
                <ModuleIcon iconName={currentModulePage.icon} className="w-4 h-4" />
                {currentModulePage.module}
              </span>
            </div>
          )}

          {/* BETA Tag */}
          {activeFeature?.isBeta && (
            <div className="absolute top-4 right-4">
              <span className="inline-block px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg">BETA</span>
            </div>
          )}
        </div>
      </div>

      {/* Feature Selection - Fixed 30% of height */}
      {currentModulePage && (
        <div className="flex-[3] bg-gray-50 min-h-0">
          <div className="h-full flex flex-col">
            {/* Tab Navigation - Fixed height */}
            <div className="flex border-b border-gray-200 flex-shrink-0">
              {currentModulePage.features.map((feature, index) => (
                <button
                  key={feature.id}
                  className={`flex-1 py-3 px-4 text-center relative transition-all duration-300 ${
                    activeFeatureIndex === index ? "text-[#00BFA5] font-medium" : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => navigateToFeature(index)}
                >
                  <div className="flex items-center justify-center gap-2">
                    {feature.title}
                    {feature.isBeta && (
                      <span className="inline-block px-2 py-1 bg-gray-500 text-white text-xs font-medium rounded-lg">
                        BETA
                      </span>
                    )}
                  </div>
                  {activeFeatureIndex === index && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00BFA5] transition-all duration-300"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Feature Description - Fixed height with scroll */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-4 md:p-6 h-full">
                {activeFeature && (
                  <div
                    className="text-sm md:text-base text-gray-700 leading-relaxed rich-text-content"
                    dangerouslySetInnerHTML={{ __html: activeFeature.description }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
