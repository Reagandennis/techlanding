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
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Star,
  Clock,
  Target,
  Award,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  Search,
  BookOpen
} from 'lucide-react';
import { CourseAnalytics, EnrollmentTrendData, LessonPerformance, StrugglePoint } from '@/types/analytics';
import { format, subDays, subWeeks, subMonths } from 'date-fns';

interface CoursePerformanceDashboardProps {
  courseId?: string;
  instructorId?: string;
}

export const CoursePerformanceDashboard: React.FC<CoursePerformanceDashboardProps> = ({
  courseId,
  instructorId
}) => {
  const { user } = useUser();
  const [coursesData, setCoursesData] = useState<CourseAnalytics[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>(courseId || 'all');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [searchTerm, setSearchTerm] = useState('');

  const targetInstructorId = instructorId || user?.id;

  useEffect(() => {
    if (targetInstructorId) {
      fetchCourseAnalytics();
    }
  }, [targetInstructorId, timeRange, selectedCourse]);

  const fetchCourseAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        timeRange,
        ...(selectedCourse !== 'all' && { courseId: selectedCourse }),
        ...(targetInstructorId && { instructorId: targetInstructorId }),
      });

      const response = await fetch(`/api/lms/analytics/courses?${params}`);
      const result = await response.json();
      setCoursesData(result.data || []);
    } catch (error) {
      console.error('Failed to fetch course analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = coursesData.filter(course =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCourseData = selectedCourse !== 'all' 
    ? coursesData.find(c => c.courseId === selectedCourse)
    : null;

  const calculateOverallStats = () => {
    if (!coursesData.length) return null;

    const totalEnrollments = coursesData.reduce((sum, c) => sum + c.totalEnrollments, 0);
    const totalRevenue = coursesData.reduce((sum, c) => sum + c.revenue, 0);
    const averageRating = coursesData.reduce((sum, c) => sum + c.averageRating, 0) / coursesData.length;
    const averageCompletion = coursesData.reduce((sum, c) => sum + c.completionRate, 0) / coursesData.length;

    return {
      totalCourses: coursesData.length,
      totalEnrollments,
      totalRevenue,
      averageRating,
      averageCompletion
    };
  };

  const getEnrollmentTrendData = () => {
    if (!selectedCourseData) return [];
    return selectedCourseData.enrollmentTrend.map(trend => ({
      ...trend,
      date: format(new Date(trend.date), 'MMM dd')
    }));
  };

  const getRatingDistributionData = () => {
    if (!selectedCourseData) return [];
    
    const distribution = selectedCourseData.ratingDistribution;
    return [
      { name: '5 Stars', value: distribution[5], count: distribution[5] },
      { name: '4 Stars', value: distribution[4], count: distribution[4] },
      { name: '3 Stars', value: distribution[3], count: distribution[3] },
      { name: '2 Stars', value: distribution[2], count: distribution[2] },
      { name: '1 Star', value: distribution[1], count: distribution[1] },
    ];
  };

  const getLessonPerformanceData = () => {
    if (!selectedCourseData) return [];
    return selectedCourseData.topPerformingLessons.map(lesson => ({
      name: lesson.lessonTitle.substring(0, 20) + '...',
      completion: lesson.completionRate,
      timeSpent: lesson.averageTimeSpent,
      feedback: lesson.studentFeedback
    }));
  };

  const getStrugglePointsData = () => {
    if (!selectedCourseData) return [];
    return selectedCourseData.strugglingAreas.map(area => ({
      name: area.lessonTitle.substring(0, 20) + '...',
      dropoutRate: area.dropoutRate,
      attempts: area.averageAttempts,
      issues: area.commonIssues.length
    }));
  };

  const getCourseComparisonData = () => {
    return filteredCourses.slice(0, 10).map(course => ({
      name: course.courseName.substring(0, 15) + '...',
      enrollments: course.totalEnrollments,
      revenue: course.revenue,
      rating: course.averageRating,
      completion: course.completionRate
    }));
  };

  const stats = calculateOverallStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading course analytics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No course analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Course Performance Analytics</h1>
          <p className="text-muted-foreground">
            Monitor course performance, student engagement, and revenue metrics
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-3 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {coursesData.map((course) => (
                <SelectItem key={course.courseId} value={course.courseId}>
                  {course.courseName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
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
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Courses"
          value={stats.totalCourses}
          description="Active courses"
          icon={<BookOpen />}
        />
        <MetricCard
          title="Total Enrollments"
          value={stats.totalEnrollments.toLocaleString()}
          description="All-time enrollments"
          trend={{
            value: 15,
            isPositive: true
          }}
          icon={<Users />}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          description="Course earnings"
          trend={{
            value: 23,
            isPositive: true
          }}
          icon={<DollarSign />}
        />
        <MetricCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          description="Course ratings"
          trend={{
            value: 3,
            isPositive: true
          }}
          icon={<Star />}
        />
        <MetricCard
          title="Completion Rate"
          value={`${stats.averageCompletion.toFixed(1)}%`}
          description="Average completion"
          trend={{
            value: 8,
            isPositive: true
          }}
          icon={<Target />}
        />
      </div>

      <Tabs defaultValue={selectedCourse !== 'all' ? 'course-detail' : 'overview'} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Courses Overview</TabsTrigger>
          {selectedCourse !== 'all' && (
            <TabsTrigger value="course-detail">Course Details</TabsTrigger>
          )}
          <TabsTrigger value="comparison">Course Comparison</TabsTrigger>
          <TabsTrigger value="insights">Insights & Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsBarChart
              title="Course Performance Metrics"
              description="Enrollments and completion rates by course"
              data={getCourseComparisonData()}
              xDataKey="name"
              bars={[
                {
                  dataKey: 'enrollments',
                  fill: '#0088FE',
                  name: 'Enrollments'
                },
                {
                  dataKey: 'completion',
                  fill: '#00C49F',
                  name: 'Completion %'
                }
              ]}
            />

            <AnalyticsBarChart
              title="Revenue & Ratings by Course"
              data={getCourseComparisonData()}
              xDataKey="name"
              bars={[
                {
                  dataKey: 'revenue',
                  fill: '#FFBB28',
                  name: 'Revenue ($)'
                },
                {
                  dataKey: 'rating',
                  fill: '#FF8042',
                  name: 'Rating (x100)'
                }
              ]}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Course Performance Summary</CardTitle>
              <CardDescription>
                Detailed breakdown of all your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <div key={course.courseId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{course.courseName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last updated: {format(new Date(course.lastUpdated), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          {course.totalEnrollments} students
                        </Badge>
                        <Badge 
                          variant={course.averageRating >= 4 ? 'default' : 'secondary'}
                        >
                          ★ {course.averageRating.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Active Students:</span>
                        <div className="font-medium">{course.activeStudents}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Completion Rate:</span>
                        <div className="font-medium">{course.completionRate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Revenue:</span>
                        <div className="font-medium">${course.revenue.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg. Time:</span>
                        <div className="font-medium">{course.averageTimeToComplete} days</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {selectedCourse !== 'all' && selectedCourseData && (
          <TabsContent value="course-detail" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsLineChart
                title="Enrollment Trend"
                description="Daily enrollments, completions, and dropouts"
                data={getEnrollmentTrendData()}
                xDataKey="date"
                lines={[
                  {
                    dataKey: 'enrollments',
                    stroke: '#0088FE',
                    name: 'New Enrollments',
                  },
                  {
                    dataKey: 'completions',
                    stroke: '#00C49F',
                    name: 'Completions',
                  },
                  {
                    dataKey: 'dropouts',
                    stroke: '#FF8042',
                    name: 'Dropouts',
                  }
                ]}
              />

              <AnalyticsPieChart
                title="Rating Distribution"
                description="Student rating breakdown"
                data={getRatingDistributionData()}
                dataKey="value"
                nameKey="name"
                showLabels={true}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsBarChart
                title="Top Performing Lessons"
                description="Lessons with highest completion rates"
                data={getLessonPerformanceData()}
                xDataKey="name"
                bars={[
                  {
                    dataKey: 'completion',
                    fill: '#00C49F',
                    name: 'Completion Rate %'
                  }
                ]}
              />

              <AnalyticsBarChart
                title="Struggling Areas"
                description="Lessons with highest dropout rates"
                data={getStrugglePointsData()}
                xDataKey="name"
                bars={[
                  {
                    dataKey: 'dropoutRate',
                    fill: '#FF8042',
                    name: 'Dropout Rate %'
                  }
                ]}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Course Insights</CardTitle>
                <CardDescription>
                  Key insights and recommendations for {selectedCourseData.courseName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-600 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Strengths
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedCourseData.averageRating >= 4 && (
                        <li>• High student satisfaction (★ {selectedCourseData.averageRating.toFixed(1)})</li>
                      )}
                      {selectedCourseData.completionRate >= 70 && (
                        <li>• Good completion rate ({selectedCourseData.completionRate.toFixed(1)}%)</li>
                      )}
                      {selectedCourseData.topPerformingLessons.length > 0 && (
                        <li>• Strong performing lessons identified</li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-orange-600 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Areas for Improvement
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedCourseData.completionRate < 70 && (
                        <li>• Low completion rate needs attention</li>
                      )}
                      {selectedCourseData.strugglingAreas.length > 0 && (
                        <li>• {selectedCourseData.strugglingAreas.length} lessons with high dropout</li>
                      )}
                      {selectedCourseData.averageTimeToComplete > 90 && (
                        <li>• Course might be too lengthy</li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="comparison" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsBarChart
              title="Course Revenue Comparison"
              description="Revenue performance across courses"
              data={getCourseComparisonData()}
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
              title="Enrollment vs Completion"
              description="Student enrollment and completion comparison"
              data={getCourseComparisonData()}
              xDataKey="name"
              bars={[
                {
                  dataKey: 'enrollments',
                  fill: '#00C49F',
                  name: 'Enrollments'
                },
                {
                  dataKey: 'completion',
                  fill: '#FFBB28',
                  name: 'Completion %'
                }
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>
                  Key insights from your course data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800">Top Performers</h4>
                  <p className="text-sm text-green-600">
                    {filteredCourses.filter(c => c.completionRate > 80).length} courses have 
                    completion rates above 80%
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">Revenue Leaders</h4>
                  <p className="text-sm text-blue-600">
                    Top course generates ${Math.max(...filteredCourses.map(c => c.revenue)).toLocaleString()} 
                    in revenue
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800">Needs Attention</h4>
                  <p className="text-sm text-orange-600">
                    {filteredCourses.filter(c => c.completionRate < 50).length} courses have 
                    completion rates below 50%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Suggested actions to improve performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Focus on struggling lessons</p>
                    <p className="text-xs text-muted-foreground">
                      Review lessons with high dropout rates and consider restructuring
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Improve course ratings</p>
                    <p className="text-xs text-muted-foreground">
                      Engage with students to understand pain points and gather feedback
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Optimize course length</p>
                    <p className="text-xs text-muted-foreground">
                      Consider breaking down lengthy courses into smaller modules
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};