// Discussion Forums and Q&A System Data Models

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  color: string;
  icon: string;
  isPublic: boolean;
  courseId?: string; // null for global forums, courseId for course-specific
  createdAt: string;
  updatedAt: string;
  topicsCount: number;
  postsCount: number;
  lastActivity?: {
    topicId: string;
    topicTitle: string;
    userId: string;
    userName: string;
    createdAt: string;
  };
}

export interface ForumTopic {
  id: string;
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  category: ForumCategory;
  authorId: string;
  author: ForumUser;
  courseId?: string;
  lessonId?: string;
  isPinned: boolean;
  isLocked: boolean;
  isSolved: boolean;
  isAnnouncement: boolean;
  tags: string[];
  viewsCount: number;
  repliesCount: number;
  votesScore: number;
  createdAt: string;
  updatedAt: string;
  lastReplyAt?: string;
  lastReplyBy?: {
    userId: string;
    userName: string;
  };
  attachments?: ForumAttachment[];
}

export interface ForumPost {
  id: string;
  content: string;
  topicId: string;
  topic?: ForumTopic;
  authorId: string;
  author: ForumUser;
  parentId?: string; // For nested replies
  isAcceptedAnswer: boolean;
  isEdited: boolean;
  editedAt?: string;
  editReason?: string;
  votesScore: number;
  createdAt: string;
  updatedAt: string;
  attachments?: ForumAttachment[];
  mentions?: string[]; // User IDs mentioned in the post
  replies?: ForumPost[];
  depth: number; // Nesting level for threaded discussions
}

export interface ForumUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin' | 'moderator';
  reputation: number;
  badges: ForumBadge[];
  postsCount: number;
  topicsCount: number;
  solutionsCount: number;
  joinedAt: string;
  lastActiveAt: string;
  isOnline: boolean;
  title?: string; // Custom title based on reputation
  signature?: string;
}

export interface ForumVote {
  id: string;
  userId: string;
  targetId: string; // Topic or Post ID
  targetType: 'topic' | 'post';
  voteType: 'upvote' | 'downvote';
  createdAt: string;
}

export interface ForumBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: 'achievement' | 'role' | 'special';
  requirements?: {
    postsCount?: number;
    solutionsCount?: number;
    reputation?: number;
    daysActive?: number;
    specialAction?: string;
  };
  earnedAt?: string;
}

export interface ForumAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface ForumNotification {
  id: string;
  userId: string;
  type: 'reply' | 'mention' | 'vote' | 'solution' | 'topic_update' | 'moderation';
  title: string;
  message: string;
  topicId?: string;
  postId?: string;
  fromUserId?: string;
  fromUser?: ForumUser;
  isRead: boolean;
  createdAt: string;
}

export interface ForumStats {
  totalTopics: number;
  totalPosts: number;
  totalUsers: number;
  activeUsers: number;
  topicsToday: number;
  postsToday: number;
  averageResponseTime: number; // in hours
  solutionRate: number; // percentage of topics marked as solved
  mostActiveUsers: ForumUser[];
  popularTags: { tag: string; count: number }[];
}

export interface ForumModerationAction {
  id: string;
  actionType: 'delete' | 'edit' | 'lock' | 'pin' | 'move' | 'warn' | 'ban';
  targetType: 'topic' | 'post' | 'user';
  targetId: string;
  moderatorId: string;
  moderator: ForumUser;
  reason: string;
  details?: string;
  createdAt: string;
  expiresAt?: string; // for temporary actions
}

export interface ForumReport {
  id: string;
  reporterId: string;
  reporter: ForumUser;
  targetType: 'topic' | 'post' | 'user';
  targetId: string;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'off_topic' | 'copyright' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: string;
  resolution?: string;
  createdAt: string;
}

export interface ForumSearch {
  query: string;
  categoryId?: string;
  authorId?: string;
  tags?: string[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  sortBy: 'relevance' | 'newest' | 'oldest' | 'most_replies' | 'most_votes';
  filterBy?: {
    hasReplies?: boolean;
    isSolved?: boolean;
    isPinned?: boolean;
    isAnnouncement?: boolean;
  };
}

export interface ForumSearchResult {
  topics: ForumTopic[];
  posts: ForumPost[];
  users: ForumUser[];
  totalResults: number;
  searchTime: number;
  suggestions?: string[];
}

export interface ForumSubscription {
  id: string;
  userId: string;
  targetType: 'category' | 'topic';
  targetId: string;
  notifyOnReply: boolean;
  notifyOnSolution: boolean;
  notifyOnMention: boolean;
  createdAt: string;
}

export interface ForumActivity {
  id: string;
  userId: string;
  user: ForumUser;
  type: 'topic_created' | 'post_created' | 'vote_given' | 'solution_marked' | 'badge_earned';
  description: string;
  metadata?: {
    topicId?: string;
    postId?: string;
    badgeId?: string;
    targetUserId?: string;
  };
  createdAt: string;
}

export interface CourseForumIntegration {
  courseId: string;
  categoryId: string;
  settings: {
    enableQA: boolean;
    allowStudentTopics: boolean;
    requireModeration: boolean;
    autoCreateLessonTopics: boolean;
    enableFileUploads: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
}

export interface ForumDashboard {
  stats: ForumStats;
  recentTopics: ForumTopic[];
  recentPosts: ForumPost[];
  trendingTags: string[];
  userActivity: ForumActivity[];
  notifications: ForumNotification[];
  categories: ForumCategory[];
}

export interface RichTextContent {
  type: 'doc';
  content: RichTextNode[];
}

export interface RichTextNode {
  type: string;
  attrs?: any;
  content?: RichTextNode[];
  marks?: RichTextMark[];
  text?: string;
}

export interface RichTextMark {
  type: string;
  attrs?: any;
}

export interface ForumSettings {
  id: string;
  allowGuestViewing: boolean;
  requireEmailVerification: boolean;
  enableReputation: boolean;
  enableBadges: boolean;
  enableVoting: boolean;
  enableFileUploads: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  moderationMode: 'none' | 'pre_moderation' | 'post_moderation';
  spamProtection: boolean;
  rateLimit: {
    postsPerHour: number;
    topicsPerDay: number;
  };
  reputation: {
    topicCreated: number;
    postCreated: number;
    voteReceived: number;
    solutionAccepted: number;
    solutionMarked: number;
  };
  autoLockTopics: {
    enabled: boolean;
    daysInactive: number;
  };
}

// API Response Types
export interface ForumApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedForumResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Real-time Event Types
export interface ForumRealtimeEvent {
  type: 'topic_created' | 'post_created' | 'vote_updated' | 'user_online' | 'user_offline';
  payload: any;
  timestamp: string;
  roomId?: string; // For topic-specific events
}