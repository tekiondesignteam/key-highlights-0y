"use client"

import { useState, useEffect } from "react"

interface Feature {
  id: number
  title: string
  description: string
  image: string
  isBeta?: boolean
}

interface Module {
  module: string
  color: string
  icon: string
  visible: boolean
  features: Feature[]
}

export interface PresentationConfig {
  introTitle: string
  introSubtitle: string
  heroImage: string
  thankYouTitle: string
  thankYouDescription: string
  modules: Module[]
}

const defaultConfig: PresentationConfig = {
  introTitle: "June Release",
  introSubtitle: "Discover the latest features and improvements",
  heroImage: "/placeholder.svg?height=600&width=400&text=Hero+Image",
  thankYouTitle: "Thank You",
  thankYouDescription: "Questions & Discussion",
  modules: [
    {
      module: "Data Science",
      color: "bg-blue-500",
      icon: "BarChart3",
      visible: true,
      features: [
        {
          id: 1,
          title: "Advanced Analytics",
          description:
            "Get detailed insights into your data with our powerful analytics dashboard and real-time reporting.",
          image: "/placeholder.svg?height=400&width=600&text=Analytics+Dashboard",
          isBeta: false,
        },
        {
          id: 2,
          title: "Machine Learning",
          description: "Deploy and manage ML models at scale with our automated pipeline and monitoring tools.",
          image: "/placeholder.svg?height=400&width=600&text=ML+Pipeline",
          isBeta: true,
        },
        {
          id: 3,
          title: "Data Visualization",
          description: "Create stunning visualizations and interactive dashboards to communicate insights effectively.",
          image: "/placeholder.svg?height=400&width=600&text=Data+Visualization",
          isBeta: false,
        },
      ],
    },
    {
      module: "Engineering",
      color: "bg-green-500",
      icon: "Code",
      visible: true,
      features: [
        {
          id: 1,
          title: "Seamless Integration",
          description:
            "Connect with your favorite tools and platforms through our extensive API and integration library.",
          image: "/placeholder.svg?height=400&width=600&text=API+Integration",
          isBeta: false,
        },
        {
          id: 2,
          title: "Cloud Infrastructure",
          description: "Scalable cloud architecture that grows with your business needs and handles any workload.",
          image: "/placeholder.svg?height=400&width=600&text=Cloud+Infrastructure",
          isBeta: false,
        },
        {
          id: 3,
          title: "DevOps Pipeline",
          description: "Automated CI/CD pipelines that ensure fast, reliable deployments with zero downtime.",
          image: "/placeholder.svg?height=400&width=600&text=DevOps+Pipeline",
          isBeta: true,
        },
      ],
    },
    {
      module: "Security",
      color: "bg-red-500",
      icon: "Shield",
      visible: true,
      features: [
        {
          id: 1,
          title: "Enterprise Security",
          description:
            "Bank-level security with end-to-end encryption, compliance certifications, and advanced access controls.",
          image: "/placeholder.svg?height=400&width=600&text=Enterprise+Security",
          isBeta: false,
        },
        {
          id: 2,
          title: "Threat Detection",
          description: "AI-powered threat detection and response system that protects against advanced cyber attacks.",
          image: "/placeholder.svg?height=400&width=600&text=Threat+Detection",
          isBeta: true,
        },
        {
          id: 3,
          title: "Compliance Management",
          description: "Automated compliance monitoring and reporting for GDPR, SOC2, and other industry standards.",
          image: "/placeholder.svg?height=400&width=600&text=Compliance+Management",
          isBeta: false,
        },
      ],
    },
    {
      module: "AI & Machine Learning",
      color: "bg-purple-500",
      icon: "Brain",
      visible: true,
      features: [
        {
          id: 1,
          title: "AI Assistant",
          description: "Intelligent AI assistant to help with complex tasks and decision making.",
          image: "/placeholder.svg?height=400&width=600&text=AI+Assistant",
          isBeta: true,
        },
      ],
    },
    {
      module: "Mobile Development",
      color: "bg-orange-500",
      icon: "Smartphone",
      visible: true,
      features: [
        {
          id: 1,
          title: "Cross-Platform SDK",
          description: "Build native mobile apps for iOS and Android with our unified SDK.",
          image: "/placeholder.svg?height=400&width=600&text=Mobile+SDK",
          isBeta: false,
        },
      ],
    },
    {
      module: "Analytics",
      color: "bg-indigo-500",
      icon: "TrendingUp",
      visible: false,
      features: [
        {
          id: 1,
          title: "Real-time Analytics",
          description: "Monitor your application performance with real-time analytics and insights.",
          image: "/placeholder.svg?height=400&width=600&text=Analytics",
          isBeta: false,
        },
      ],
    },
    {
      module: "Collaboration",
      color: "bg-pink-500",
      icon: "Users",
      visible: false,
      features: [
        {
          id: 1,
          title: "Team Workspace",
          description: "Collaborate effectively with shared workspaces and real-time editing.",
          image: "/placeholder.svg?height=400&width=600&text=Collaboration",
          isBeta: true,
        },
      ],
    },
    {
      module: "Performance",
      color: "bg-yellow-500",
      icon: "Zap",
      visible: false,
      features: [
        {
          id: 1,
          title: "Speed Optimization",
          description: "Boost your application performance with advanced optimization techniques.",
          image: "/placeholder.svg?height=400&width=600&text=Performance",
          isBeta: false,
        },
      ],
    },
    {
      module: "Integration",
      color: "bg-cyan-500",
      icon: "Link",
      visible: false,
      features: [
        {
          id: 1,
          title: "Third-party APIs",
          description: "Seamlessly integrate with popular third-party services and APIs.",
          image: "/placeholder.svg?height=400&width=600&text=Integration",
          isBeta: false,
        },
      ],
    },
    {
      module: "Automation",
      color: "bg-teal-500",
      icon: "Bot",
      visible: false,
      features: [
        {
          id: 1,
          title: "Workflow Automation",
          description: "Automate repetitive tasks and workflows to increase productivity.",
          image: "/placeholder.svg?height=400&width=600&text=Automation",
          isBeta: true,
        },
      ],
    },
  ],
}

