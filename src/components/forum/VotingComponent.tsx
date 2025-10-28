'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/components/UserProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, TrendingUp, Award } from 'lucide-react';
import { ForumVote } from '@/types/forum';

interface VotingComponentProps {
  targetId: string;
  targetType: 'topic' | 'post';
  initialVotes?: {
    upvotes: number;
    downvotes: number;
    userVote?: 'upvote' | 'downvote' | null;
  };
  onVoteChange?: (newVotes: { upvotes: number; downvotes: number; score: number }) => void;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const VotingComponent: React.FC<VotingComponentProps> = ({
  targetId,
  targetType,
  initialVotes = { upvotes: 0, downvotes: 0, userVote: null },
  onVoteChange,
  showScore = true,
  size = 'md',
  disabled = false
}) => {
  const { user } = useUser();
  const [votes, setVotes] = useState(initialVotes);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    setVotes(initialVotes);
    setHasVoted(!!initialVotes.userVote);
  }, [initialVotes]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user || isVoting || disabled) return;

    try {
      setIsVoting(true);

      const response = await fetch('/api/lms/forum/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetId,
          targetType,
          voteType: votes.userVote === voteType ? null : voteType, // Toggle if same vote
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const newVotes = {
          upvotes: data.data.upvotes,
          downvotes: data.data.downvotes,
          userVote: data.data.userVote,
        };
        
        setVotes(newVotes);
        setHasVoted(!!data.data.userVote);
        
        if (onVoteChange) {
          onVoteChange({
            upvotes: newVotes.upvotes,
            downvotes: newVotes.downvotes,
            score: newVotes.upvotes - newVotes.downvotes,
          });
        }
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'h-6 w-6';
      case 'lg': return 'h-10 w-10';
      default: return 'h-8 w-8';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3';
      case 'lg': return 'h-5 w-5';
      default: return 'h-4 w-4';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-base';
      default: return 'text-sm';
    }
  };

  const score = votes.upvotes - votes.downvotes;
  const totalVotes = votes.upvotes + votes.downvotes;

  return (
    <div className="flex flex-col items-center space-y-1">
      {/* Upvote Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`${getButtonSize()} ${
          votes.userVote === 'upvote'
            ? 'text-green-600 bg-green-50 hover:bg-green-100'
            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
        } transition-colors duration-200`}
        onClick={() => handleVote('upvote')}
        disabled={!user || isVoting || disabled}
      >
        <ChevronUp className={getIconSize()} />
      </Button>

      {/* Vote Score/Count */}
      {showScore && (
        <div className={`${getTextSize()} font-medium text-center min-w-0`}>
          <div className={`${
            score > 0 ? 'text-green-600' :
            score < 0 ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {score > 0 && '+'}
            {score}
          </div>
          
          {/* Additional vote info for larger sizes */}
          {size === 'lg' && totalVotes > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {votes.upvotes} up, {votes.downvotes} down
            </div>
          )}
        </div>
      )}

      {/* Downvote Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`${getButtonSize()} ${
          votes.userVote === 'downvote'
            ? 'text-red-600 bg-red-50 hover:bg-red-100'
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
        } transition-colors duration-200`}
        onClick={() => handleVote('downvote')}
        disabled={!user || isVoting || disabled}
      >
        <ChevronDown className={getIconSize()} />
      </Button>

      {/* Trending indicator for highly voted content */}
      {size !== 'sm' && score >= 10 && (
        <Badge variant="secondary" className="text-xs mt-2">
          <TrendingUp className="h-3 w-3 mr-1" />
          Hot
        </Badge>
      )}

      {/* Award indicator for extremely highly voted content */}
      {size !== 'sm' && score >= 50 && (
        <Badge variant="default" className="text-xs mt-1 bg-yellow-500">
          <Award className="h-3 w-3 mr-1" />
          Gold
        </Badge>
      )}
    </div>
  );
};

export default VotingComponent;