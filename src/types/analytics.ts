// Analytics and Reporting Data Models

export interface StudentProgress {
  id: string;
  userId: string;
  courseId: string;
  enrollmentDate: string;
  lastAccessDate: string;
  totalTimeSpent: number; // in minutes
  progressPercentage: number;
  lessonsCompleted: number;
  totalLessons: number;
  quizzesAttempted: number;
  quizzesPassed: number;
  averageQuizScore: number;
  isCompleted: boolean;
  completionDate?: string;
  certificateIssued: boolean;
  engagementScore: number; // 0-100 based on activity
}

export interface CourseAnalytics {
  courseId: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  totalEnrollments: number;
  activeStudents: number;
  completionRate: number;
  averageRating: number;
  totalRatings: number;
  averageTimeToComplete: number; // in days
  revenue: number;
  enrollmentTrend: EnrollmentTrendData[];
  ratingDistribution: RatingDistribution;
  topPerformingLessons: LessonPerformance[];
  strugglingAreas: StrugglePoint[];
  lastUpdated: string;
}

export interface EnrollmentTrendData {
  date: string;
  enrollments: number;
  completions: number;
  dropouts: number;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface LessonPerformance {
  lessonId: string;
  lessonTitle: string;
  completionRate: number;
  averageTimeSpent: number;
  studentFeedback: number;
}

export interface StrugglePoint {
  lessonId: string;
  lessonTitle: string;
  dropoutRate: number;
  averageAttempts: number;
  commonIssues: string[];
}

export interface InstructorMetrics {
  instructorId: string;
  instructorName: string;
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageCourseRating: number;
  studentCompletionRate: number;
  responseTime: number; // average hours to respond to student queries
  engagementScore: number;
  courses: CourseAnalytics[];
  monthlyStats: MonthlyInstructorStats[];
}

export interface MonthlyInstructorStats {
  month: string;
  enrollments: number;
  revenue: number;
  completions: number;
  averageRating: number;
}

export interface AdminDashboardData {
  overview: PlatformOverview;
  userGrowth: UserGrowthData[];
  revenueAnalytics: RevenueAnalytics;
  coursePerformance: TopCourse[];
  instructorRankings: InstructorRanking[];
  systemHealth: SystemHealthMetrics;
  geographicDistribution: GeographicData[];
}

export interface PlatformOverview {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  totalEnrollments: number;
  activeUsers: number;
  completionRate: number;
  averageRating: number;
  monthlyGrowthRate: number;
}

export interface UserGrowthData {
  date: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  churnRate: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: MonthlyRevenue[];
  revenueByCategory: CategoryRevenue[];
  subscriptionRevenue: number;
  oneTimeRevenue: number;
  refunds: number;
  netRevenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  subscriptions: number;
  oneTimePurchases: number;
  refunds: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  enrollments: number;
  averagePrice: number;
}

export interface TopCourse {
  courseId: string;
  title: string;
  instructorName: string;
  enrollments: number;
  revenue: number;
  rating: number;
  completionRate: number;
}

export interface InstructorRanking {
  instructorId: string;
  name: string;
  totalRevenue: number;
  totalStudents: number;
  averageRating: number;
  coursesCount: number;
  rank: number;
}

export interface SystemHealthMetrics {
  uptime: number;
  averageResponseTime: number;
  errorRate: number;
  serverLoad: number;
  databasePerformance: number;
  cdnPerformance: number;
  lastUpdated: string;
}

export interface GeographicData {
  country: string;
  users: number;
  revenue: number;
  topCourses: string[];
}

export interface AnalyticsFilter {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  courseIds?: string[];
  instructorIds?: string[];
  userIds?: string[];
  categories?: string[];
  status?: 'active' | 'completed' | 'dropped' | 'all';
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeSummary: boolean;
  includeDetails: boolean;
  emailRecipients?: string[];
  scheduledDelivery?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
  };
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface QuizAnalytics {
  quizId: string;
  quizTitle: string;
  totalAttempts: number;
  passRate: number;
  averageScore: number;
  averageTimeSpent: number;
  difficultyRating: number;
  questionAnalytics: QuestionAnalytics[];
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  correctAnswerRate: number;
  averageTimeSpent: number;
  commonWrongAnswers: string[];
  difficultyIndex: number;
}

export interface LearningPath {
  pathId: string;
  pathName: string;
  enrolledStudents: number;
  averageCompletionTime: number;
  completionRate: number;
  dropOffPoints: DropOffPoint[];
}

export interface DropOffPoint {
  stepId: string;
  stepName: string;
  dropOffRate: number;
  averageTimeBeforeDropOff: number;
}

export interface EngagementMetrics {
  userId: string;
  dailyActiveTime: number;
  weeklyActiveTime: number;
  monthlyActiveTime: number;
  sessionCount: number;
  averageSessionDuration: number;
  lastActiveDate: string;
  engagementTrend: 'increasing' | 'stable' | 'decreasing';
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'student' | 'course' | 'instructor' | 'admin';
  filters: AnalyticsFilter;
  sections: ReportSection[];
  schedule?: ExportOptions['scheduledDelivery'];
  recipients: string[];
  isActive: boolean;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'summary' | 'text';
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  dataSource: string;
  configuration: any;
}