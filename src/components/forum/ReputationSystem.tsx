'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/components/UserProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Star,
  Award,
  TrendingUp,
  Users,
  MessageSquare,
  ThumbsUp,
  CheckCircle,
  Crown,
  Shield,
  Zap,
  Target,
  Calendar,
  Activity,
  Gift
} from 'lucide-react';
import { ForumUser, ForumBadge, ForumActivity } from '@/types/forum';
import { format, formatDistanceToNow } from 'date-fns';

interface UserReputation {
  userId: string;
  user: ForumUser;
  totalReputation: number;
  reputationBreakdown: {
    topicsCreated: number;
    postsCreated: number;
    votesReceived: number;
    solutionsAccepted: number;
    solutionsMarked: number;
  };
  badges: ForumBadge[];
  recentActivity: ForumActivity[];
  rank: number;
  nextBadge?: ForumBadge;
  progressToNextBadge: number;
}

interface ReputationSystemProps {
  userId?: string;
  showLeaderboard?: boolean;
}

export const ReputationSystem: React.FC<ReputationSystemProps> = ({
  userId,
  showLeaderboard = true
}) => {
  const { user } = useUser();
  const [userReputation, setUserReputation] = useState<UserReputation | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserReputation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('month');

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchReputationData();
    }
  }, [targetUserId, selectedTimeframe]);

  const fetchReputationData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ timeframe: selectedTimeframe });
      
      const [userRes, leaderboardRes] = await Promise.all([
        fetch(`/api/lms/forum/reputation/${targetUserId}?${params}`),
        showLeaderboard ? fetch(`/api/lms/forum/reputation/leaderboard?${params}`) : Promise.resolve(null)
      ]);

      const userData = await userRes.json();
      if (userData.success) {
        setUserReputation(userData.data);
      }

      if (leaderboardRes) {
        const leaderboardData = await leaderboardRes.json();
        if (leaderboardData.success) {
          setLeaderboard(leaderboardData.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch reputation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badgeType: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      achievement: <Trophy className="h-4 w-4" />,
      role: <Shield className="h-4 w-4" />,
      special: <Crown className="h-4 w-4" />,
    };
    return iconMap[badgeType] || <Award className="h-4 w-4" />;
  };

  const getBadgeColor = (badgeType: string) => {
    const colorMap: Record<string, string> = {
      achievement: 'bg-yellow-500',
      role: 'bg-blue-500',
      special: 'bg-purple-500',
    };
    return colorMap[badgeType] || 'bg-gray-500';
  };

  const getActivityIcon = (activityType: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      topic_created: <MessageSquare className="h-4 w-4" />,
      post_created: <MessageSquare className="h-4 w-4" />,
      vote_given: <ThumbsUp className="h-4 w-4" />,
      solution_marked: <CheckCircle className="h-4 w-4" />,
      badge_earned: <Award className="h-4 w-4" />,
    };
    return iconMap[activityType] || <Activity className="h-4 w-4" />;
  };

  const getRankTitle = (rank: number): string => {
    if (rank === 1) return 'Community Champion';
    if (rank <= 5) return 'Top Contributor';
    if (rank <= 10) return 'Expert Member';
    if (rank <= 25) return 'Active Member';
    if (rank <= 50) return 'Regular Member';
    return 'Community Member';
  };

  const getRankColor = (rank: number): string => {
    if (rank === 1) return 'text-yellow-600';
    if (rank <= 5) return 'text-orange-600';
    if (rank <= 10) return 'text-red-600';
    if (rank <= 25) return 'text-blue-600';
    if (rank <= 50) return 'text-green-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Loading reputation data...</div>
      </div>
    );
  }

  if (!userReputation) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No reputation data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Reputation Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userReputation.user.avatar} />
                <AvatarFallback>
                  {userReputation.user.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{userReputation.user.name}</h2>
                <div className="flex items-center space-x-2">
                  <Badge className={getRankColor(userReputation.rank)}>
                    #{userReputation.rank}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {getRankTitle(userReputation.rank)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-600">
                {userReputation.totalReputation.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">reputation</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Reputation Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userReputation.reputationBreakdown.topicsCreated}
              </div>
              <p className="text-sm text-muted-foreground">Topics</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {userReputation.reputationBreakdown.postsCreated}
              </div>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {userReputation.reputationBreakdown.votesReceived}
              </div>
              <p className="text-sm text-muted-foreground">Upvotes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {userReputation.reputationBreakdown.solutionsAccepted}
              </div>
              <p className="text-sm text-muted-foreground">Solutions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {userReputation.badges.length}
              </div>
              <p className="text-sm text-muted-foreground">Badges</p>
            </div>
          </div>

          {/* Next Badge Progress */}
          {userReputation.nextBadge && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${getBadgeColor(userReputation.nextBadge.type)}`}>
                    {getBadgeIcon(userReputation.nextBadge.type)}
                  </div>
                  <div>
                    <h4 className="font-medium">{userReputation.nextBadge.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {userReputation.nextBadge.description}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">Next Badge</Badge>
              </div>
              <Progress value={userReputation.progressToNextBadge} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round(userReputation.progressToNextBadge)}% progress
              </p>
            </div>
          )}

          {/* Earned Badges */}
          <div>
            <h4 className="font-medium mb-3">Earned Badges ({userReputation.badges.length})</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {userReputation.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center space-x-2 p-3 border rounded-lg bg-white"
                >
                  <div className={`p-2 rounded-lg ${getBadgeColor(badge.type)}`}>
                    {getBadgeIcon(badge.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{badge.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {badge.description}
                    </p>
                    {badge.earnedAt && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(badge.earnedAt), 'MMM yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="leaderboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="badges">All Badges</TabsTrigger>
        </TabsList>

        {showLeaderboard && (
          <TabsContent value="leaderboard" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Community Leaderboard</h3>
              <div className="flex space-x-2">
                {(['week', 'month', 'all'] as const).map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTimeframe(timeframe)}
                  >
                    {timeframe === 'all' ? 'All Time' : 
                     timeframe === 'week' ? 'This Week' : 'This Month'}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {leaderboard.map((userRep, index) => (
                <Card key={userRep.userId} className={`${index < 3 ? 'border-l-4' : ''} ${
                  index === 0 ? 'border-l-yellow-500 bg-yellow-50/50' :
                  index === 1 ? 'border-l-gray-400 bg-gray-50/50' :
                  index === 2 ? 'border-l-orange-500 bg-orange-50/50' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={index < 3 ? 'default' : 'secondary'}
                            className={`${
                              index === 0 ? 'bg-yellow-600' :
                              index === 1 ? 'bg-gray-600' :
                              index === 2 ? 'bg-orange-600' : ''
                            }`}
                          >
                            #{index + 1}
                          </Badge>
                          {index === 0 && <Crown className="h-4 w-4 text-yellow-600" />}
                          {index === 1 && <Star className="h-4 w-4 text-gray-600" />}
                          {index === 2 && <Award className="h-4 w-4 text-orange-600" />}
                        </div>
                        
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={userRep.user.avatar} />
                          <AvatarFallback>
                            {userRep.user.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <p className="font-medium">{userRep.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {getRankTitle(index + 1)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-orange-600">
                            {userRep.totalReputation.toLocaleString()}
                          </div>
                          <div className="text-muted-foreground">reputation</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="font-bold">
                            {userRep.badges.length}
                          </div>
                          <div className="text-muted-foreground">badges</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="font-bold">
                            {userRep.reputationBreakdown.postsCreated}
                          </div>
                          <div className="text-muted-foreground">posts</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest community contributions and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userReputation.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user.name}</span>
                        {' '}{activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt))} ago
                      </p>
                    </div>
                    
                    {activity.type === 'badge_earned' && (
                      <Badge variant="outline" className="text-xs">
                        <Gift className="h-3 w-3 mr-1" />
                        +Badge
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Badges</CardTitle>
              <CardDescription>Earn badges by participating in the community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Achievement Badges */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center">
                    <Trophy className="h-4 w-4 mr-2 text-yellow-600" />
                    Achievement Badges
                  </h4>
                  {[
                    { name: 'First Post', description: 'Create your first forum post', requirement: 'Create 1 post' },
                    { name: 'Active Member', description: 'Regular community participation', requirement: '50 posts' },
                    { name: 'Problem Solver', description: 'Help others by solving problems', requirement: '10 accepted solutions' },
                    { name: 'Popular Author', description: 'Create highly voted content', requirement: '100 upvotes' },
                  ].map((badge) => (
                    <div key={badge.name} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="p-2 rounded-lg bg-yellow-500">
                        <Trophy className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        <p className="text-xs text-blue-600">{badge.requirement}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Role Badges */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-blue-600" />
                    Role Badges
                  </h4>
                  {[
                    { name: 'Instructor', description: 'Course instructor', requirement: 'Instructor role' },
                    { name: 'Moderator', description: 'Community moderator', requirement: 'Moderator role' },
                    { name: 'Beta Tester', description: 'Helped test new features', requirement: 'Special invitation' },
                  ].map((badge) => (
                    <div key={badge.name} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="p-2 rounded-lg bg-blue-500">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        <p className="text-xs text-blue-600">{badge.requirement}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Special Badges */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center">
                    <Crown className="h-4 w-4 mr-2 text-purple-600" />
                    Special Badges
                  </h4>
                  {[
                    { name: 'Community Champion', description: 'Top contributor of the month', requirement: '#1 on leaderboard' },
                    { name: 'Founding Member', description: 'Early community member', requirement: 'Join in first month' },
                    { name: 'Mentor', description: 'Exceptional help to new members', requirement: 'Special recognition' },
                  ].map((badge) => (
                    <div key={badge.name} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="p-2 rounded-lg bg-purple-500">
                        <Crown className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        <p className="text-xs text-blue-600">{badge.requirement}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};