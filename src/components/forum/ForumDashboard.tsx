'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/components/UserProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  Search,
  Plus,
  Pin,
  Lock,
  CheckCircle,
  Eye,
  MessageCircle,
  ThumbsUp,
  Tag,
  Star,
  Award,
  Activity,
  Calendar,
  Filter,
  BookOpen,
  HelpCircle,
  Announcement
} from 'lucide-react';
import { ForumDashboard, ForumCategory, ForumTopic, ForumStats, ForumUser } from '@/types/forum';
import { format, formatDistanceToNow } from 'date-fns';

interface ForumDashboardProps {
  courseId?: string; // If provided, show course-specific forum
}

export const ForumDashboardComponent: React.FC<ForumDashboardProps> = ({ courseId }) => {
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState<ForumDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchForumData();
  }, [courseId]);

  const fetchForumData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (courseId) {
        params.append('courseId', courseId);
      }
      
      const response = await fetch(`/api/lms/forum/dashboard?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
  };

  const getCategoryIcon = (category: ForumCategory) => {
    const iconMap: Record<string, React.ReactNode> = {
      'general': <MessageSquare className="h-5 w-5" />,
      'qa': <HelpCircle className="h-5 w-5" />,
      'announcements': <Announcement className="h-5 w-5" />,
      'course': <BookOpen className="h-5 w-5" />,
      default: <MessageSquare className="h-5 w-5" />
    };
    
    return iconMap[category.icon] || iconMap.default;
  };

  const getTopicStatusIcon = (topic: ForumTopic) => {
    if (topic.isPinned) return <Pin className="h-4 w-4 text-blue-500" />;
    if (topic.isLocked) return <Lock className="h-4 w-4 text-gray-500" />;
    if (topic.isSolved) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return null;
  };

  const getUserTitle = (userRole: string, reputation: number): string => {
    if (userRole === 'admin') return 'Administrator';
    if (userRole === 'instructor') return 'Instructor';
    if (userRole === 'moderator') return 'Moderator';
    
    if (reputation >= 1000) return 'Expert Contributor';
    if (reputation >= 500) return 'Active Member';
    if (reputation >= 100) return 'Regular Member';
    return 'New Member';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Loading forum...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Failed to load forum data</p>
        </CardContent>
      </Card>
    );
  }

  const { stats, recentTopics, categories, userActivity, trendingTags } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {courseId ? 'Course Discussion' : 'Community Forum'}
          </h1>
          <p className="text-muted-foreground">
            {courseId 
              ? 'Ask questions and discuss course content with fellow students'
              : 'Connect, learn, and share knowledge with the community'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          {user && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Topic
            </Button>
          )}
        </div>
      </div>

      {/* Forum Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalTopics.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Topics</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.solutionRate)}%</p>
                <p className="text-sm text-muted-foreground">Solved Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="recent">Recent Topics</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          {!courseId && <TabsTrigger value="activity">Activity</TabsTrigger>}
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/forum/category/${category.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${category.color}15`, color: category.color }}
                        >
                          {getCategoryIcon(category)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-muted-foreground">
                          {category.topicsCount} topics
                        </span>
                        <span className="text-muted-foreground">
                          {category.postsCount} posts
                        </span>
                      </div>
                      
                      {category.lastActivity && (
                        <div className="text-right">
                          <p className="font-medium text-xs">
                            {category.lastActivity.topicTitle.substring(0, 30)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            by {category.lastActivity.userName} • {formatDistanceToNow(new Date(category.lastActivity.createdAt))} ago
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="space-y-3">
            {recentTopics.map((topic) => (
              <Link key={topic.id} href={`/forum/topic/${topic.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getTopicStatusIcon(topic)}
                          <h3 className="font-medium hover:text-blue-600">
                            {topic.title}
                          </h3>
                          {topic.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={topic.author.avatar} />
                              <AvatarFallback className="text-xs">
                                {topic.author.name.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{topic.author.name}</span>
                          </div>
                          
                          <span>{formatDistanceToNow(new Date(topic.createdAt))} ago</span>
                          
                          <Badge variant="outline" className="text-xs">
                            {topic.category.name}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{topic.viewsCount}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{topic.repliesCount}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{topic.votesScore}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trending Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Trending Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map((tag, index) => (
                    <Badge 
                      key={tag} 
                      variant={index < 3 ? 'default' : 'secondary'}
                      className="cursor-pointer hover:shadow-sm"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Most Active Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Most Active Contributors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.mostActiveUsers.slice(0, 5).map((user, index) => (
                    <div key={user.id} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 flex-1">
                        <Badge variant={index === 0 ? 'default' : 'secondary'}>
                          #{index + 1}
                        </Badge>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xs">
                            {user.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {getUserTitle(user.role, user.reputation)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm">
                        <p className="font-medium">{user.reputation}</p>
                        <p className="text-xs text-muted-foreground">reputation</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Tags</CardTitle>
              <CardDescription>Most discussed topics this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.popularTags.slice(0, 9).map((tagData, index) => (
                  <div 
                    key={tagData.tag}
                    className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <Badge variant={index < 3 ? 'default' : 'outline'}>
                        #{tagData.tag}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {tagData.count} topics
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {!courseId && (
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {activity.user.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user.name}</span>
                          {' '}{activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.createdAt))} ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};