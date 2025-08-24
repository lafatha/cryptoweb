"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Zap, BarChart3, Users, Globe, Award } from "lucide-react"

const values = [
  {
    icon: Shield,
    title: "Security First",
    description: "Bank-level security protocols protect your assets and personal information with enterprise-grade encryption."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Ultra-low latency execution powered by institutional-grade infrastructure for optimal trading performance."
  },
  {
    icon: BarChart3,
    title: "Data-Driven",
    description: "Professional analytics and real-time market insights to help you make informed trading decisions."
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "24/7 access to global cryptocurrency markets with comprehensive coverage of major digital assets."
  }
]

const team = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-Founder",
    background: "Former Goldman Sachs VP with 12+ years in traditional finance and fintech innovation.",
    expertise: ["Strategic Leadership", "Financial Markets", "Regulatory Compliance"]
  },
  {
    name: "Michael Rodriguez",
    role: "CTO & Co-Founder",
    background: "Ex-Google senior engineer specializing in high-frequency trading systems and blockchain technology.",
    expertise: ["Blockchain Technology", "System Architecture", "Security Engineering"]
  },
  {
    name: "Emily Watson",
    role: "Head of Product",
    background: "Former Coinbase product manager with expertise in user experience and trading platform design.",
    expertise: ["Product Strategy", "UX Design", "Trading Platforms"]
  },
  {
    name: "David Kim",
    role: "Head of Research",
    background: "PhD in Financial Economics from MIT, former quantitative analyst at Two Sigma.",
    expertise: ["Quantitative Analysis", "Market Research", "Risk Management"]
  }
]

const stats = [
  { label: "Users Worldwide", value: "250K+" },
  { label: "Daily Volume", value: "$2.3B" },
  { label: "Supported Assets", value: "150+" },
  { label: "Countries", value: "45+" }
]

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          About CryptoFinance
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          We're building the future of institutional-grade cryptocurrency trading, 
          combining cutting-edge technology with professional financial services.
        </p>
      </motion.section>

      {/* Mission Statement */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="p-8">
          <CardContent className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To democratize access to professional-grade cryptocurrency trading tools while maintaining 
              the highest standards of security, transparency, and user experience. We believe that 
              sophisticated financial technology should be accessible to everyone, not just institutions.
            </p>
          </CardContent>
        </Card>
      </motion.section>

      {/* Stats */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <Card key={stat.label} className="text-center p-6">
            <CardContent className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.section>

      {/* Values */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Our Values</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The principles that guide everything we do and every decision we make.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <CardContent className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      <Separator />

      {/* Team */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Meet Our Team</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experienced professionals from top financial institutions and technology companies.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
            >
              <Card className="p-6">
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <div className="text-primary font-medium">{member.role}</div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {member.background}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="text-center space-y-6"
      >
        <Card className="p-8">
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Ready to Join Us?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience the future of cryptocurrency trading with institutional-grade tools 
                and professional-level insights.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Start Trading Today
              </button>
              <button className="px-8 py-3 border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors">
                Learn More
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  )
}
