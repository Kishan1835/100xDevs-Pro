"use client"

import { useState, useEffect } from "react"
import {
  Upload,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Volume2,
  Info,
  Activity,
  Heart,
  Brain,
  Shield,
  History,
  Settings,
  Home,
  Plus,
  BarChart3,
  PieChart,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  Calendar,
  User,
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  Zap,
  Target,
  TrendingDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Sample data - this will be replaced with real data from your database
const healthTrendsData = [
  { month: "Jan", hemoglobin: 12.5, wbc: 7200, platelets: 250000, glucose: 95, cholesterol: 180 },
  { month: "Feb", hemoglobin: 12.8, wbc: 6800, platelets: 280000, glucose: 92, cholesterol: 175 },
  { month: "Mar", hemoglobin: 13.2, wbc: 7000, platelets: 290000, glucose: 88, cholesterol: 170 },
  { month: "Apr", hemoglobin: 13.6, wbc: 6900, platelets: 310000, glucose: 85, cholesterol: 165 },
  { month: "May", hemoglobin: 13.9, wbc: 7100, platelets: 320000, glucose: 82, cholesterol: 160 },
  { month: "Jun", hemoglobin: 14.1, wbc: 6950, platelets: 315000, glucose: 80, cholesterol: 155 },
]

const chartConfig = {
  hemoglobin: {
    label: "Hemoglobin (g/dL)",
    color: "hsl(220, 70%, 50%)",
  },
  wbc: {
    label: "WBC Count",
    color: "hsl(160, 60%, 45%)",
  },
  platelets: {
    label: "Platelets",
    color: "hsl(30, 80%, 55%)",
  },
  glucose: {
    label: "Glucose (mg/dL)",
    color: "hsl(280, 65%, 60%)",
  },
  cholesterol: {
    label: "Cholesterol (mg/dL)",
    color: "hsl(340, 75%, 55%)",
  },
}

export default function MediTrackDashboard() {
  const [selectedTest, setSelectedTest] = useState("hemoglobin")
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: 1,
      name: "Blood_Test_May_2024.pdf",
      status: "completed",
      analyzed: true,
      date: "2024-05-15",
      type: "CBC",
      size: "2.4 MB",
    },
    {
      id: 2,
      name: "Lipid_Profile_June_2024.pdf",
      status: "completed",
      analyzed: false,
      date: "2024-06-10",
      type: "Lipid Profile",
      size: "1.8 MB",
    },
    {
      id: 3,
      name: "Liver_Function_June_2024.pdf",
      status: "processing",
      analyzed: false,
      date: "2024-06-18",
      type: "LFT",
      size: "2.1 MB",
    },
  ])

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getRiskLevel = () => {
    return { level: "Moderate", percentage: 35, color: "hsl(38, 92%, 50%)" }
  }

  const risk = getRiskLevel()

  const handleAnalyze = (fileId: number) => {
    setUploadedFiles((files) =>
      files.map((file) => (file.id === fileId ? { ...file, status: "processing", analyzed: false } : file)),
    )

    setTimeout(() => {
      setUploadedFiles((files) =>
        files.map((file) => (file.id === fileId ? { ...file, status: "completed", analyzed: true } : file)),
      )
    }, 3000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">MediTrack AI</h1>
            <p className="text-muted-foreground">Loading your health dashboard...</p>
          </div>
          <div className="w-48 h-2 bg-muted rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "60%" }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TooltipProvider>
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-72 bg-card border-r border-border min-h-screen p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MediTrack AI</h1>
                <p className="text-sm text-muted-foreground">Health Dashboard</p>
              </div>
            </div>

            <nav className="space-y-2">
              <Button variant="default" className="w-full justify-start gap-3 h-11">
                <Home className="w-5 h-5" />
                Dashboard
                <Badge variant="secondary" className="ml-auto">
                  3
                </Badge>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-11 text-muted-foreground hover:text-foreground"
              >
                <History className="w-5 h-5" />
                History
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-11 text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-5 h-5" />
                Upload New Report
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-11 text-muted-foreground hover:text-foreground"
              >
                <BarChart3 className="w-5 h-5" />
                Analytics
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-11 text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Button>
            </nav>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reports Analyzed</span>
                  <Badge variant="outline">24</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Health Score</span>
                  <Badge variant="default">85/100</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Update</span>
                  <span className="text-sm text-foreground">2 days ago</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Health Dashboard</h2>
                  <p className="text-muted-foreground">Track your health trends and get AI-powered insights</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Report
                  </Button>
                </div>
              </div>

              {/* Stats Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                        <p className="text-2xl font-bold text-foreground">24</p>
                        <p className="text-xs text-green-500 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +12% from last month
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                        <p className="text-2xl font-bold text-foreground">85/100</p>
                        <p className="text-xs text-green-500 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +5 points improved
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Risk Alerts</p>
                        <p className="text-2xl font-bold text-foreground">2</p>
                        <p className="text-xs text-orange-500 flex items-center mt-1">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Requires attention
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-orange-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">AI Insights</p>
                        <p className="text-2xl font-bold text-foreground">7</p>
                        <p className="text-xs text-purple-500 flex items-center mt-1">
                          <Zap className="w-3 h-3 mr-1" />
                          New recommendations
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Brain className="w-6 h-6 text-purple-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upload Reports Section */}
              <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary" />
                        Recent Reports
                      </CardTitle>
                      <CardDescription>Upload and analyze your lab reports (PDF, JPG, PNG supported)</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {uploadedFiles.map((file) => (
                      <Card key={file.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <p className="font-medium text-foreground">{file.name}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {file.date}
                                  </span>
                                  <span>{file.type}</span>
                                  <span>{file.size}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {file.status === "completed" && (
                                    <Badge variant="outline" className="text-green-500 border-green-500/50">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Uploaded
                                    </Badge>
                                  )}
                                  {file.status === "processing" && (
                                    <Badge variant="outline" className="text-orange-500 border-orange-500/50">
                                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                      Processing
                                    </Badge>
                                  )}
                                  {file.analyzed ? (
                                    <Badge
                                      variant="default"
                                      className="bg-green-500/10 text-green-500 border-green-500/20"
                                    >
                                      <Brain className="w-3 h-3 mr-1" />
                                      Analyzed
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">Pending Analysis</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!file.analyzed && file.status === "completed" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleAnalyze(file.id)}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  <Zap className="w-4 h-4 mr-2" />
                                  Analyze
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Health Trends and Risk Level Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Health Trends Overview */}
                <Card className="lg:col-span-2 bg-gradient-to-br from-card to-muted/20">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          Health Trends Overview
                        </CardTitle>
                        <CardDescription>Track your lab values over time with AI insights</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={selectedTest} onValueChange={setSelectedTest}>
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hemoglobin">Hemoglobin</SelectItem>
                            <SelectItem value="wbc">WBC Count</SelectItem>
                            <SelectItem value="platelets">Platelets</SelectItem>
                            <SelectItem value="glucose">Glucose</SelectItem>
                            <SelectItem value="cholesterol">Cholesterol</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <PieChart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={healthTrendsData}>
                          <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="5%"
                                stopColor={chartConfig[selectedTest as keyof typeof chartConfig]?.color || "#3b82f6"}
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor={chartConfig[selectedTest as keyof typeof chartConfig]?.color || "#3b82f6"}
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="month"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area
                            type="monotone"
                            dataKey={selectedTest}
                            stroke={chartConfig[selectedTest as keyof typeof chartConfig]?.color || "#3b82f6"}
                            strokeWidth={3}
                            fill="url(#colorGradient)"
                            dot={{
                              fill: chartConfig[selectedTest as keyof typeof chartConfig]?.color || "#3b82f6",
                              strokeWidth: 2,
                              r: 4,
                            }}
                            activeDot={{ r: 6, strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Risk Level Estimator Widget */}
                <Card className="bg-gradient-to-br from-card to-muted/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-orange-500" />
                      Health Risk Level
                    </CardTitle>
                    <CardDescription>AI-powered risk assessment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="relative w-36 h-36 mx-auto mb-4">
                        <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="hsl(var(--border))"
                            strokeWidth="2"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="hsl(38, 92%, 50%)"
                            strokeWidth="3"
                            strokeDasharray={`${risk.percentage}, 100`}
                            className="drop-shadow-sm"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-foreground">{risk.percentage}%</div>
                            <div className="text-sm text-muted-foreground">Risk Level</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <p className="font-medium text-foreground">
                            Current Risk: <span className="text-yellow-500">{risk.level}</span>
                          </p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                              <Info className="w-4 h-4 mr-2" />
                              How is this calculated?
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Based on abnormal values, trends from recent reports, and AI pattern analysis
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-foreground">Risk Zones</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-muted-foreground">Normal</span>
                          </div>
                          <span className="text-xs text-muted-foreground">0-25%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm text-muted-foreground">Mild Risk</span>
                          </div>
                          <span className="text-xs text-muted-foreground">26-60%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-sm text-muted-foreground">High Risk</span>
                          </div>
                          <span className="text-xs text-muted-foreground">61-100%</span>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full" variant="outline">
                      <ChevronRight className="w-4 h-4 mr-2" />
                      View Detailed Analysis
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Disease Pattern Detection and AI Summary Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-orange-600/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-400">
                      <Brain className="w-5 h-5" />
                      AI Pattern Detection
                    </CardTitle>
                    <CardDescription>Potential health patterns identified by AI analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert className="border-orange-500/20 bg-orange-500/5">
                      <AlertTriangle className="h-4 w-4 text-orange-400" />
                      <AlertDescription className="text-foreground">
                        <div className="space-y-2">
                          <p className="font-medium">Early-stage anemia indicators detected</p>
                          <p className="text-sm text-muted-foreground">
                            Your hemoglobin levels show a gradual decline pattern that may suggest developing anemia.
                            This is based on trends from your last 3 reports and cross-referenced with medical
                            databases.
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">AI Confidence Level</p>
                        <div className="flex items-center gap-2">
                          <Progress value={78} className="w-24 h-2" />
                          <span className="text-sm text-muted-foreground">78%</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-orange-500/20 text-orange-400 hover:bg-orange-500/10"
                      >
                        <ChevronRight className="w-4 h-4 mr-2" />
                        Learn More
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <User className="w-4 h-4 mr-2" />
                        Consult Doctor
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-600/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-400">
                      <Activity className="w-5 h-5" />
                      AI Health Summary
                    </CardTitle>
                    <CardDescription>Natural language insights from your health data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/30 p-4 rounded-lg border border-blue-500/10">
                      <div className="space-y-3">
                        <p className="text-foreground leading-relaxed">
                          Your hemoglobin levels have{" "}
                          <span className="text-green-400 font-medium">improved by 1.2 g/dL</span> over the last 2
                          months, showing positive response to treatment. However, your WBC count remains
                          <span className="text-orange-400 font-medium"> slightly elevated</span>, suggesting continued
                          monitoring is recommended.
                        </p>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Improvement Trend</p>
                            <p className="text-green-400 font-medium flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              +15% Better
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Risk Factors</p>
                            <p className="text-orange-400 font-medium flex items-center gap-1">
                              <TrendingDown className="w-3 h-3" />2 Active
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Summary generated • 2 min ago</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        Listen
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-gradient-to-r from-card to-muted/20">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and AI-powered recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/20"
                    >
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Upload className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">Upload Report</p>
                        <p className="text-xs text-muted-foreground">Add new lab results</p>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/20"
                    >
                      <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">View Trends</p>
                        <p className="text-xs text-muted-foreground">Analyze patterns</p>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/20"
                    >
                      <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <History className="w-6 h-6 text-purple-500" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">Report History</p>
                        <p className="text-xs text-muted-foreground">View all reports</p>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/20"
                    >
                      <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                        <Settings className="w-6 h-6 text-orange-500" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">Settings</p>
                        <p className="text-xs text-muted-foreground">Customize dashboard</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </TooltipProvider>
    </div>
  )
}
