'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/components/UserProvider';
import { 
  AnalyticsLineChart, 
  AnalyticsBarChart, 
  AnalyticsPieChart,
  AnalyticsAreaChart,
  MetricCard,
  ProgressChart
} from './ChartComponents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Star,
  Clock,
  Target,
  Award,
  AlertTriangle,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Download,
  Search,
  Filter,
  UserCheck,
  UserX,
  Timer,
  BarChart3
} from 'lucide-react';
import { InstructorMetrics, StudentProgress, MonthlyInstructorStats } from '@/types/analytics';
import { format, subDays, subWeeks, subMonths } from 'date-fns';

interface InstructorAnalyticsDashboardProps {
  instructorId?: string;
}

interface StudentAnalytics {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  enrolledCourses: number;
  completedCourses: number;
  averageProgress: number;
  totalTimeSpent: number;
  averageQuizScore: number;
  lastActiveDate: string;
  engagementLevel: 'high' | 'medium' | 'low';
  isStruggling: boolean;
}

export const InstructorAnalyticsDashboard: React.FC<InstructorAnalyticsDashboardProps> = ({
  instructorId
}) => {
  const { user } = useUser();
  const [instructorData, setInstructorData] = useState<InstructorMetrics | null>(null);
  const [studentsData, setStudentsData] = useState<StudentAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, struggling, inactive, high-performers

  const targetInstructorId = instructorId || user?.id;

  useEffect(() => {
    if (targetInstructorId) {
      fetchInstructorAnalytics();
    }
  }, [targetInstructorId, timeRange, selectedCourse]);

  const fetchInstructorAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        timeRange,
        ...(selectedCourse !== 'all' && { courseId: selectedCourse }),
      });

      const [instructorRes, studentsRes] = await Promise.all([
        fetch(`/api/lms/analytics/instructor/${targetInstructorId}?${params}`),
        fetch(`/api/lms/analytics/instructor/${targetInstructorId}/students?${params}`)
      ]);

      const instructorResult = await instructorRes.json();
      const studentsResult = await studentsRes.json();

      setInstructorData(instructorResult.data);
      setStudentsData(studentsResult.data || []);
    } catch (error) {
      console.error('Failed to fetch instructor analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'struggling' && student.isStruggling) ||
                         (filterType === 'inactive' && student.engagementLevel === 'low') ||
                         (filterType === 'high-performers' && student.engagementLevel === 'high');

    return matchesSearch && matchesFilter;
  });

  const getMonthlyStatsData = () => {
    if (!instructorData) return [];
    return instructorData.monthlyStats.map(stat => ({
      ...stat,
      month: format(new Date(stat.month + '-01'), 'MMM yyyy')
    }));
  };

  const getCoursePerformanceData = () => {
    if (!instructorData) return [];
    return instructorData.courses.map(course => ({
      name: course.courseName.substring(0, 20) + '...',
      enrollments: course.totalEnrollments,
      completion: course.completionRate,
      rating: course.averageRating,
      revenue: course.revenue
    }));
  };

  const getStudentEngagementData = () => {
    const engagementCounts = {
      high: studentsData.filter(s => s.engagementLevel === 'high').length,
      medium: studentsData.filter(s => s.engagementLevel === 'medium').length,
      low: studentsData.filter(s => s.engagementLevel === 'low').length,
    };

    return [
      { name: 'High Engagement', value: engagementCounts.high, color: '#00C49F' },
      { name: 'Medium Engagement', value: engagementCounts.medium, color: '#FFBB28' },
      { name: 'Low Engagement', value: engagementCounts.low, color: '#FF8042' },
    ];
  };

  const getStudentProgressData = () => {
    return filteredStudents.slice(0, 10).map(student => ({
      name: student.name.split(' ')[0], // First name only
      progress: student.averageProgress,
      quizScore: student.averageQuizScore,
      timeSpent: student.totalTimeSpent / 60 // Convert to hours
    }));
  };

  const getStrugglingSudents = () => {
    return studentsData.filter(student => student.isStruggling);
  };

  const getTopPerformers = () => {
    return studentsData
      .filter(student => student.engagementLevel === 'high')
      .sort((a, b) => b.averageQuizScore - a.averageQuizScore)
      .slice(0, 5);
  };

  const getInactiveStudents = () => {
    const sevenDaysAgo = subDays(new Date(), 7);
    return studentsData.filter(student => 
      new Date(student.lastActiveDate) < sevenDaysAgo
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading instructor analytics...</div>
      </div>
    );
  }

  if (!instructorData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No instructor analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Instructor Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your students' progress and course performance
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-3 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="struggling">Struggling Students</SelectItem>
              <SelectItem value="inactive">Inactive Students</SelectItem>
              <SelectItem value="high-performers">High Performers</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {instructorData.courses.map((course) => (
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
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Students"
          value={instructorData.totalStudents.toLocaleString()}
          description="Across all courses"
          icon={<Users />}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${instructorData.totalRevenue.toLocaleString()}`}
          description="Course earnings"
          trend={{
            value: 18,
            isPositive: true
          }}
          icon={<DollarSign />}
        />
        <MetricCard
          title="Avg Course Rating"
          value={instructorData.averageCourseRating.toFixed(1)}
          description="Student ratings"
          trend={{
            value: 5,
            isPositive: true
          }}
          icon={<Star />}
        />
        <MetricCard
          title="Completion Rate"
          value={`${instructorData.studentCompletionRate.toFixed(1)}%`}
          description="Student completion"
          icon={<Target />}
        />
        <MetricCard
          title="Response Time"
          value={`${instructorData.responseTime.toFixed(1)}h`}
          description="Avg response time"
          icon={<MessageSquare />}
        />
        <MetricCard
          title="Total Courses"
          value={instructorData.totalCourses}
          description="Active courses"
          icon={<BookOpen />}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Student Management</TabsTrigger>
          <TabsTrigger value="performance">Course Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights & Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsLineChart
              title="Monthly Performance Trend"
              description="Your teaching metrics over time"
              data={getMonthlyStatsData()}
              xDataKey="month"
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
                  dataKey: 'revenue',
                  stroke: '#FFBB28',
                  name: 'Revenue ($)',
                }
              ]}
            />

            <AnalyticsPieChart
              title="Student Engagement Levels"
              description="Distribution of student engagement"
              data={getStudentEngagementData()}
              dataKey="value"
              nameKey="name"
              showLabels={true}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsBarChart
              title="Course Performance Comparison"
              description="Performance metrics across your courses"
              data={getCoursePerformanceData()}
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
              title="Student Progress Overview"
              description="Progress of top 10 students"
              data={getStudentProgressData()}
              xDataKey="name"
              bars={[
                {
                  dataKey: 'progress',
                  fill: '#8884d8',
                  name: 'Progress %'
                },
                {
                  dataKey: 'quizScore',
                  fill: '#82ca9d',
                  name: 'Quiz Score %'
                }
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          {/* Student Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Struggling Students */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Struggling Students ({getStrugglingSudents().length})
                </CardTitle>
                <CardDescription>Students who need immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {getStrugglingSudents().slice(0, 5).map((student) => (
                  <div key={student.id} className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Progress: {student.averageProgress.toFixed(1)}%
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {student.averageQuizScore.toFixed(0)}%
                    </Badge>
                  </div>
                ))}
                {getStrugglingSudents().length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full">
                    View All ({getStrugglingSudents().length - 5} more)
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-green-600">
                  <Award className="h-4 w-4 mr-2" />
                  Top Performers ({getTopPerformers().length})
                </CardTitle>
                <CardDescription>Your highest achieving students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {getTopPerformers().map((student, index) => (
                  <div key={student.id} className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Progress: {student.averageProgress.toFixed(1)}%
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <Badge variant="default" className="text-xs">
                        {student.averageQuizScore.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Inactive Students */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-orange-600">
                  <UserX className="h-4 w-4 mr-2" />
                  Inactive Students ({getInactiveStudents().length})
                </CardTitle>
                <CardDescription>Students inactive for 7+ days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {getInactiveStudents().slice(0, 5).map((student) => (
                  <div key={student.id} className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Last active: {format(new Date(student.lastActiveDate), 'MMM dd')}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {student.averageProgress.toFixed(0)}%
                    </Badge>
                  </div>
                ))}
                {getInactiveStudents().length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full">
                    View All ({getInactiveStudents().length - 5} more)
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Student List */}
          <Card>
            <CardHeader>
              <CardTitle>All Students ({filteredStudents.length})</CardTitle>
              <CardDescription>
                Complete list of students with detailed metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{student.enrolledCourses}</p>
                        <p className="text-muted-foreground">Enrolled</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{student.averageProgress.toFixed(1)}%</p>
                        <p className="text-muted-foreground">Progress</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{student.averageQuizScore.toFixed(1)}%</p>
                        <p className="text-muted-foreground">Quiz Avg</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{Math.round(student.totalTimeSpent / 60)}h</p>
                        <p className="text-muted-foreground">Time Spent</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            student.engagementLevel === 'high' ? 'default' : 
                            student.engagementLevel === 'medium' ? 'secondary' : 'outline'
                          }
                        >
                          {student.engagementLevel}
                        </Badge>
                        {student.isStruggling && (
                          <Badge variant="destructive">Struggling</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsBarChart
              title="Course Revenue Performance"
              description="Revenue generated by each course"
              data={getCoursePerformanceData()}
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
              title="Course Ratings & Enrollment"
              data={getCoursePerformanceData()}
              xDataKey="name"
              bars={[
                {
                  dataKey: 'rating',
                  fill: '#FFBB28',
                  name: 'Rating (x20)'
                },
                {
                  dataKey: 'enrollments',
                  fill: '#00C49F',
                  name: 'Enrollments'
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
                {instructorData.courses.map((course) => (
                  <div key={course.courseId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{course.courseName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Course ID: {course.courseId}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={course.averageRating >= 4 ? 'default' : 'secondary'}
                        >
                          ★ {course.averageRating.toFixed(1)}
                        </Badge>
                        <Badge variant="outline">
                          {course.totalEnrollments} students
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
                        <span className="text-muted-foreground">Avg. Completion Time:</span>
                        <div className="font-medium">{course.averageTimeToComplete} days</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Teaching Insights</CardTitle>
                <CardDescription>
                  Key insights from your teaching data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Strong Performance
                  </h4>
                  <ul className="text-sm text-green-600 space-y-1 mt-2">
                    <li>• {Math.round(instructorData.studentCompletionRate)}% average completion rate</li>
                    <li>• {instructorData.averageCourseRating.toFixed(1)} average course rating</li>
                    <li>• {instructorData.responseTime.toFixed(1)}h average response time</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Areas for Attention
                  </h4>
                  <ul className="text-sm text-orange-600 space-y-1 mt-2">
                    <li>• {getStrugglingSudents().length} students need help</li>
                    <li>• {getInactiveStudents().length} students are inactive</li>
                    <li>• Monitor low-performing courses</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>
                  Suggested next steps to improve student outcomes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Reach out to struggling students</p>
                    <p className="text-xs text-muted-foreground">
                      {getStrugglingSudents().length} students are falling behind and could benefit from personal outreach
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <UserCheck className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Re-engage inactive students</p>
                    <p className="text-xs text-muted-foreground">
                      Send motivational emails to {getInactiveStudents().length} inactive students
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Award className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Recognize top performers</p>
                    <p className="text-xs text-muted-foreground">
                      Acknowledge {getTopPerformers().length} high-achieving students to maintain motivation
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <BarChart3 className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Review course content</p>
                    <p className="text-xs text-muted-foreground">
                      Analyze struggling areas and improve course material
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