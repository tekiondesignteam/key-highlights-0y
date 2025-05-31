"use client"
import { ArrowLeft, Eye, EyeOff, Home, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import ImageCropper from "../../components/image-cropper"
import { usePresentationStore, type PresentationConfig } from "../../lib/use-presentation-store"
import RichTextEditor from "../../components/rich-text-editor"
import ModuleIcon from "../../components/module-icon"

const colorOptions = [
  { name: "Blue", value: "bg-blue-500" },
  { name: "Green", value: "bg-green-500" },
  { name: "Red", value: "bg-red-500" },
  { name: "Purple", value: "bg-purple-500" },
  { name: "Orange", value: "bg-orange-500" },
  { name: "Indigo", value: "bg-indigo-500" },
  { name: "Teal", value: "bg-[#00BFA5]" },
  { name: "Pink", value: "bg-pink-500" },
  { name: "Yellow", value: "bg-yellow-500" },
  { name: "Cyan", value: "bg-cyan-500" },
]

const iconOptions = [
  { name: "Bar Chart", value: "BarChart3" },
  { name: "Code", value: "Code" },
  { name: "Shield", value: "Shield" },
  { name: "Brain", value: "Brain" },
  { name: "Smartphone", value: "Smartphone" },
  { name: "Trending Up", value: "TrendingUp" },
  { name: "Users", value: "Users" },
  { name: "Zap", value: "Zap" },
  { name: "Link", value: "Link" },
  { name: "Bot", value: "Bot" },
]

export default function AdminPage() {
  const { config, setConfig, isLoaded } = usePresentationStore()
  const [activeTab, setActiveTab] = useState<"intro" | string>("intro")

  const updateIntroTitle = (title: string) => {
    setConfig((prev: PresentationConfig) => ({ ...prev, introTitle: title }))
  }

  const updateIntroSubtitle = (subtitle: string) => {
    setConfig((prev: PresentationConfig) => ({ ...prev, introSubtitle: subtitle }))
  }

  const updateHeroImage = (imageUrl: string) => {
    setConfig((prev: PresentationConfig) => ({ ...prev, heroImage: imageUrl }))
  }

  const updateModuleName = (index: number, name: string) => {
    setConfig((prev: PresentationConfig) => ({
      ...prev,
      modules: prev.modules.map((mod, i) => (i === index ? { ...mod, module: name } : mod)),
    }))
  }

  const updateModuleColor = (index: number, color: string) => {
    setConfig((prev: PresentationConfig) => ({
      ...prev,
      modules: prev.modules.map((mod, i) => (i === index ? { ...mod, color } : mod)),
    }))
  }

  const updateModuleIcon = (index: number, icon: string) => {
    setConfig((prev: PresentationConfig) => ({
      ...prev,
      modules: prev.modules.map((mod, i) => (i === index ? { ...mod, icon } : mod)),
    }))
  }

  const toggleModuleVisibility = (index: number) => {
    setConfig((prev: PresentationConfig) => ({
      ...prev,
      modules: prev.modules.map((mod, i) => (i === index ? { ...mod, visible: !mod.visible } : mod)),
    }))
  }

  const addFeature = (modIndex: number) => {
    setConfig((prev: PresentationConfig) => ({
      ...prev,
      modules: prev.modules.map((mod, i) =>
        i === modIndex
          ? {
              ...mod,
              features: [
                ...mod.features,
                {
                  id: mod.features.length + 1,
                  title: "New Feature",
                  description: "Feature description",
                  image: "/placeholder.svg?height=400&width=600&text=New+Feature",
                  isBeta: false,
                },
              ],
            }
          : mod,
      ),
    }))
  }

  const removeFeature = (modIndex: number, featureIndex: number) => {
    setConfig((prev: PresentationConfig) => ({
      ...prev,
      modules: prev.modules.map((mod, i) =>
        i === modIndex
          ? {
              ...mod,
              features: mod.features.filter((_, j) => j !== featureIndex),
            }
          : mod,
      ),
    }))
  }

  const updateFeature = (modIndex: number, featureIndex: number, field: string, value: string | boolean) => {
    setConfig((prev: PresentationConfig) => ({
      ...prev,
      modules: prev.modules.map((mod, i) =>
        i === modIndex
          ? {
              ...mod,
              features: mod.features.map((feature, j) =>
                j === featureIndex ? { ...feature, [field]: value } : feature,
              ),
            }
          : mod,
      ),
    }))
  }

  const handleImageUpload = (modIndex: number, featureIndex: number, imageUrl: string) => {
    updateFeature(modIndex, featureIndex, "image", imageUrl)
  }

  // Add update functions for thank you slide
  const updateThankYouTitle = (title: string) => {
    setConfig((prev: PresentationConfig) => ({ ...prev, thankYouTitle: title }))
  }

  const updateThankYouDescription = (description: string) => {
    setConfig((prev: PresentationConfig) => ({ ...prev, thankYouDescription: description }))
  }

  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <p className="text-gray-500">Loading admin panel...</p>
      </div>
    )
  }

  const renderIntroContent = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Intro Slide Configuration</h2>
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={config.introTitle}
              onChange={(e) => updateIntroTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
            <input
              type="text"
              value={config.introSubtitle}
              onChange={(e) => updateIntroSubtitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
              placeholder="Enter subtitle text..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image</label>
            <ImageCropper
              onCropComplete={updateHeroImage}
              currentImage={config.heroImage}
              aspectRatio={2 / 3}
              cropWidth={400}
              cropHeight={600}
              uniqueId="hero-image"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderModuleContent = (moduleIndex: number) => {
    const mod = config.modules[moduleIndex]
    if (!mod) return null

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Module {moduleIndex + 1}: {mod.module}
          </h2>
          <button
            onClick={() => toggleModuleVisibility(moduleIndex)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              mod.visible
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {mod.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {mod.visible ? "Visible" : "Hidden"}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Module Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Module Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Module Name</label>
                <input
                  type="text"
                  value={mod.module}
                  onChange={(e) => updateModuleName(moduleIndex, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                  disabled={!mod.visible}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <select
                  value={mod.icon}
                  onChange={(e) => updateModuleIcon(moduleIndex, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                  disabled={!mod.visible}
                >
                  {iconOptions.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex items-center gap-2">
                  <select
                    value={mod.color}
                    onChange={(e) => updateModuleColor(moduleIndex, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                    disabled={!mod.visible}
                  >
                    {colorOptions.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                  <div className={`w-8 h-8 rounded-lg ${mod.color} flex items-center justify-center`}>
                    <ModuleIcon iconName={mod.icon} className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          {mod.visible && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Features</h3>
                <button
                  onClick={() => addFeature(moduleIndex)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Add Feature
                </button>
              </div>

              <div className="space-y-4">
                {mod.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-700">Feature {featureIndex + 1}</h4>
                      <button
                        onClick={() => removeFeature(moduleIndex, featureIndex)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">Title</label>
                          <input
                            type="text"
                            value={feature.title}
                            onChange={(e) => updateFeature(moduleIndex, featureIndex, "title", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                          <RichTextEditor
                            value={feature.description}
                            onChange={(value) => updateFeature(moduleIndex, featureIndex, "description", value)}
                            placeholder="Enter feature description..."
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`beta-${moduleIndex}-${featureIndex}`}
                            checked={feature.isBeta}
                            onChange={(e) => updateFeature(moduleIndex, featureIndex, "isBeta", e.target.checked)}
                            className="w-4 h-4 text-[#00BFA5] border-gray-300 rounded focus:ring-[#00BFA5]"
                          />
                          <label
                            htmlFor={`beta-${moduleIndex}-${featureIndex}`}
                            className="ml-2 text-sm font-medium text-gray-700"
                          >
                            Mark as BETA
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Image</label>
                        <ImageCropper
                          onCropComplete={(imageUrl) => handleImageUpload(moduleIndex, featureIndex, imageUrl)}
                          currentImage={feature.image}
                          aspectRatio={16 / 9}
                          cropWidth={600}
                          cropHeight={400}
                          uniqueId={`feature-${moduleIndex}-${featureIndex}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Add thank you content renderer
  const renderThankYouContent = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Thank You Slide Configuration</h2>
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={config.thankYouTitle}
              onChange={(e) => updateThankYouTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
              placeholder="Enter thank you title..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={config.thankYouDescription}
              onChange={(e) => updateThankYouDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00BFA5]"
              placeholder="Enter thank you description..."
            />
          </div>
        </div>
      </div>
    </div>
  )

  // Update the return statement to make navigation sticky and content scrollable
  return (
    <div className="w-full min-h-screen bg-gray-100 flex">
      {/* Left Sidebar - Fixed */}
      <div className="w-80 bg-white shadow-lg flex flex-col fixed left-0 top-0 h-screen">
        {/* Header - Fixed */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Presentation Admin</h1>
            <Link
              href="/"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Back to Presentation"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-sm text-gray-600">
            Visible modules: {config.modules.filter((mod) => mod.visible).length}/10
          </p>
        </div>

        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {/* Intro Tab */}
            <button
              onClick={() => setActiveTab("intro")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === "intro"
                  ? "bg-[#00BFA5] text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Intro Slide</span>
            </button>

            {/* Module Tabs */}
            <div className="space-y-1">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Modules</div>
              {config.modules.map((mod, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(`module-${index}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === `module-${index}`
                      ? "bg-[#00BFA5] text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className={`p-1.5 ${mod.color} rounded-md flex-shrink-0`}>
                    <ModuleIcon iconName={mod.icon} className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{mod.module}</div>
                    <div className={`text-xs ${activeTab === `module-${index}` ? "text-white/70" : "text-gray-500"}`}>
                      {mod.features.length} feature{mod.features.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {mod.visible ? <Eye className="w-4 h-4 opacity-70" /> : <EyeOff className="w-4 h-4 opacity-50" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Thank You Tab */}
            <button
              onClick={() => setActiveTab("thankyou")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === "thankyou"
                  ? "bg-[#00BFA5] text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                <span className="text-lg">👏</span>
              </div>
              <span className="font-medium">Thank You Slide</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content - Offset by sidebar width and scrollable */}
      <div className="flex-1 ml-80 overflow-y-auto h-screen">
        <div className="p-8">
          {activeTab === "intro" && renderIntroContent()}
          {activeTab === "thankyou" && renderThankYouContent()}
          {activeTab.startsWith("module-") && renderModuleContent(Number.parseInt(activeTab.split("-")[1]))}
        </div>
      </div>
    </div>
  )
}
