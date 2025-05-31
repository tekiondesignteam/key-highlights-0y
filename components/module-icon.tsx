"use client"

import { BarChart3, Code, Shield, Brain, Smartphone, TrendingUp, Users, Zap, Link, Bot, Circle } from "lucide-react"

interface ModuleIconProps {
  iconName: string
  className?: string
}

const iconMap = {
  BarChart3,
  Code,
  Shield,
  Brain,
  Smartphone,
  TrendingUp,
  Users,
  Zap,
  Link,
  Bot,
  Circle,
}

export default function ModuleIcon({ iconName, className = "w-4 h-4" }: ModuleIconProps) {
  const IconComponent = iconMap[iconName as keyof typeof iconMap] || Circle

  return <IconComponent className={className} />
}
