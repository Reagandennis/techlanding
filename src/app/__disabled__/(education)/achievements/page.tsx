'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessVertical } from '../../../shared/context/BusinessVerticalContext';
import { Navbar } from '../../../shared/components/layout/Navbar';
import { Footer } from '../../../shared/components/layout/Footer';
import { SectionHeading } from '../../../shared/components/common/SectionHeading';
import { Button } from '../../../shared/components/ui/Button';
import { 
  Award, 
  Star, 
  Trophy, 
  Target, 
  Zap, 
  BookOpen, 
  Users, 
  Clock,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'COURSE_COMPLETION' | 'STREAK' | 'ENGAGEMENT' | 'MILESTONE' | 'SPECIAL';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  requirements: string;
  points: number;
}

interface UserBadge {
  id: string;
  badge: Badge;
  earnedAt: string;
  metadata?: {
    courseId?: string;
    courseName?: string;
    streakDays?: number;
    milestone?: number;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: string;
  points: number;
  badge?: Badge;
}

interface AchievementStats {
  totalBadges: number;
  totalPoints: number;
  rank: string;
  nextRankPoints: number;
  completionRate: number;
}

export default function AchievementsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { setVertical } = useBusinessVertical();
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats>({
    totalBadges: 0,
    totalPoints: 0,
    rank: 'Beginner',
    nextRankPoints: 100,
    completionRate: 0
  });
  const [activeTab, setActiveTab] = useState<'badges' | 'achievements'>('badges');
  const [isLoading, setIsLoading] = useState(true);

  // Set business vertical context
  useEffect(() => {
    setVertical('education');
  }, [setVertical]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    if (!user) return;

    const fetchAchievementsData = async () => {
      try {
        const [badgesResponse, achievementsResponse, statsResponse] = await Promise.all([
          fetch('/api/achievements/badges'),
          fetch('/api/achievements/progress'),
          fetch('/api/achievements/stats')
        ]);

        if (badgesResponse.ok) {
          const badgesData = await badgesResponse.json();
          setUserBadges(badgesData.userBadges);
          setAvailableBadges(badgesData.availableBadges);
        }

        if (achievementsResponse.ok) {
          const achievementsData = await achievementsResponse.json();
          setAchievements(achievementsData.achievements);
        }

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        }
      } catch (error) {
        console.error('Error fetching achievements data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievementsData();
  }, [user]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'text-gray-600 bg-gray-100';
      case 'RARE': return 'text-blue-600 bg-blue-100';
      case 'EPIC': return 'text-purple-600 bg-purple-100';
      case 'LEGENDARY': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'COURSE_COMPLETION': return <BookOpen className="w-5 h-5" />;
      case 'STREAK': return <Zap className="w-5 h-5" />;
      case 'ENGAGEMENT': return <Users className="w-5 h-5" />;
      case 'MILESTONE': return <Target className="w-5 h-5" />;
      case 'SPECIAL': return <Trophy className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge.id));

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar vertical="education" />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar vertical="education" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <SectionHeading
            eyebrow="Your Progress"
            title="Badges & Achievements"
            description="Track your learning journey and earn rewards for your dedication"
          />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalBadges}</div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.rank}</div>
            <div className="text-sm text-gray-600">Current Rank</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{Math.round(stats.completionRate)}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>

        {/* Progress to Next Rank */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-red-900">Progress to Next Rank</h3>
              <p className="text-red-700">
                {stats.nextRankPoints - stats.totalPoints} points needed to reach the next level
              </p>
            </div>
            <Trophy className="w-8 h-8 text-red-600" />
          </div>
          <div className="w-full bg-red-200 rounded-full h-3">
            <div
              className="bg-red-600 h-3 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min((stats.totalPoints / stats.nextRankPoints) * 100, 100)}%` 
              }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('badges')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'badges'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Badges ({userBadges.length})
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'achievements'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Achievements ({achievements.filter(a => a.completed).length}/{achievements.length})
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'badges' && (
              <div>
                {/* Earned Badges */}
                {userBadges.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Badges</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {userBadges.map((userBadge) => (
                        <div
                          key={userBadge.id}
                          className="bg-white border-2 border-green-200 rounded-lg p-6 text-center relative"
                        >
                          <div className="absolute -top-2 -right-2">
                            <CheckCircle2 className="w-6 h-6 text-green-600 bg-white rounded-full" />
                          </div>
                          
                          <div className="text-4xl mb-3">{userBadge.badge.icon}</div>
                          
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {userBadge.badge.name}
                          </h4>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            {userBadge.badge.description}
                          </p>
                          
                          <div className="flex items-center justify-center space-x-2 mb-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              getRarityColor(userBadge.badge.rarity)
                            }`}>
                              {userBadge.badge.rarity}
                            </span>
                            <span className="text-xs text-gray-500">
                              +{userBadge.badge.points} pts
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-500">
                            Earned {new Date(userBadge.earnedAt).toLocaleDateString()}
                          </p>

                          {userBadge.metadata?.courseName && (
                            <p className="text-xs text-blue-600 mt-1">
                              {userBadge.metadata.courseName}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Badges */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Available Badges</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {availableBadges
                      .filter(badge => !earnedBadgeIds.has(badge.id))
                      .map((badge) => (
                        <div
                          key={badge.id}
                          className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 text-center relative opacity-75"
                        >
                          <div className="absolute -top-2 -right-2">
                            <Lock className="w-6 h-6 text-gray-400 bg-white rounded-full p-1" />
                          </div>
                          
                          <div className="text-4xl mb-3 grayscale">{badge.icon}</div>
                          
                          <h4 className="font-semibold text-gray-700 mb-2">
                            {badge.name}
                          </h4>
                          
                          <p className="text-sm text-gray-500 mb-3">
                            {badge.description}
                          </p>
                          
                          <div className="flex items-center justify-center space-x-2 mb-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              getRarityColor(badge.rarity)
                            }`}>
                              {badge.rarity}
                            </span>
                            <span className="text-xs text-gray-500">
                              +{badge.points} pts
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-500">
                            {badge.requirements}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="space-y-6">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`border rounded-lg p-6 ${
                      achievement.completed 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-full ${
                            achievement.completed ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {getTypeIcon(achievement.category)}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {achievement.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {achievement.description}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.target}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                achievement.completed ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ 
                                width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` 
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            +{achievement.points} points
                          </span>
                          
                          {achievement.completed && achievement.completedAt && (
                            <span className="text-sm text-green-600 flex items-center space-x-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Completed {new Date(achievement.completedAt).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {achievement.badge && (
                        <div className="ml-6 text-center">
                          <div className="text-3xl mb-2">{achievement.badge.icon}</div>
                          <p className="text-xs text-gray-600">Badge Reward</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {achievements.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No achievements yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start learning to unlock your first achievements!
                    </p>
                    <Button onClick={() => router.push('/courses')}>
                      Browse Courses
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
