"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Phone,
  FileText,
  Clock,
  TrendingUp,
  Settings,
  Download,
  Play,
  Mail,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

export default function Dashboard() {
  const [user, setUser] = useState({
    name: "Sarah Johnson, RN",
    email: "sarah.johnson@email.com",
    plan: "Professional",
    phoneNumber: "+1 (555) 123-4567",
    subscription: {
      status: "active",
      nextBilling: "2024-02-15",
      callsUsed: 127,
      callsLimit: "unlimited",
    },
  })

  const [recentCalls, setRecentCalls] = useState([
    {
      id: 1,
      patientInitials: "M.D.",
      date: "2024-01-15",
      time: "14:30",
      duration: "12:45",
      status: "completed",
      soapGenerated: true,
      emailSent: true,
    },
    {
      id: 2,
      patientInitials: "J.S.",
      date: "2024-01-15",
      time: "11:15",
      duration: "8:22",
      status: "processing",
      soapGenerated: false,
      emailSent: false,
    },
    {
      id: 3,
      patientInitials: "R.T.",
      date: "2024-01-14",
      time: "16:45",
      duration: "15:30",
      status: "completed",
      soapGenerated: true,
      emailSent: true,
    },
  ])

  const [stats, setStats] = useState({
    totalCalls: 127,
    thisMonth: 23,
    avgProcessingTime: "3.2 min",
    documentationTimeSaved: "42.5 hours",
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {user.subscription.status === "active" ? "Active" : "Inactive"}
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCalls}</div>
              <p className="text-xs text-muted-foreground">+{stats.thisMonth} this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgProcessingTime}</div>
              <p className="text-xs text-muted-foreground">Under 5 min target</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.documentationTimeSaved}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Number</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{user.phoneNumber}</div>
              <p className="text-xs text-muted-foreground">Professional line</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="calls" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calls">Recent Calls</TabsTrigger>
            <TabsTrigger value="soap-notes">SOAP Notes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="calls">
            <Card>
              <CardHeader>
                <CardTitle>Recent Calls</CardTitle>
                <CardDescription>Your latest patient consultations and their processing status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCalls.map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{call.patientInitials}</span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {call.date} at {call.time}
                          </div>
                          <div className="text-sm text-gray-500">Duration: {call.duration}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {call.soapGenerated ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-sm">{call.soapGenerated ? "SOAP Generated" : "Processing"}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {call.emailSent ? (
                            <Mail className="h-4 w-4 text-green-500" />
                          ) : (
                            <Mail className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm">{call.emailSent ? "Email Sent" : "Pending"}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4 mr-1" />
                            Play
                          </Button>
                          {call.soapGenerated && (
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              SOAP
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="soap-notes">
            <Card>
              <CardHeader>
                <CardTitle>SOAP Notes Library</CardTitle>
                <CardDescription>All your generated SOAP notes, searchable and downloadable</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">SOAP Notes Library</h3>
                  <p className="text-gray-500 mb-4">
                    Your generated SOAP notes will appear here for easy access and management.
                  </p>
                  <Button variant="outline">View Sample SOAP Note</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                  <CardDescription>Your documentation patterns and efficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Calls This Month</span>
                      <span className="font-medium">{stats.thisMonth}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Call Duration</span>
                      <span className="font-medium">11:32</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Documentation Time Saved</span>
                      <span className="font-medium text-green-600">{stats.documentationTimeSaved}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>AI Accuracy Rate</span>
                      <span className="font-medium">97.3%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>System performance and reliability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Processing Time</span>
                      <span className="font-medium">{stats.avgProcessingTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>System Uptime</span>
                      <span className="font-medium text-green-600">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Email Delivery Rate</span>
                      <span className="font-medium">100%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Transcription Accuracy</span>
                      <span className="font-medium">96.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your profile and subscription details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Plan</label>
                    <p className="text-gray-900">{user.plan}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Professional Phone</label>
                    <p className="text-gray-900">{user.phoneNumber}</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                  <CardDescription>Manage your billing and plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Current Plan</label>
                    <p className="text-gray-900">{user.plan} - $79/month</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Next Billing</label>
                    <p className="text-gray-900">{user.subscription.nextBilling}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Usage</label>
                    <p className="text-gray-900">
                      {user.subscription.callsUsed} calls this month
                      {user.subscription.callsLimit !== "unlimited" && ` / ${user.subscription.callsLimit}`}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      Manage Billing
                    </Button>
                    <Button variant="outline" className="w-full">
                      Change Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
