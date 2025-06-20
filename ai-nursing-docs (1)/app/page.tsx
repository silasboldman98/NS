import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Phone, FileText, Clock, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const features = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Dedicated Phone Number",
      description: "Get your professional nursing consultation line",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "AI SOAP Notes",
      description: "Automatically generate structured SOAP notes from call recordings",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "80% Time Savings",
      description: "Reduce documentation time from hours to minutes",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "HIPAA Compliant",
      description: "Enterprise-grade security and compliance",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Processing",
      description: "SOAP notes delivered to your email within 5 minutes",
    },
  ]

  const plans = [
    {
      name: "Basic",
      price: 29,
      description: "Perfect for individual nurses starting with AI documentation",
      features: [
        "50 calls per month",
        "Basic SOAP note generation",
        "Email delivery",
        "Standard support",
        "Dedicated phone number",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: 79,
      description: "For busy nurses who need unlimited documentation",
      features: [
        "Unlimited calls",
        "Advanced AI processing",
        "Custom SOAP templates",
        "Priority support",
        "Call analytics",
        "Mobile app access",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For healthcare organizations and nursing teams",
      features: [
        "Multiple nurse accounts",
        "Custom integrations",
        "Advanced reporting",
        "On-site training",
        "Dedicated support",
        "API access",
      ],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">NurseScripts</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-4" variant="secondary">
          Revolutionizing Nursing Documentation
        </Badge>
        <h1 className="text-5xl font-bold text-gray-900 mb-6">Transform Your Nursing Documentation with AI</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Get your dedicated phone number, receive patient calls, and automatically generate professional SOAP notes
          with AI. Reduce documentation time by 80% while improving quality.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Link href="/signup">
            <Button size="lg" className="px-8">
              Start Free Trial
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need for Modern Nursing Documentation
          </h2>
          <p className="text-lg text-gray-600">Built specifically for nurses, by healthcare technology experts</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-lg text-gray-600">Start with a free trial, upgrade anytime</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? "border-blue-500 shadow-lg" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">Most Popular</Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-4xl font-bold text-blue-600">
                  {typeof plan.price === "number" ? `$${plan.price}` : plan.price}
                  {typeof plan.price === "number" && <span className="text-lg text-gray-500">/month</span>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="w-full">
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-6 w-6" />
                <span className="text-xl font-bold">NurseScripts</span>
              </div>
              <p className="text-gray-400">Transforming nursing documentation with AI-powered solutions.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>Compliance</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Training</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Careers</li>
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 NurseScripts. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
