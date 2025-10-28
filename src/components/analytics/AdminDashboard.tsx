'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  DollarSign, 
  Star, 
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Server,
  Globe,
  Target,
  Award,
  UserPlus,
  ShoppingCart
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { PlatformMetrics } from '@/lib/analytics';

interface AdminDashboardProps {
  initialData?: PlatformMetrics;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

export default function AdminDashboard({ initialData }: AdminDashboardProps) {
  const [data, setData] = useState<PlatformMetrics | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/analytics/platform?from=${dateRange.from}&to=${dateRange.to}`
      );
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        console.error('Failed to fetch analytics:', result.error);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchAnalytics();
    }
  }, [dateRange]);

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const handleExport = async () => {
    // Implement CSV/PDF export functionality
    console.log('Exporting analytics data...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-gray-500">No analytics data available</p>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const MetricCard = ({ title, value, change, icon: Icon, color = "blue" }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600">Comprehensive overview of TechGetAfrica LMS performance</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Date Range:</span>
            </div>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="border rounded px-3 py-1 text-sm"
            />
            <span className="text-sm text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="border rounded px-3 py-1 text-sm"
            />
            <Button size="sm" onClick={() => fetchAnalytics()}>
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Users"
              value={data.totalUsers.toLocaleString()}
              change={Math.round(((data.newUsersThisMonth / data.totalUsers) * 100) * 100) / 100}
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="Total Courses"
              value={data.totalCourses.toLocaleString()}
              icon={BookOpen}
              color="green"
            />
            <MetricCard
              title="Total Revenue"
              value={`$${data.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="yellow"
            />
            <MetricCard
              title="Active Users"
              value={data.activeUsers.toLocaleString()}
              change={Math.round(((data.activeUsers / data.totalUsers) * 100) * 100) / 100}
              icon={Activity}
              color="purple"
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="New Users This Month"
              value={data.newUsersThisMonth.toLocaleString()}
              icon={UserPlus}
              color="green"
            />
            <MetricCard
              title="Courses Completed"
              value={data.coursesCompletedThisMonth.toLocaleString()}
              icon={Award}
              color="purple"
            />
            <MetricCard
              title="Avg Completion Rate"
              value={`${data.averageCompletionRate}%`}
              icon={Target}
              color="blue"
            />
          </div>

          {/* Platform Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Growth</CardTitle>
              <CardDescription>User growth and engagement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={data.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="newUsers" fill="#8884d8" name="New Users" />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="cumulativeUsers" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Total Users"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Popular Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Courses</CardTitle>
              <CardDescription>Top courses by enrollment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.popularCourses.slice(0, 5).map((course, index) => (
                  <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{course.title}</h3>
                        <div className="flex gap-4 mt-1 text-sm text-gray-600">
                          <span>👥 {course.enrollments} enrolled</span>
                          <span>⭐ {course.averageRating.toFixed(1)} rating</span>
                        </div>
                      </div>
                    </div>
                    {course.thumbnail && (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Total Users"
              value={data.totalUsers.toLocaleString()}
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="Active Users"
              value={data.activeUsers.toLocaleString()}
              change={Math.round((data.activeUsers / data.totalUsers) * 100)}
              icon={Activity}
              color="green"
            />
            <MetricCard
              title="New This Month"
              value={data.newUsersThisMonth.toLocaleString()}
              icon={UserPlus}
              color="purple"
            />
          </div>

          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Registration Trends</CardTitle>
              <CardDescription>Daily new user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="newUsers" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Activity Breakdown */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Activity Status</CardTitle>
                <CardDescription>Distribution of user engagement levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active Users', value: data.activeUsers },
                        { name: 'Inactive Users', value: data.totalUsers - data.activeUsers }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[0, 1].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value.toLocaleString(), 'Users']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enrollment vs Completion</CardTitle>
                <CardDescription>Course engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: data.coursesCompletedThisMonth },
                        { name: 'In Progress', value: data.totalEnrollments - data.coursesCompletedThisMonth }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[0, 1].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index + 2]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value.toLocaleString(), 'Courses']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Total Courses"
              value={data.totalCourses.toLocaleString()}
              icon={BookOpen}
              color="blue"
            />
            <MetricCard
              title="Total Enrollments"
              value={data.totalEnrollments.toLocaleString()}
              icon={Users}
              color="green"
            />
            <MetricCard
              title="Completion Rate"
              value={`${data.averageCompletionRate}%`}
              icon={Award}
              color="purple"
            />
          </div>

          {/* Course Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Course Performance Ranking</CardTitle>
              <CardDescription>Courses ranked by enrollment and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.popularCourses.slice(0, 10)} margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="title" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="enrollments" fill="#8884d8" name="Enrollments" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Course Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Course Rating Distribution</CardTitle>
              <CardDescription>Average ratings across all courses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.popularCourses.map(course => ({
                  title: course.title.substring(0, 20) + (course.title.length > 20 ? '...' : ''),
                  rating: course.averageRating
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="title" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="rating" fill="#ffc658" name="Average Rating" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={`$${data.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="green"
            />
            <MetricCard
              title="Revenue per User"
              value={`$${data.totalUsers > 0 ? (data.totalRevenue / data.totalUsers).toFixed(2) : '0'}`}
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="Revenue per Course"
              value={`$${data.totalCourses > 0 ? (data.totalRevenue / data.totalCourses).toFixed(2) : '0'}`}
              icon={BookOpen}
              color="purple"
            />
            <MetricCard
              title="Avg Transaction"
              value={`$${data.totalEnrollments > 0 ? (data.totalRevenue / data.totalEnrollments).toFixed(2) : '0'}`}
              icon={ShoppingCart}
              color="yellow"
            />
          </div>

          {/* Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue growth</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={data.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.3}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue by Course Category */}
          <Card>
            <CardHeader>
              <CardTitle>Top Revenue Generating Courses</CardTitle>
              <CardDescription>Courses contributing most to platform revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.popularCourses
                  .sort((a, b) => (b.enrollments * 100) - (a.enrollments * 100)) // Simulated revenue
                  .slice(0, 8)
                  .map((course, index) => (
                  <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xs">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{course.title}</h4>
                        <p className="text-xs text-gray-600">{course.enrollments} enrollments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        ${(course.enrollments * 99).toLocaleString()} {/* Simulated revenue */}
                      </div>
                      <div className="text-xs text-gray-500">Est. Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Platform Uptime"
              value="99.9%"
              icon={Server}
              color="green"
            />
            <MetricCard
              title="Avg Response Time"
              value="250ms"
              icon={Activity}
              color="blue"
            />
            <MetricCard
              title="Global Reach"
              value="25 Countries"
              icon={Globe}
              color="purple"
            />
          </div>

          {/* System Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm text-gray-600">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm text-gray-600">62%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Disk Usage</span>
                    <span className="text-sm text-gray-600">38%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '38%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement Quality</CardTitle>
                <CardDescription>Platform engagement health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Session Duration</span>
                    <span className="font-medium">24 min avg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pages per Session</span>
                    <span className="font-medium">4.2 avg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bounce Rate</span>
                    <span className="font-medium text-green-600">18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Return Users</span>
                    <span className="font-medium text-blue-600">67%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Usage Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Usage Patterns</CardTitle>
              <CardDescription>Daily active users and engagement trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="newUsers" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Daily New Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}