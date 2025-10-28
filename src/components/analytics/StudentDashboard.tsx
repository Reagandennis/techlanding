'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Award, 
  Clock, 
  Target,
  Calendar,
  Download,
  RefreshCw,
  Play,
  CheckCircle,
  Star,
  Trophy,
  Flame,
  BookMarked,
  Brain,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { StudentMetrics } from '@/lib/analytics';

interface StudentDashboardProps {
  studentId: string;
  initialData?: StudentMetrics;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

export default function StudentDashboard({ studentId, initialData }: StudentDashboardProps) {
  const [data, setData] = useState<StudentMetrics | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/student/${studentId}`);
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
  }, [studentId]);

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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

  const MetricCard = ({ title, value, change, icon: Icon, color = "blue", subValue }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subValue && (
          <p className="text-xs text-gray-600 mt-1">{subValue}</p>
        )}
        {change && (
          <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}% from last week
          </p>
        )}
      </CardContent>
    </Card>
  );

  const completionRate = data.coursesEnrolled > 0 
    ? (data.coursesCompleted / data.coursesEnrolled) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Learning Dashboard</h1>
          <p className="text-gray-600">Track your progress and achievements</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Courses Enrolled"
              value={data.coursesEnrolled}
              icon={BookOpen}
              color="blue"
              subValue={`${data.coursesCompleted} completed`}
            />
            <MetricCard
              title="Learning Streak"
              value={`${data.currentStreak} days`}
              icon={Flame}
              color="orange"
            />
            <MetricCard
              title="Time Spent"
              value={formatTime(data.totalWatchTime)}
              icon={Clock}
              color="green"
              subValue="Total learning time"
            />
            <MetricCard
              title="Certificates"
              value={data.certificatesEarned}
              icon={Award}
              color="purple"
            />
          </div>

          {/* Progress Overview */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Completion Rate</CardTitle>
                <CardDescription>Your overall learning progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-blue-600">
                    {completionRate.toFixed(1)}%
                  </span>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {data.coursesCompleted} of {data.coursesEnrolled} courses
                    </div>
                  </div>
                </div>
                <Progress value={completionRate} className="h-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quiz Performance</CardTitle>
                <CardDescription>Your average quiz score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-green-600">
                    {data.averageScore.toFixed(1)}%
                  </span>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
                <Progress value={data.averageScore} className="h-3" />
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Learning Activity</CardTitle>
              <CardDescription>Your learning progress over the last 7 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [value, 'Lessons Completed']}
                    labelFormatter={(label) => `Week ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completedLessons" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>Your latest accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.achievements.slice(0, 5).map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-600">
                        +{achievement.points} pts
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(achievement.earnedAt), 'MMM dd')}
                      </div>
                    </div>
                  </div>
                ))}
                
                {data.achievements.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No achievements yet. Keep learning to unlock rewards!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Enrolled Courses"
              value={data.coursesEnrolled}
              icon={BookOpen}
              color="blue"
            />
            <MetricCard
              title="Completed Courses"
              value={data.coursesCompleted}
              icon={CheckCircle}
              color="green"
            />
            <MetricCard
              title="Completion Rate"
              value={`${completionRate.toFixed(1)}%`}
              icon={Target}
              color="purple"
            />
          </div>

          {/* Learning Path Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Path Progress</CardTitle>
              <CardDescription>Your journey through different skill areas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={[
                  { skill: 'Frontend', completed: 80, total: 100 },
                  { skill: 'Backend', completed: 60, total: 100 },
                  { skill: 'Database', completed: 70, total: 100 },
                  { skill: 'DevOps', completed: 40, total: 100 },
                  { skill: 'Testing', completed: 55, total: 100 },
                  { skill: 'Security', completed: 35, total: 100 }
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Progress"
                    dataKey="completed"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Study Time Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Study Time Distribution</CardTitle>
              <CardDescription>How you spend your learning time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Video Lessons', value: 60, color: '#8884d8' },
                      { name: 'Quizzes', value: 20, color: '#82ca9d' },
                      { name: 'Assignments', value: 15, color: '#ffc658' },
                      { name: 'Reading', value: 5, color: '#ff7300' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[0, 1, 2, 3].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Time Spent']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Achievements"
              value={data.achievements.length}
              icon={Trophy}
              color="yellow"
            />
            <MetricCard
              title="Current Streak"
              value={`${data.currentStreak} days`}
              icon={Flame}
              color="orange"
            />
            <MetricCard
              title="Certificates Earned"
              value={data.certificatesEarned}
              icon={Award}
              color="purple"
            />
            <MetricCard
              title="Total Points"
              value={data.achievements.reduce((sum, achievement) => sum + achievement.points, 0)}
              icon={Star}
              color="blue"
            />
          </div>

          {/* Achievement Categories */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(
              data.achievements.reduce((acc, achievement) => {
                acc[achievement.type] = (acc[achievement.type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([type, count]) => (
              <Card key={type}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <p className="text-sm text-gray-600">achievements earned</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* All Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>All Achievements</CardTitle>
              <CardDescription>Your complete achievement history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary">
                          {achievement.type.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-sm text-blue-600 font-medium">
                          +{achievement.points} points
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {format(new Date(achievement.earnedAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(achievement.earnedAt), 'HH:mm')}
                      </div>
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
              title="Average Quiz Score"
              value={`${data.averageScore.toFixed(1)}%`}
              icon={Target}
              color="green"
            />
            <MetricCard
              title="Total Learning Time"
              value={formatTime(data.totalWatchTime)}
              icon={Clock}
              color="blue"
            />
            <MetricCard
              title="Daily Average"
              value={`${Math.round(data.totalWatchTime / 86400)} min`}
              icon={Calendar}
              color="purple"
            />
          </div>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Performance Trend</CardTitle>
              <CardDescription>Your quiz scores over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.weeklyProgress.map((week, index) => ({
                  ...week,
                  quizScore: 75 + Math.random() * 20 // Simulated quiz scores
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Quiz Score']} />
                  <Line 
                    type="monotone" 
                    dataKey="quizScore" 
                    stroke="#82ca9d" 
                    strokeWidth={3}
                    dot={{ fill: '#82ca9d', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Learning Consistency */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Consistency</CardTitle>
              <CardDescription>Your daily learning habits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Consistency Score</span>
                    <span className="text-sm text-gray-600">85%</span>
                  </div>
                  <Progress value={85} className="h-3" />
                </div>
                
                <div className="grid grid-cols-7 gap-2 mt-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="text-center">
                      <div className="text-xs text-gray-600 mb-1">{day}</div>
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                          index < 5 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {index < 5 ? '✓' : '○'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Courses</CardTitle>
              <CardDescription>Based on your learning history and interests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.learningPath.map((course, index) => (
                  <div key={course.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {course.thumbnail ? (
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <BookOpen className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{course.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline">{course.level}</Badge>
                        <span className="text-sm text-gray-600">Recommended for you</span>
                      </div>
                    </div>
                    <Button size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Start Learning
                    </Button>
                  </div>
                ))}
                
                {data.learningPath.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Complete more courses to get personalized recommendations!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Learning Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Suggested Learning Goals</CardTitle>
              <CardDescription>Personalized goals to enhance your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <h4 className="font-medium">Complete 2 courses this month</h4>
                    <p className="text-sm text-gray-600">You're 1 course away from your goal!</p>
                  </div>
                  <div className="text-blue-600 font-semibold">50% complete</div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Flame className="w-5 h-5 text-orange-600" />
                  <div className="flex-1">
                    <h4 className="font-medium">Maintain 7-day learning streak</h4>
                    <p className="text-sm text-gray-600">You're on a {data.currentStreak} day streak!</p>
                  </div>
                  <div className="text-green-600 font-semibold">
                    {data.currentStreak >= 7 ? 'Achieved!' : `${data.currentStreak}/7 days`}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <div className="flex-1">
                    <h4 className="font-medium">Improve quiz average to 90%</h4>
                    <p className="text-sm text-gray-600">Current average: {data.averageScore.toFixed(1)}%</p>
                  </div>
                  <div className="text-purple-600 font-semibold">
                    {Math.round((data.averageScore / 90) * 100)}% complete
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Personalized Study Tips</CardTitle>
              <CardDescription>AI-powered suggestions to improve your learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookMarked className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Focus on consistency</h4>
                    <p className="text-sm text-gray-600">
                      Try studying for 30 minutes daily instead of long sessions. This improves retention.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Practice active recall</h4>
                    <p className="text-sm text-gray-600">
                      After watching lessons, try to explain the concepts without looking at notes.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Set specific goals</h4>
                    <p className="text-sm text-gray-600">
                      Break down large topics into smaller, achievable milestones for better progress tracking.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}