"use client"

import { useState, useRef } from "react"
import { Download, FileText, Loader2 } from "lucide-react"
import Modal from "./modal"
import type { PresentationConfig } from "../lib/use-presentation-store"

interface PDFExporterProps {
  config: PresentationConfig
  onClose: () => void
}

export default function PDFExporter({ config, onClose }: PDFExporterProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const printRef = useRef<HTMLDivElement>(null)

  const visibleModules = config.modules.filter((mod) => mod.visible)
  const totalFeatures = visibleModules.reduce((acc, mod) => acc + mod.features.length, 0)

  // Helper function to strip HTML tags and get plain text
  const stripHtml = (html: string) => {
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  // Helper function to get image source with fallback
  const getImageSrc = (imageUrl: string, fallbackText = "Image") => {
    if (!imageUrl || imageUrl.trim() === "") {
      return `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(fallbackText)}`
    }

    if (imageUrl.startsWith("data:") || imageUrl.startsWith("http")) {
      return imageUrl
    }

    if (imageUrl.startsWith("blob:")) {
      return `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(fallbackText)}`
    }

    return imageUrl
  }

  // Helper function to load image and get dimensions
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  // Helper function to create SVG icon as data URL
  const createIconDataUrl = (iconName: string, color = "#ffffff"): string => {
    const iconSvgs: { [key: string]: string } = {
      BarChart3: `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>`,
      Code: `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>`,
      Shield: `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      Brain: `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>`,
      Smartphone: `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>`,
      TrendingUp: `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>`,
      Users: `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      Zap: `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>`,
      Link: `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
      Bot: `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,
      Circle: `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>`,
      Home: `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`,
    }

    const svgContent = iconSvgs[iconName] || iconSvgs.Circle
    const svgString = `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`
    return `data:image/svg+xml;base64,${btoa(svgString)}`
  }

  // Helper function to convert color class to hex
  const getColorHex = (colorClass: string): string => {
    const colorMap: { [key: string]: string } = {
      "bg-blue-500": "#3b82f6",
      "bg-green-500": "#10b981",
      "bg-red-500": "#ef4444",
      "bg-purple-500": "#8b5cf6",
      "bg-orange-500": "#f97316",
      "bg-indigo-500": "#6366f1",
      "bg-[#00BFA5]": "#00BFA5",
      "bg-pink-500": "#ec4899",
      "bg-yellow-500": "#eab308",
      "bg-cyan-500": "#06b6d4",
      "bg-teal-500": "#14b8a6",
    }
    return colorMap[colorClass] || "#3b82f6"
  }

  // Helper function to load and embed Manrope font
  const loadManropeFont = async (pdf: any) => {
    try {
      // Load Manrope font from Google Fonts
      const fontResponse = await fetch(
        "https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap",
      )
      const fontCss = await fontResponse.text()

      // Extract font URLs from CSS
      const fontUrls = fontCss.match(/url$$[^)]+$$/g)

      if (fontUrls && fontUrls.length > 0) {
        // Load the regular weight font (400)
        const regularFontUrl = fontUrls.find((url) => url.includes("400")) || fontUrls[0]
        const cleanUrl = regularFontUrl.replace(/url$$|$$|'/g, "")

        const fontBuffer = await fetch(cleanUrl).then((res) => res.arrayBuffer())
        const fontBase64 = btoa(String.fromCharCode(...new Uint8Array(fontBuffer)))

        // Add font to PDF
        pdf.addFileToVFS("Manrope-Regular.ttf", fontBase64)
        pdf.addFont("Manrope-Regular.ttf", "Manrope", "normal")

        return "Manrope"
      }
    } catch (error) {
      console.warn("Failed to load Manrope font, using fallback:", error)
    }

    return "Arial, sans-serif"
  }

  // Helper function to create header
  const createHeader = (moduleName?: string) => {
    const header = document.createElement("div")
    header.style.position = "absolute"
    header.style.top = "0"
    header.style.left = "0"
    header.style.right = "0"
    header.style.height = "60px"
    header.style.backgroundColor = "rgba(255, 255, 255, 0.95)"
    header.style.borderBottom = "1px solid #e5e7eb"
    header.style.display = "flex"
    header.style.alignItems = "center"
    header.style.justifyContent = "space-between"
    header.style.padding = "0 24px"
    header.style.zIndex = "10"
    header.style.backdropFilter = "blur(8px)"

    // Left side - Logo
    const leftSide = document.createElement("div")
    leftSide.style.display = "flex"
    leftSide.style.alignItems = "center"
    leftSide.style.gap = "12px"

    const logo = document.createElement("div")
    logo.style.width = "32px"
    logo.style.height = "32px"
    logo.style.backgroundColor = "#00BFA5"
    logo.style.borderRadius = "8px"
    logo.style.display = "flex"
    logo.style.alignItems = "center"
    logo.style.justifyContent = "center"
    logo.style.color = "white"
    logo.style.fontWeight = "700"
    logo.style.fontSize = "14px"
    logo.textContent = "SG"

    const logoText = document.createElement("span")
    logoText.style.fontWeight = "600"
    logoText.style.color = "#1f2937"
    logoText.style.fontSize = "16px"
    logoText.textContent = "Showcase Gallery"

    leftSide.appendChild(logo)
    leftSide.appendChild(logoText)

    // Right side - Module name and home (or navigation hint for intro)
    const rightSide = document.createElement("div")
    rightSide.style.display = "flex"
    rightSide.style.alignItems = "center"
    rightSide.style.gap = "16px"

    if (moduleName) {
      // Feature page header format: Module_icon Module Name | Home_icon
      const moduleInfo = document.createElement("div")
      moduleInfo.style.display = "flex"
      moduleInfo.style.alignItems = "center"
      moduleInfo.style.gap = "8px"
      moduleInfo.style.fontSize = "14px"
      moduleInfo.style.fontWeight = "500"
      moduleInfo.style.color = "#374151"
      moduleInfo.textContent = moduleName

      const separator = document.createElement("span")
      separator.style.color = "#9ca3af"
      separator.style.fontSize = "14px"
      separator.textContent = "|"

      rightSide.appendChild(moduleInfo)
      rightSide.appendChild(separator)
    } else {
      // Intro page - navigation hint
      const navHint = document.createElement("div")
      navHint.style.display = "flex"
      navHint.style.alignItems = "center"
      navHint.style.gap = "8px"
      navHint.style.fontSize = "14px"
      navHint.style.color = "#6b7280"
      navHint.innerHTML = `<span>💡</span><span>Use keyboard ↑↓ arrows to navigate</span>`
      rightSide.appendChild(navHint)
      return header.appendChild(leftSide), header.appendChild(rightSide), header
    }

    const homeIcon = document.createElement("img")
    homeIcon.src = createIconDataUrl("Home", "#6b7280")
    homeIcon.style.width = "16px"
    homeIcon.style.height = "16px"

    rightSide.appendChild(homeIcon)

    header.appendChild(leftSide)
    header.appendChild(rightSide)

    return header
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Import jsPDF dynamically to avoid SSR issues
      const { default: jsPDF } = await import("jspdf")
      const html2canvas = (await import("html2canvas")).default

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      // Load Manrope font
      const fontFamily = await loadManropeFont(pdf)

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10

      let currentPage = 0
      const totalPages = 1 + totalFeatures + 1 // intro + features + thank you

      // Helper function to add a page to PDF
      const addPageToPDF = async (element: HTMLElement, isFirstPage = false) => {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          width: 1056,
          height: 816,
        })

        const imgData = canvas.toDataURL("image/png")
        const imgWidth = pageWidth - margin * 2
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        if (!isFirstPage) {
          pdf.addPage()
        }

        pdf.addImage(imgData, "PNG", margin, margin, imgWidth, Math.min(imgHeight, pageHeight - margin * 2))

        currentPage++
        setExportProgress((currentPage / totalPages) * 100)
      }

      // Create intro page with proper layout
      const introElement = document.createElement("div")
      introElement.style.width = "1056px"
      introElement.style.height = "816px"
      introElement.style.backgroundColor = "#ffffff"
      introElement.style.fontFamily = fontFamily
      introElement.style.display = "flex"
      introElement.style.flexDirection = "column"
      introElement.style.overflow = "hidden"
      introElement.style.boxSizing = "border-box"
      introElement.style.position = "relative"

      // Add header (intro version with navigation hint)
      const introHeader = createHeader()
      introElement.appendChild(introHeader)

      // Main content container
      const mainContent = document.createElement("div")
      mainContent.style.display = "flex"
      mainContent.style.flex = "1"
      mainContent.style.marginTop = "60px"

      // Left side - Hero image (30%)
      const leftSection = document.createElement("div")
      leftSection.style.width = "30%"
      leftSection.style.height = "100%"
      leftSection.style.position = "relative"
      leftSection.style.background = "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
      leftSection.style.overflow = "hidden"

      try {
        const heroImg = await loadImage(getImageSrc(config.heroImage, config.introTitle))
        const heroImgElement = document.createElement("img")
        heroImgElement.src = heroImg.src
        heroImgElement.style.position = "absolute"
        heroImgElement.style.top = "0"
        heroImgElement.style.left = "0"
        heroImgElement.style.width = "100%"
        heroImgElement.style.height = "100%"
        heroImgElement.style.objectFit = "cover"
        heroImgElement.crossOrigin = "anonymous"
        leftSection.appendChild(heroImgElement)
      } catch (error) {
        leftSection.style.display = "flex"
        leftSection.style.alignItems = "center"
        leftSection.style.justifyContent = "center"
        leftSection.innerHTML = `<span style="color: #94a3b8; font-size: 18px;">${config.introTitle}</span>`
      }

      // Right side - Content (70%)
      const rightSection = document.createElement("div")
      rightSection.style.width = "70%"
      rightSection.style.height = "100%"
      rightSection.style.padding = "60px"
      rightSection.style.display = "flex"
      rightSection.style.flexDirection = "column"
      rightSection.style.justifyContent = "center"
      rightSection.style.boxSizing = "border-box"

      // Title and subtitle
      const titleSection = document.createElement("div")
      titleSection.style.marginBottom = "40px"
      titleSection.innerHTML = `
        <h1 style="font-family: ${fontFamily}; font-size: 48px; font-weight: 700; color: #1f2937; margin: 0 0 20px 0; line-height: 1.1; letter-spacing: -0.025em;">${config.introTitle}</h1>
        <p style="font-family: ${fontFamily}; font-size: 20px; color: #6b7280; margin: 0; line-height: 1.4;">${config.introSubtitle}</p>
      `

      // What's New section
      const whatsNewSection = document.createElement("div")
      whatsNewSection.innerHTML = `<h2 style="font-family: ${fontFamily}; font-size: 16px; font-weight: 600; color: #374151; margin: 0 0 24px 0; letter-spacing: 0.025em;">What's New</h2>`

      // Module cards grid
      const moduleGrid = document.createElement("div")
      moduleGrid.style.display = "grid"
      moduleGrid.style.gridTemplateColumns = "repeat(2, 1fr)"
      moduleGrid.style.gap = "16px"

      for (const [index, mod] of visibleModules.entries()) {
        const moduleCard = document.createElement("div")
        moduleCard.style.display = "flex"
        moduleCard.style.alignItems = "center"
        moduleCard.style.gap = "16px"
        moduleCard.style.padding = "20px"
        moduleCard.style.backgroundColor = "#f9fafb"
        moduleCard.style.borderRadius = "12px"
        moduleCard.style.border = "1px solid #e5e7eb"

        // Icon container
        const iconContainer = document.createElement("div")
        iconContainer.style.width = "40px"
        iconContainer.style.height = "40px"
        iconContainer.style.backgroundColor = getColorHex(mod.color)
        iconContainer.style.borderRadius = "8px"
        iconContainer.style.display = "flex"
        iconContainer.style.alignItems = "center"
        iconContainer.style.justifyContent = "center"
        iconContainer.style.flexShrink = "0"

        // Create icon as image
        const iconImg = document.createElement("img")
        iconImg.src = createIconDataUrl(mod.icon, "#ffffff")
        iconImg.style.width = "20px"
        iconImg.style.height = "20px"
        iconContainer.appendChild(iconImg)

        // Text content
        const textContent = document.createElement("div")
        textContent.style.flex = "1"
        textContent.style.minWidth = "0"
        textContent.innerHTML = `
          <h3 style="font-family: ${fontFamily}; font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 4px 0; line-height: 1.2;">${mod.module}</h3>
          <p style="font-family: ${fontFamily}; font-size: 14px; color: #6b7280; margin: 0; line-height: 1.3;">${mod.features.length} feature${mod.features.length !== 1 ? "s" : ""}</p>
        `

        moduleCard.appendChild(iconContainer)
        moduleCard.appendChild(textContent)
        moduleGrid.appendChild(moduleCard)
      }

      rightSection.appendChild(titleSection)
      rightSection.appendChild(whatsNewSection)
      rightSection.appendChild(moduleGrid)

      mainContent.appendChild(leftSection)
      mainContent.appendChild(rightSection)
      introElement.appendChild(mainContent)

      document.body.appendChild(introElement)
      await addPageToPDF(introElement, true)
      document.body.removeChild(introElement)

      // Create feature pages
      for (const module of visibleModules) {
        for (const feature of module.features) {
          const featureElement = document.createElement("div")
          featureElement.style.width = "1056px"
          featureElement.style.height = "816px"
          featureElement.style.backgroundColor = "#ffffff"
          featureElement.style.fontFamily = fontFamily
          featureElement.style.display = "flex"
          featureElement.style.flexDirection = "column"
          featureElement.style.boxSizing = "border-box"
          featureElement.style.position = "relative"

          // Add header (feature version with module name)
          const featureHeader = createHeader(module.module)
          featureElement.appendChild(featureHeader)

          // Main content
          const featureContent = document.createElement("div")
          featureContent.style.display = "flex"
          featureContent.style.flexDirection = "column"
          featureContent.style.flex = "1"
          featureContent.style.marginTop = "60px"

          // Create image section (70% height)
          const imageSection = document.createElement("div")
          imageSection.style.height = "529px" // 70% of remaining height (756px)
          imageSection.style.position = "relative"
          imageSection.style.backgroundColor = "#1f2937"
          imageSection.style.display = "flex"
          imageSection.style.alignItems = "center"
          imageSection.style.justifyContent = "center"
          imageSection.style.overflow = "hidden"

          // Add feature image with proper aspect ratio handling (no overlay)
          const imgContainer = document.createElement("div")
          imgContainer.style.position = "absolute"
          imgContainer.style.top = "0"
          imgContainer.style.left = "0"
          imgContainer.style.width = "100%"
          imgContainer.style.height = "100%"
          imgContainer.style.zIndex = "1"

          try {
            const img = await loadImage(getImageSrc(feature.image, feature.title))

            const containerAspect = 1056 / 529
            const imageAspect = img.naturalWidth / img.naturalHeight

            let imgWidth,
              imgHeight,
              imgLeft = 0,
              imgTop = 0

            if (imageAspect > containerAspect) {
              imgHeight = 529
              imgWidth = imgHeight * imageAspect
              imgLeft = -(imgWidth - 1056) / 2
            } else {
              imgWidth = 1056
              imgHeight = imgWidth / imageAspect
              imgTop = -(imgHeight - 529) / 2
            }

            const imgElement = document.createElement("img")
            imgElement.src = img.src
            imgElement.style.position = "absolute"
            imgElement.style.left = `${imgLeft}px`
            imgElement.style.top = `${imgTop}px`
            imgElement.style.width = `${imgWidth}px`
            imgElement.style.height = `${imgHeight}px`
            imgElement.style.objectFit = "cover"
            imgElement.crossOrigin = "anonymous"

            imgContainer.appendChild(imgElement)
          } catch (error) {
            imgContainer.style.backgroundColor = "#374151"
            imgContainer.style.display = "flex"
            imgContainer.style.alignItems = "center"
            imgContainer.style.justifyContent = "center"
            imgContainer.innerHTML = `<span style="color: #9ca3af; font-size: 18px;">${feature.title}</span>`
          }

          // Add BETA tag if applicable (no module tag)
          if (feature.isBeta) {
            const betaTag = document.createElement("div")
            betaTag.style.position = "absolute"
            betaTag.style.top = "20px"
            betaTag.style.right = "20px"
            betaTag.style.padding = "10px 16px"
            betaTag.style.backgroundColor = "#6b7280"
            betaTag.style.color = "white"
            betaTag.style.borderRadius = "8px"
            betaTag.style.fontSize = "14px"
            betaTag.style.fontWeight = "500"
            betaTag.style.zIndex = "3"
            betaTag.textContent = "BETA"
            imageSection.appendChild(betaTag)
          }

          imageSection.appendChild(imgContainer)

          // Create content section (30% height)
          const contentSection = document.createElement("div")
          contentSection.style.height = "227px" // 30% of remaining height
          contentSection.style.backgroundColor = "#f9fafb"
          contentSection.style.display = "flex"
          contentSection.style.flexDirection = "column"

          // Create tab navigation area (without highlight)
          const tabSection = document.createElement("div")
          tabSection.style.borderBottom = "1px solid #e5e7eb"
          tabSection.style.backgroundColor = "#ffffff"
          tabSection.style.padding = "0"
          tabSection.style.display = "flex"
          tabSection.style.alignItems = "center"
          tabSection.style.minHeight = "60px"

          const tabButton = document.createElement("div")
          tabButton.style.padding = "16px 20px"
          tabButton.style.color = "#374151"
          tabButton.style.fontWeight = "500"
          tabButton.style.fontSize = "15px"
          tabButton.style.display = "flex"
          tabButton.style.alignItems = "center"
          tabButton.style.gap = "8px"
          tabButton.style.fontFamily = fontFamily

          if (feature.isBeta) {
            const betaSpan = document.createElement("span")
            betaSpan.style.backgroundColor = "#6b7280"
            betaSpan.style.color = "white"
            betaSpan.style.padding = "4px 8px"
            betaSpan.style.borderRadius = "4px"
            betaSpan.style.fontSize = "12px"
            betaSpan.style.marginLeft = "8px"
            betaSpan.textContent = "BETA"
            tabButton.appendChild(document.createTextNode(feature.title))
            tabButton.appendChild(betaSpan)
          } else {
            tabButton.textContent = feature.title
          }

          tabSection.appendChild(tabButton)

          // Create description area
          const descriptionSection = document.createElement("div")
          descriptionSection.style.flex = "1"
          descriptionSection.style.padding = "24px"
          descriptionSection.style.backgroundColor = "#f9fafb"
          descriptionSection.style.overflow = "hidden"

          const description = stripHtml(feature.description)
          descriptionSection.innerHTML = `
            <div style="font-family: ${fontFamily}; font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0; font-weight: 400;">
              ${description}
            </div>
          `

          contentSection.appendChild(tabSection)
          contentSection.appendChild(descriptionSection)

          featureContent.appendChild(imageSection)
          featureContent.appendChild(contentSection)
          featureElement.appendChild(featureContent)

          document.body.appendChild(featureElement)
          await addPageToPDF(featureElement)
          document.body.removeChild(featureElement)
        }
      }

      // Create thank you page
      const thankYouElement = document.createElement("div")
      thankYouElement.style.width = "1056px"
      thankYouElement.style.height = "816px"
      thankYouElement.style.backgroundColor = "#ffffff"
      thankYouElement.style.fontFamily = fontFamily
      thankYouElement.style.display = "flex"
      thankYouElement.style.flexDirection = "column"
      thankYouElement.style.boxSizing = "border-box"
      thankYouElement.style.position = "relative"

      // Add header (thank you version)
      const thankYouHeader = createHeader()
      thankYouElement.appendChild(thankYouHeader)

      // Content
      const thankYouContent = document.createElement("div")
      thankYouContent.style.flex = "1"
      thankYouContent.style.display = "flex"
      thankYouContent.style.flexDirection = "column"
      thankYouContent.style.justifyContent = "center"
      thankYouContent.style.alignItems = "center"
      thankYouContent.style.textAlign = "center"
      thankYouContent.style.padding = "60px"
      thankYouContent.style.marginTop = "60px"

      thankYouContent.innerHTML = `
        <h1 style="font-family: ${fontFamily}; font-size: 64px; font-weight: 700; color: #1f2937; margin: 0 0 30px 0; line-height: 1.1; letter-spacing: -0.025em;">${config.thankYouTitle}</h1>
        <p style="font-family: ${fontFamily}; font-size: 24px; color: #6b7280; line-height: 1.5; max-width: 600px; margin: 0; font-weight: 400;">${config.thankYouDescription}</p>
      `

      thankYouElement.appendChild(thankYouContent)

      document.body.appendChild(thankYouElement)
      await addPageToPDF(thankYouElement)
      document.body.removeChild(thankYouElement)

      // Save the PDF
      const fileName = `${config.introTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_presentation.pdf`
      pdf.save(fileName)

      setExportProgress(100)
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Error exporting PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Export Presentation as PDF" maxWidth="max-w-2xl">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-[#00BFA5]" />
            <h3 className="text-lg font-semibold text-gray-900">PDF Export Preview</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            This will export your presentation as a PDF with updated headers and navigation. Features are limited to 4
            per module.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Export Contents:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00BFA5] rounded-full"></div>
              <span>Intro slide: {config.introTitle} (with navigation hint in header)</span>
            </div>
            {visibleModules.map((module, moduleIndex) => (
              <div key={moduleIndex}>
                <div className="flex items-center gap-2 font-medium">
                  <div className={`w-3 h-3 ${module.color} rounded-sm`}></div>
                  <span>
                    {module.module} ({module.features.length}/4 features)
                  </span>
                </div>
                {module.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="ml-5 flex items-center gap-2 text-gray-600">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span>
                      {feature.title} {feature.isBeta && "(BETA)"}
                    </span>
                  </div>
                ))}
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00BFA5] rounded-full"></div>
              <span>Thank you slide: {config.thankYouTitle}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-blue-600 mt-0.5">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Updated Features:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Intro slide header shows navigation hint instead of home button</li>
                <li>• Feature page headers: Module_icon Module Name | Home_icon</li>
                <li>• Maximum 4 features per module enforced</li>
                <li>• Secondary button styling for Add Feature CTAs</li>
                <li>• Clean images without overlays or module tags</li>
                <li>• Embedded Manrope fonts for consistency</li>
              </ul>
            </div>
          </div>
        </div>

        {isExporting && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#00BFA5]" />
              <span className="text-sm font-medium text-gray-900">Exporting PDF...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#00BFA5] h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{Math.round(exportProgress)}% complete</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={exportToPDF}
            disabled={isExporting || totalFeatures === 0}
            className="px-4 py-2 bg-[#00BFA5] text-white rounded-md hover:bg-[#00A693] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </button>
        </div>

        {totalFeatures === 0 && (
          <p className="text-sm text-red-600 mt-2">
            No visible modules with features to export. Please make sure at least one module is visible and has
            features.
          </p>
        )}
      </div>
    </Modal>
  )
}
