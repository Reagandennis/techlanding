'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/components/UserProvider';
import { 
  AnalyticsLineChart, 
  AnalyticsBarChart, 
  AnalyticsPieChart,
  MetricCard,
  ProgressChart
} from './ChartComponents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Target,
  TrendingUp,
  Calendar,
  Star,
  Award,
  Download,
  Filter
} from 'lucide-react';
import { StudentProgress, EngagementMetrics, QuizAnalytics } from '@/types/analytics';
import { format, subDays, subWeeks, subMonths } from 'date-fns';

interface StudentProgressDashboardProps {
  userId?: string;
  courseId?: string;
}

export const StudentProgressDashboard: React.FC<StudentProgressDashboardProps> = ({
  userId,
  courseId
}) => {
  const { user } = useUser();
  const [progressData, setProgressData] = useState<StudentProgress[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementMetrics | null>(null);
  const [quizAnalytics, setQuizAnalytics] = useState<QuizAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchStudentProgress();
    }
  }, [targetUserId, timeRange, selectedCourse]);

  const fetchStudentProgress = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        timeRange,
        ...(selectedCourse !== 'all' && { courseId: selectedCourse }),
      });

      const [progressRes, engagementRes, quizRes] = await Promise.all([
        fetch(`/api/lms/analytics/student/${targetUserId}/progress?${params}`),
        fetch(`/api/lms/analytics/student/${targetUserId}/engagement?${params}`),
        fetch(`/api/lms/analytics/student/${targetUserId}/quizzes?${params}`)
      ]);

      const progress = await progressRes.json();
      const engagement = await engagementRes.json();
      const quizzes = await quizRes.json();

      setProgressData(progress.data || []);
      setEngagementData(engagement.data);
      setQuizAnalytics(quizzes.data || []);
    } catch (error) {
      console.error('Failed to fetch student analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallStats = () => {
    if (!progressData.length) return null;

    const totalCourses = progressData.length;
    const completedCourses = progressData.filter(p => p.isCompleted).length;
    const totalTimeSpent = progressData.reduce((sum, p) => sum + p.totalTimeSpent, 0);
    const averageProgress = progressData.reduce((sum, p) => sum + p.progressPercentage, 0) / totalCourses;
    const totalQuizzesPassed = progressData.reduce((sum, p) => sum + p.quizzesPassed, 0);
    const averageQuizScore = progressData.reduce((sum, p) => sum + (p.averageQuizScore || 0), 0) / totalCourses;

    return {
      totalCourses,
      completedCourses,
      totalTimeSpent,
      averageProgress,
      totalQuizzesPassed,
      averageQuizScore,
      completionRate: (completedCourses / totalCourses) * 100
    };
  };

  const getProgressTrendData = () => {
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    const trendData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayProgress = progressData.filter(p => {
        const lastAccess = new Date(p.lastAccessDate);
        return format(lastAccess, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      trendData.push({
        date: format(date, 'MMM dd'),
        progress: dayProgress.reduce((sum, p) => sum + p.progressPercentage, 0),
        timeSpent: dayProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0) / 60, // Convert to hours
        courses: dayProgress.length
      });
    }

    return trendData;
  };

  const getCompletionData = () => {
    return progressData.map(progress => ({
      name: progress.courseId.substring(0, 20) + '...', // Truncate course name
      completed: progress.lessonsCompleted,
      total: progress.totalLessons,
      color: progress.isCompleted ? '#00C49F' : progress.progressPercentage > 50 ? '#FFBB28' : '#FF8042'
    }));
  };

  const getQuizPerformanceData = () => {
    return quizAnalytics.map(quiz => ({
      name: quiz.quizTitle.substring(0, 15) + '...',
      score: quiz.averageScore,
      timeSpent: quiz.averageTimeSpent,
      attempts: quiz.totalAttempts,
      difficulty: quiz.difficultyRating
    }));
  };

  const getEngagementTrendData = () => {
    if (!engagementData) return [];

    const days = 7;
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      return {
        date: format(date, 'MMM dd'),
        dailyTime: engagementData.dailyActiveTime * (0.8 + Math.random() * 0.4), // Simulated variation
        sessions: Math.floor(Math.random() * 5) + 1
      };
    });
  };

  const stats = calculateOverallStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No course progress data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Learning Progress Analytics</h1>
          <p className="text-muted-foreground">
            Track your learning journey and performance across all courses
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
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Courses"
          value={stats.totalCourses}
          description="Enrolled courses"
          icon={<BookOpen />}
        />
        <MetricCard
          title="Completion Rate"
          value={`${stats.completionRate.toFixed(1)}%`}
          description={`${stats.completedCourses} completed`}
          trend={{
            value: 12,
            isPositive: true
          }}
          icon={<Trophy />}
        />
        <MetricCard
          title="Study Time"
          value={`${Math.round(stats.totalTimeSpent / 60)}h`}
          description="Total hours"
          icon={<Clock />}
        />
        <MetricCard
          title="Quiz Average"
          value={`${stats.averageQuizScore.toFixed(1)}%`}
          description={`${stats.totalQuizzesPassed} passed`}
          trend={{
            value: 8,
            isPositive: true
          }}
          icon={<Target />}
        />
      </div>

      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress">Progress Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="performance">Quiz Performance</TabsTrigger>
          <TabsTrigger value="courses">Course Details</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsLineChart
              title="Learning Progress Trend"
              description="Your daily learning progress over time"
              data={getProgressTrendData()}
              xDataKey="date"
              lines={[
                {
                  dataKey: 'progress',
                  stroke: '#0088FE',
                  name: 'Average Progress %',
                },
                {
                  dataKey: 'timeSpent',
                  stroke: '#00C49F',
                  name: 'Hours Studied',
                }
              ]}
            />

            <ProgressChart
              title="Course Completion Status"
              data={getCompletionData()}
            />
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsLineChart
              title="Daily Engagement"
              description="Your daily learning activity"
              data={getEngagementTrendData()}
              xDataKey="date"
              lines={[
                {
                  dataKey: 'dailyTime',
                  stroke: '#8884d8',
                  name: 'Minutes Studied',
                },
                {
                  dataKey: 'sessions',
                  stroke: '#82ca9d',
                  name: 'Study Sessions',
                }
              ]}
            />

            <Card>
              <CardHeader>
                <CardTitle>Engagement Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Weekly Active Time</span>
                  <Badge variant="secondary">
                    {engagementData ? `${Math.round(engagementData.weeklyActiveTime / 60)}h` : '0h'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Session Duration</span>
                  <Badge variant="secondary">
                    {engagementData ? `${Math.round(engagementData.averageSessionDuration)}min` : '0min'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Engagement Trend</span>
                  <Badge 
                    variant={engagementData?.engagementTrend === 'increasing' ? 'default' : 'secondary'}
                  >
                    {engagementData?.engagementTrend || 'stable'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsBarChart
              title="Quiz Performance"
              description="Your quiz scores across different courses"
              data={getQuizPerformanceData()}
              xDataKey="name"
              bars={[
                {
                  dataKey: 'score',
                  fill: '#0088FE',
                  name: 'Score %'
                }
              ]}
            />

            <AnalyticsBarChart
              title="Quiz Difficulty vs Performance"
              data={getQuizPerformanceData()}
              xDataKey="name"
              bars={[
                {
                  dataKey: 'score',
                  fill: '#00C49F',
                  name: 'Your Score %'
                },
                {
                  dataKey: 'difficulty',
                  fill: '#FF8042',
                  name: 'Difficulty Rating'
                }
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Progress Details</CardTitle>
              <CardDescription>
                Detailed breakdown of your progress in each course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.map((progress) => (
                  <div key={progress.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{progress.courseId}</h3>
                        <p className="text-sm text-muted-foreground">
                          Enrolled: {format(new Date(progress.enrollmentDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Badge 
                        variant={progress.isCompleted ? 'default' : 'secondary'}
                      >
                        {progress.isCompleted ? 'Completed' : `${Math.round(progress.progressPercentage)}%`}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Lessons:</span>
                        <div className="font-medium">
                          {progress.lessonsCompleted}/{progress.totalLessons}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time Spent:</span>
                        <div className="font-medium">{Math.round(progress.totalTimeSpent / 60)}h</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quizzes:</span>
                        <div className="font-medium">
                          {progress.quizzesPassed}/{progress.quizzesAttempted}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quiz Avg:</span>
                        <div className="font-medium">{progress.averageQuizScore.toFixed(1)}%</div>
                      </div>
                    </div>
                    
                    {progress.isCompleted && progress.certificateIssued && (
                      <div className="mt-3 flex items-center text-green-600">
                        <Award className="h-4 w-4 mr-1" />
                        <span className="text-sm">Certificate Earned</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};