const STORAGE_KEY = "showcase-gallery-presentation-config"

export function usePresentationStore() {
  const [config, setConfig] = useState<PresentationConfig>(defaultConfig)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load config from localStorage on initial render
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      setIsLoaded(true)
      return
    }

    try {
      const savedConfig = localStorage.getItem(STORAGE_KEY)
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig)
        // Add subtitle if it doesn't exist (for backward compatibility)
        if (!parsedConfig.introSubtitle) {
          parsedConfig.introSubtitle = "Discover the latest features and improvements"
        }
        // Add thank you fields if they don't exist (for backward compatibility)
        if (!parsedConfig.thankYouTitle) {
          parsedConfig.thankYouTitle = "Thank You"
        }
        if (!parsedConfig.thankYouDescription) {
          parsedConfig.thankYouDescription = "Questions & Discussion"
        }
        // Ensure all modules have icon and visible properties
        if (parsedConfig.modules) {
          parsedConfig.modules = parsedConfig.modules.map((mod: any, index: number) => ({
            ...mod,
            icon: mod.icon || defaultConfig.modules[index]?.icon || "Circle",
            visible: mod.visible !== undefined ? mod.visible : true,
          }))
          // Ensure we have exactly 10 modules
          while (parsedConfig.modules.length < 10) {
            const defaultModule = defaultConfig.modules[parsedConfig.modules.length]
            if (defaultModule) {
              parsedConfig.modules.push(defaultModule)
            } else {
              break
            }
          }
        }
        // Clean invalid blob URLs but preserve data URLs
        const cleanedConfig = cleanInvalidUrls(parsedConfig)
        setConfig(cleanedConfig)
      }
      setIsLoaded(true)
    } catch (error) {
      console.error("Failed to load config from localStorage:", error)
      setIsLoaded(true)
    }
  }, [])

  // Save config to localStorage whenever it changes
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
      } catch (error) {
        console.error("Failed to save config to localStorage:", error)
      }
    }
  }, [config, isLoaded])

  return { config, setConfig, isLoaded }
}

// Helper function to clean invalid URLs but preserve data URLs
function cleanInvalidUrls(config: PresentationConfig): PresentationConfig {
  const cleanedConfig = { ...config }

  // Clean hero image if it's an invalid blob URL (but preserve data URLs)
  if (cleanedConfig.heroImage && cleanedConfig.heroImage.startsWith("blob:")) {
    cleanedConfig.heroImage = "/placeholder.svg?height=600&width=400&text=Hero+Image"
  }

  // Clean module feature images
  cleanedConfig.modules = cleanedConfig.modules.map((module) => ({
    ...module,
    features: module.features.map((feature) => ({
      ...feature,
      image:
        feature.image && feature.image.startsWith("blob:")
          ? "/placeholder.svg?height=400&width=600&text=" + encodeURIComponent(feature.title)
          : feature.image,
    })),
  }))

  return cleanedConfig
}
