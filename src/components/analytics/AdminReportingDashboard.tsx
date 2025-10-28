'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/components/UserProvider';
import { 
  AnalyticsLineChart, 
  AnalyticsBarChart, 
  AnalyticsPieChart,
  AnalyticsAreaChart,
  MetricCard,
  ComparisonChart
} from './ChartComponents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Star,
  BookOpen,
  Target,
  Award,
  Globe,
  Activity,
  Server,
  Shield,
  AlertCircle,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Database,
  Zap,
  Clock,
  UserCheck,
  TrendingDown
} from 'lucide-react';
import { 
  AdminDashboardData, 
  PlatformOverview, 
  UserGrowthData, 
  RevenueAnalytics,
  TopCourse,
  InstructorRanking,
  SystemHealthMetrics,
  GeographicData
} from '@/types/analytics';
import { format, subDays, subWeeks, subMonths } from 'date-fns';

interface AdminReportingDashboardProps {
  // No props needed as admin sees all data
}

export const AdminReportingDashboard: React.FC<AdminReportingDashboardProps> = () => {
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('all');

  useEffect(() => {
    fetchAdminAnalytics();
  }, [timeRange]);

  const fetchAdminAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ timeRange });
      const response = await fetch(`/api/lms/analytics/admin?${params}`);
      const result = await response.json();
      setDashboardData(result.data);
    } catch (error) {
      console.error('Failed to fetch admin analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserGrowthTrendData = () => {
    if (!dashboardData) return [];
    return dashboardData.userGrowth.map(growth => ({
      ...growth,
      date: format(new Date(growth.date), 'MMM dd'),
      churnRate: growth.churnRate * 100 // Convert to percentage
    }));
  };

  const getRevenueAnalyticsData = () => {
    if (!dashboardData) return [];
    return dashboardData.revenueAnalytics.monthlyRevenue.map(revenue => ({
      ...revenue,
      month: format(new Date(revenue.month + '-01'), 'MMM yyyy'),
      netRevenue: revenue.revenue - revenue.refunds
    }));
  };

  const getTopCoursesData = () => {
    if (!dashboardData) return [];
    return dashboardData.coursePerformance.slice(0, 10).map(course => ({
      name: course.title.substring(0, 20) + '...',
      enrollments: course.enrollments,
      revenue: course.revenue,
      rating: course.rating,
      completion: course.completionRate
    }));
  };

  const getInstructorRankingsData = () => {
    if (!dashboardData) return [];
    return dashboardData.instructorRankings.slice(0, 10).map(instructor => ({
      name: instructor.name.split(' ')[0], // First name only for chart
      revenue: instructor.totalRevenue,
      students: instructor.totalStudents,
      rating: instructor.averageRating,
      courses: instructor.coursesCount
    }));
  };

  const getCategoryRevenueData = () => {
    if (!dashboardData) return [];
    return dashboardData.revenueAnalytics.revenueByCategory.map(category => ({
      name: category.category,
      value: category.revenue,
      enrollments: category.enrollments
    }));
  };

  const getGeographicData = () => {
    if (!dashboardData) return [];
    return dashboardData.geographicDistribution.slice(0, 10).map(geo => ({
      country: geo.country,
      users: geo.users,
      revenue: geo.revenue,
      avgRevenue: geo.revenue / geo.users
    }));
  };

  const getSystemHealthData = () => {
    if (!dashboardData) return [];
    const health = dashboardData.systemHealth;
    return [
      { name: 'Uptime', value: health.uptime, color: health.uptime >= 99 ? '#00C49F' : '#FF8042' },
      { name: 'Response Time', value: 100 - (health.averageResponseTime / 10), color: health.averageResponseTime < 500 ? '#00C49F' : '#FF8042' }, // Normalized
      { name: 'Error Rate', value: 100 - health.errorRate, color: health.errorRate < 1 ? '#00C49F' : '#FF8042' },
      { name: 'Server Load', value: 100 - health.serverLoad, color: health.serverLoad < 80 ? '#00C49F' : '#FF8042' }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading admin analytics...</div>
      </div>
    );
  }

  if (!dashboardData || !user || user.role !== 'admin') {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    );
  }

  const overview = dashboardData.overview;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive platform analytics and business intelligence
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Platform Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <MetricCard
          title="Total Users"
          value={overview.totalUsers.toLocaleString()}
          description={`+${overview.monthlyGrowthRate.toFixed(1)}% this month`}
          trend={{
            value: overview.monthlyGrowthRate,
            isPositive: overview.monthlyGrowthRate > 0
          }}
          icon={<Users />}
          className="col-span-1"
        />
        <MetricCard
          title="Active Users"
          value={overview.activeUsers.toLocaleString()}
          description="Monthly active users"
          icon={<UserCheck />}
          className="col-span-1"
        />
        <MetricCard
          title="Total Courses"
          value={overview.totalCourses}
          description="Available courses"
          icon={<BookOpen />}
          className="col-span-1"
        />
        <MetricCard
          title="Total Enrollments"
          value={overview.totalEnrollments.toLocaleString()}
          description="All-time enrollments"
          icon={<Target />}
          className="col-span-1"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${overview.totalRevenue.toLocaleString()}`}
          description="Platform revenue"
          trend={{
            value: 15,
            isPositive: true
          }}
          icon={<DollarSign />}
          className="col-span-1"
        />
        <MetricCard
          title="Completion Rate"
          value={`${overview.completionRate.toFixed(1)}%`}
          description="Average completion"
          icon={<Award />}
          className="col-span-1"
        />
        <MetricCard
          title="Average Rating"
          value={overview.averageRating.toFixed(1)}
          description="Platform rating"
          icon={<Star />}
          className="col-span-1"
        />
        <MetricCard
          title="System Health"
          value={`${dashboardData.systemHealth.uptime.toFixed(1)}%`}
          description="Uptime"
          trend={{
            value: dashboardData.systemHealth.uptime >= 99 ? 0.1 : -2.3,
            isPositive: dashboardData.systemHealth.uptime >= 99
          }}
          icon={<Activity />}
          className="col-span-1"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users & Growth</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="content">Content & Courses</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsLineChart
              title="User Growth Trend"
              description="Platform user growth over time"
              data={getUserGrowthTrendData()}
              xDataKey="date"
              lines={[
                {
                  dataKey: 'totalUsers',
                  stroke: '#0088FE',
                  name: 'Total Users',
                },
                {
                  dataKey: 'newUsers',
                  stroke: '#00C49F',
                  name: 'New Users',
                },
                {
                  dataKey: 'activeUsers',
                  stroke: '#FFBB28',
                  name: 'Active Users',
                }
              ]}
            />

            <AnalyticsAreaChart
              title="Revenue Growth"
              description="Monthly revenue and growth trends"
              data={getRevenueAnalyticsData()}
              xDataKey="month"
              areas={[
                {
                  dataKey: 'revenue',
                  fill: '#0088FE',
                  stroke: '#0088FE',
                  name: 'Total Revenue'
                },
                {
                  dataKey: 'netRevenue',
                  fill: '#00C49F',
                  stroke: '#00C49F',
                  name: 'Net Revenue'
                }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Performing Courses</CardTitle>
                <CardDescription>Courses with highest enrollment and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.coursePerformance.slice(0, 8).map((course, index) => (
                    <div key={course.courseId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-muted-foreground">by {course.instructorName}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">${course.revenue.toLocaleString()}</div>
                        <div className="text-muted-foreground">{course.enrollments} students</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Revenue by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Subscriptions</span>
                    <div className="text-right">
                      <div className="font-medium">
                        ${dashboardData.revenueAnalytics.subscriptionRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((dashboardData.revenueAnalytics.subscriptionRevenue / dashboardData.revenueAnalytics.totalRevenue) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">One-time Purchases</span>
                    <div className="text-right">
                      <div className="font-medium">
                        ${dashboardData.revenueAnalytics.oneTimeRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((dashboardData.revenueAnalytics.oneTimeRevenue / dashboardData.revenueAnalytics.totalRevenue) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Refunds</span>
                    <div className="text-right">
                      <div className="font-medium text-red-600">
                        -${dashboardData.revenueAnalytics.refunds.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((dashboardData.revenueAnalytics.refunds / dashboardData.revenueAnalytics.totalRevenue) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center font-medium">
                    <span>Net Revenue</span>
                    <span>${dashboardData.revenueAnalytics.netRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsLineChart
              title="Daily User Activity"
              description="New users, active users, and churn rate"
              data={getUserGrowthTrendData()}
              xDataKey="date"
              lines={[
                {
                  dataKey: 'newUsers',
                  stroke: '#00C49F',
                  name: 'New Users',
                },
                {
                  dataKey: 'activeUsers',
                  stroke: '#0088FE',
                  name: 'Active Users',
                },
                {
                  dataKey: 'churnRate',
                  stroke: '#FF8042',
                  name: 'Churn Rate %',
                }
              ]}
            />

            <Card>
              <CardHeader>
                <CardTitle>User Engagement Metrics</CardTitle>
                <CardDescription>Key user behavior indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>User Retention (30d)</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Daily Active Users</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Course Completion Rate</span>
                    <span>{overview.completionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={overview.completionRate} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>User Satisfaction</span>
                    <span>{((overview.averageRating / 5) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(overview.averageRating / 5) * 100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsAreaChart
              title="Revenue Trends"
              description="Monthly revenue, subscriptions, and one-time purchases"
              data={getRevenueAnalyticsData()}
              xDataKey="month"
              areas={[
                {
                  dataKey: 'subscriptions',
                  fill: '#0088FE',
                  stroke: '#0088FE',
                  name: 'Subscriptions'
                },
                {
                  dataKey: 'oneTimePurchases',
                  fill: '#00C49F',
                  stroke: '#00C49F',
                  name: 'One-time Purchases'
                }
              ]}
              stacked={true}
            />

            <AnalyticsPieChart
              title="Revenue by Category"
              description="Distribution of revenue across course categories"
              data={getCategoryRevenueData()}
              dataKey="value"
              nameKey="name"
              showLabels={true}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Performance Analysis</CardTitle>
              <CardDescription>Detailed revenue breakdown and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-600">Growth Metrics</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>MRR Growth:</span>
                      <span className="font-medium">+12.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ARR:</span>
                      <span className="font-medium">
                        ${(dashboardData.revenueAnalytics.subscriptionRevenue * 12).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>ARPU:</span>
                      <span className="font-medium">
                        ${(dashboardData.revenueAnalytics.totalRevenue / overview.totalUsers).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-600">Revenue Health</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Refund Rate:</span>
                      <span className="font-medium">
                        {((dashboardData.revenueAnalytics.refunds / dashboardData.revenueAnalytics.totalRevenue) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Revenue:</span>
                      <span className="font-medium">
                        ${dashboardData.revenueAnalytics.netRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenue per Course:</span>
                      <span className="font-medium">
                        ${(dashboardData.revenueAnalytics.totalRevenue / overview.totalCourses).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-purple-600">Forecasts</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Projected MRR:</span>
                      <span className="font-medium">
                        ${(dashboardData.revenueAnalytics.subscriptionRevenue * 1.125).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Q1 Target:</span>
                      <span className="font-medium">
                        ${(dashboardData.revenueAnalytics.totalRevenue * 1.3).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Growth Rate:</span>
                      <span className="font-medium text-green-600">+24%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsBarChart
              title="Top Courses by Revenue"
              description="Highest earning courses on the platform"
              data={getTopCoursesData()}
              xDataKey="name"
              bars={[
                {
                  dataKey: 'revenue',
                  fill: '#0088FE',
                  name: 'Revenue ($)'
                }
              ]}
              horizontal={true}
            />

            <AnalyticsBarChart
              title="Top Instructors by Performance"
              description="Highest earning instructors"
              data={getInstructorRankingsData()}
              xDataKey="name"
              bars={[
                {
                  dataKey: 'revenue',
                  fill: '#00C49F',
                  name: 'Revenue ($)'
                },
                {
                  dataKey: 'students',
                  fill: '#FFBB28',
                  name: 'Total Students'
                }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Performance Rankings</CardTitle>
                <CardDescription>Top courses by multiple metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.coursePerformance.slice(0, 10).map((course, index) => (
                    <div key={course.courseId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={index < 3 ? 'default' : 'secondary'} className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">{course.title.substring(0, 30)}...</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>★ {course.rating.toFixed(1)}</span>
                            <span>•</span>
                            <span>{course.completionRate.toFixed(1)}% completion</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="font-medium">${course.revenue.toLocaleString()}</div>
                        <div className="text-muted-foreground">{course.enrollments} students</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instructor Leaderboard</CardTitle>
                <CardDescription>Top performing instructors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.instructorRankings.slice(0, 10).map((instructor, index) => (
                    <div key={instructor.instructorId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={index < 3 ? 'default' : 'secondary'} className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">{instructor.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>★ {instructor.averageRating.toFixed(1)}</span>
                            <span>•</span>
                            <span>{instructor.coursesCount} courses</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="font-medium">${instructor.totalRevenue.toLocaleString()}</div>
                        <div className="text-muted-foreground">{instructor.totalStudents} students</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsBarChart
              title="Users by Country"
              description="Geographic distribution of users"
              data={getGeographicData()}
              xDataKey="country"
              bars={[
                {
                  dataKey: 'users',
                  fill: '#0088FE',
                  name: 'Total Users'
                }
              ]}
            />

            <AnalyticsBarChart
              title="Revenue by Country"
              description="Geographic revenue distribution"
              data={getGeographicData()}
              xDataKey="country"
              bars={[
                {
                  dataKey: 'revenue',
                  fill: '#00C49F',
                  name: 'Revenue ($)'
                }
              ]}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Geographic Performance</CardTitle>
              <CardDescription>Detailed breakdown by country/region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.geographicDistribution.map((geo, index) => (
                  <div key={geo.country} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{geo.country}</p>
                        <p className="text-sm text-muted-foreground">
                          Top: {geo.topCourses.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{geo.users.toLocaleString()} users</div>
                      <div className="text-muted-foreground">
                        ${(geo.revenue / geo.users).toFixed(0)} avg revenue
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health Overview</CardTitle>
                <CardDescription>
                  Current system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSystemHealthData().map((metric, index) => (
                  <div key={metric.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{metric.name}</span>
                      <span className={metric.value >= 90 ? 'text-green-600' : metric.value >= 70 ? 'text-yellow-600' : 'text-red-600'}>
                        {metric.name === 'Uptime' ? `${dashboardData.systemHealth.uptime.toFixed(2)}%` :
                         metric.name === 'Response Time' ? `${dashboardData.systemHealth.averageResponseTime}ms` :
                         metric.name === 'Error Rate' ? `${dashboardData.systemHealth.errorRate.toFixed(2)}%` :
                         `${dashboardData.systemHealth.serverLoad.toFixed(1)}%`}
                      </span>
                    </div>
                    <Progress 
                      value={metric.value} 
                      className={`h-2 ${metric.value >= 90 ? '' : metric.value >= 70 ? 'bg-yellow-200' : 'bg-red-200'}`}
                    />
                  </div>
                ))}
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(dashboardData.systemHealth.lastUpdated), 'PPp')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Detailed system performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <Database className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                    <div className="text-lg font-bold">{dashboardData.systemHealth.databasePerformance.toFixed(1)}ms</div>
                    <div className="text-xs text-muted-foreground">Database Response</div>
                  </div>
                  
                  <div className="text-center p-3 border rounded-lg">
                    <Zap className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
                    <div className="text-lg font-bold">{dashboardData.systemHealth.cdnPerformance.toFixed(1)}ms</div>
                    <div className="text-xs text-muted-foreground">CDN Response</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">System Load</span>
                    <Badge variant={dashboardData.systemHealth.serverLoad < 70 ? 'default' : dashboardData.systemHealth.serverLoad < 90 ? 'secondary' : 'destructive'}>
                      {dashboardData.systemHealth.serverLoad.toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Error Rate</span>
                    <Badge variant={dashboardData.systemHealth.errorRate < 1 ? 'default' : dashboardData.systemHealth.errorRate < 5 ? 'secondary' : 'destructive'}>
                      {dashboardData.systemHealth.errorRate.toFixed(2)}%
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Response Time</span>
                    <Badge variant={dashboardData.systemHealth.averageResponseTime < 500 ? 'default' : dashboardData.systemHealth.averageResponseTime < 1000 ? 'secondary' : 'destructive'}>
                      {dashboardData.systemHealth.averageResponseTime}ms
                    </Badge>
                  </div>
                </div>

                {(dashboardData.systemHealth.errorRate > 2 || dashboardData.systemHealth.serverLoad > 80) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm font-medium text-red-800">System Alert</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      System performance requires attention. Check server resources and error logs.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};