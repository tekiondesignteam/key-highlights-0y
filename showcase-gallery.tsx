"use client"

import { useState, useEffect } from "react"
import { usePresentationStore } from "./lib/use-presentation-store"
import TypewriterText from "./components/typewriter-text"
import ModuleIcon from "./components/module-icon"
import { Home } from "lucide-react"
import { usePasswordStore } from "./lib/password-store"
import PasswordProtection from "./components/password-protection"

export default function ShowcaseGallery() {
  const { isAuthenticated, isLoading, authenticate } = usePasswordStore()
  const { config, isLoaded } = usePresentationStore()
  const [currentPage, setCurrentPage] = useState(0)
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0)
  const [showModules, setShowModules] = useState(false)
  const [titleComplete, setTitleComplete] = useState(false)
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({})
  const [moduleLoading, setModuleLoading] = useState(false)
  const [showModuleContent, setShowModuleContent] = useState(false)

  const isIntroPage = currentPage === 0
  const visibleModules = config.modules.filter((mod) => mod.visible)
  const currentModulePage = currentPage > 1 ? visibleModules[currentPage - 2] : null
  const activeFeature = currentModulePage?.features[activeFeatureIndex]

  // Reset intro animations when returning to intro page
  useEffect(() => {
    if (isIntroPage) {
      setShowModules(false)
      setTitleComplete(false)
      setModuleLoading(false)
      setShowModuleContent(false)
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

  // Handle module loading animation
  useEffect(() => {
    if (!isIntroPage && currentModulePage && !isThankYouPage) {
      setModuleLoading(true)
      setShowModuleContent(false)

      // Show module loader for 0.6 seconds, then transition to content
      const timer = setTimeout(() => {
        setModuleLoading(false)
        setShowModuleContent(true)
      }, 600)

      return () => clearTimeout(timer)
    }
  }, [currentPage, currentModulePage])

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

  const getImageSrc = (imageUrl: string, isHero = false) => {
    // Handle empty or invalid URLs
    if (!imageUrl || imageUrl.trim() === "") {
      return isHero ? "/hero-placeholder.png" : "/placeholder.png"
    }

    // If there's an error with this specific image, return placeholder
    if (imageErrors[imageUrl]) {
      return isHero ? "/hero-placeholder.png" : "/placeholder.png"
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
  const totalPages = visibleModules.length + 3 // intro + statement + modules + thank you
  const isStatementPage = currentPage === 1
  const isThankYouPage = currentPage === totalPages - 1

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't allow navigation during module loading
      if (moduleLoading) return

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault()
          if (!isIntroPage && !isThankYouPage && !isStatementPage && activeFeatureIndex > 0) {
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
            !isStatementPage &&
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
  }, [
    isIntroPage,
    isThankYouPage,
    isStatementPage,
    currentModulePage,
    activeFeatureIndex,
    totalPages,
    currentPage,
    moduleLoading,
  ])

  useEffect(() => {
    setActiveFeatureIndex(0)
  }, [currentPage])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <PasswordProtection onAuthenticate={authenticate} />
  }

  if (!isLoaded) {
    return (
      <div className="w-full aspect-[16/9] bg-white rounded-lg shadow-lg flex items-center justify-center">
        <p className="text-gray-500">Loading presentation...</p>
      </div>
    )
  }

  const renderHeader = () => {
    if (isIntroPage) {
      // Intro slide header - only logo and navigation hint with pill
      return (
        <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00BFA5] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SG</span>
            </div>
            <span className="font-semibold text-gray-900">Showcase Gallery</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              <span>💡</span>
              <span>Use keyboard ↑↓ arrows to navigate</span>
            </div>
          </div>
        </div>
      )
    }

    // Other slides header - module info and home icon with fixed spacing
    return (
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00BFA5] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SG</span>
          </div>
          <span className="font-semibold text-gray-900">Showcase Gallery</span>
        </div>
        <div className="flex items-center gap-3">
          {!isThankYouPage && !isStatementPage && currentModulePage && (
            <div
              className={`flex items-center gap-2 transition-all duration-700 ${
                moduleLoading ? "opacity-0 transform translate-x-4" : "opacity-100 transform translate-x-0"
              }`}
            >
              <div className={`w-6 h-6 ${currentModulePage.color} rounded flex items-center justify-center`}>
                <ModuleIcon iconName={currentModulePage.icon} className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{currentModulePage.module}</span>
              <span className="text-gray-400 mx-1">|</span>
            </div>
          )}
          <button
            onClick={() => navigateToPage(0)}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Home"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  const renderModuleLoader = () => {
    if (!currentModulePage || !moduleLoading) return null

    return (
      <div className="absolute inset-0 bg-white z-20 flex items-center justify-center">
        <div
          className={`flex flex-col items-center gap-4 transition-all duration-700 ${
            moduleLoading ? "opacity-100 scale-100" : "opacity-0 scale-95 transform translate-x-96 -translate-y-96"
          }`}
        >
          {/* Module Icon with pulse animation */}
          <div
            className={`w-16 h-16 ${currentModulePage.color} rounded-2xl flex items-center justify-center animate-pulse`}
          >
            <ModuleIcon iconName={currentModulePage.icon} className="w-8 h-8 text-white" />
          </div>

          {/* Module Name */}
          <h2 className="text-2xl font-bold text-gray-900 animate-pulse">{currentModulePage.module}</h2>

          {/* Loading dots */}
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-[#00BFA5] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-[#00BFA5] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-[#00BFA5] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (isIntroPage) {
    return (
      <div className="w-full aspect-[16/9] bg-white rounded-lg shadow-lg overflow-hidden flex relative">
        {renderHeader()}
        <div className="w-full flex mt-12">
          {/* Left Column - Image (30%) */}
          <div className="w-[30%] relative bg-gradient-to-br from-slate-800 to-slate-950">
            <img
              src={getImageSrc(config.heroImage, true) || "/placeholder.png"}
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
                    onClick={() => navigateToPage(index + 2)}
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
      </div>
    )
  }

  if (isStatementPage) {
    return (
      <div className="w-full aspect-[16/9] bg-white rounded-lg shadow-lg overflow-hidden flex items-start relative">
        {renderHeader()}
        <div className="text-left px-12 py-8 w-full mt-12">
          <h1 className="font-bold text-gray-900 mb-8" style={{ fontSize: "1.25rem" }}>
            {config.statementTitle}
          </h1>
          <div
            className="text-base text-gray-700 leading-relaxed rich-text-content"
            style={{ fontSize: "0.75rem" }}
            dangerouslySetInnerHTML={{ __html: config.statementDescription }}
          ></div>
        </div>
      </div>
    )
  }

  if (isThankYouPage) {
    return (
      <div className="w-full aspect-[16/9] bg-white rounded-lg shadow-lg overflow-hidden flex items-center justify-center relative">
        {renderHeader()}
        <div className="text-center px-8 py-6 max-w-2xl mt-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">{config.thankYouTitle}</h1>
          <p className="text-xl text-gray-600 leading-relaxed">{config.thankYouDescription}</p>
        </div>
      </div>
    )
  }

  if (isThankYouPage) {
    return (
      <div className="w-full aspect-[16/9] bg-white rounded-lg shadow-lg overflow-hidden flex items-center justify-center relative">
        {renderHeader()}
        <div className="text-center px-8 py-6 max-w-2xl mt-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">{config.thankYouTitle}</h1>
          <p className="text-xl text-gray-600 leading-relaxed">{config.thankYouDescription}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full aspect-[16/9] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col relative">
      {renderHeader()}
      {renderModuleLoader()}

      {/* Image Display Area - 70% of height */}
      <div
        className={`flex-[7] relative mt-12 transition-all duration-700 ${
          showModuleContent ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-950">
          {activeFeature && (
            <img
              src={getImageSrc(activeFeature.image) || "/placeholder.png"}
              alt={activeFeature.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => handleImageError(activeFeature.image)}
              onLoad={() => handleImageLoad(activeFeature.image)}
            />
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
        <div
          className={`flex-[3] bg-gray-50 min-h-0 transition-all duration-700 ${
            showModuleContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
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
