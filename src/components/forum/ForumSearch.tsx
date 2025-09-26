'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/components/UserProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Calendar,
  User,
  MessageSquare,
  Tag,
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  X,
  ChevronDown,
  SlidersHorizontal,
  Hash,
  Users
} from 'lucide-react';
import { ForumTopic, ForumPost, ForumUser, ForumCategory } from '@/types/forum';
import { formatDistanceToNow } from 'date-fns';
import VotingComponent from './VotingComponent';
import Link from 'next/link';
import { debounce } from 'lodash';

interface SearchFilters {
  query: string;
  categories: string[];
  tags: string[];
  authors: string[];
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  sortBy: 'relevance' | 'recent' | 'popular' | 'votes' | 'replies';
  hasAcceptedAnswer: boolean | null;
  minVotes: number | null;
  postType: 'all' | 'topics' | 'posts';
  status: 'all' | 'open' | 'solved' | 'closed';
}

interface SearchResult {
  type: 'topic' | 'post';
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: ForumUser;
  createdAt: string;
  updatedAt?: string;
  upvotes: number;
  downvotes: number;
  replyCount?: number;
  participantCount?: number;
  tags: string[];
  category: ForumCategory;
  parentTopic?: {
    id: string;
    title: string;
  };
  hasAcceptedAnswer?: boolean;
  isAcceptedAnswer?: boolean;
  relevanceScore: number;
}

interface ForumSearchProps {
  defaultQuery?: string;
  defaultFilters?: Partial<SearchFilters>;
  onResultSelect?: (result: SearchResult) => void;
  compact?: boolean;
}

export const ForumSearch: React.FC<ForumSearchProps> = ({
  defaultQuery = '',
  defaultFilters = {},
  onResultSelect,
  compact = false
}) => {
  const { user } = useUser();
  const [filters, setFilters] = useState<SearchFilters>({
    query: defaultQuery,
    categories: [],
    tags: [],
    authors: [],
    dateRange: 'all',
    sortBy: 'relevance',
    hasAcceptedAnswer: null,
    minVotes: null,
    postType: 'all',
    status: 'all',
    ...defaultFilters
  });
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Suggestions and metadata
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [popularTags, setPopularTags] = useState<Array<{ name: string; count: number }>>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const resultsPerPage = compact ? 5 : 10;

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (filters.query.trim() || hasActiveFilters()) {
      debouncedSearch();
    } else {
      setResults([]);
      setTotalResults(0);
    }
  }, [filters, currentPage]);

  const fetchMetadata = async () => {
    try {
      const response = await fetch('/api/lms/forum/search/metadata');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data.categories || []);
        setPopularTags(data.data.popularTags || []);
      }
    } catch (error) {
      console.error('Failed to fetch search metadata:', error);
    }
  };

  const performSearch = async () => {
    if (!filters.query.trim() && !hasActiveFilters()) {
      return;
    }

    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        q: filters.query,
        page: currentPage.toString(),
        limit: resultsPerPage.toString(),
        sortBy: filters.sortBy,
        postType: filters.postType,
        status: filters.status,
        dateRange: filters.dateRange,
      });

      if (filters.categories.length > 0) {
        params.append('categories', filters.categories.join(','));
      }
      if (filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }
      if (filters.authors.length > 0) {
        params.append('authors', filters.authors.join(','));
      }
      if (filters.hasAcceptedAnswer !== null) {
        params.append('hasAcceptedAnswer', filters.hasAcceptedAnswer.toString());
      }
      if (filters.minVotes !== null) {
        params.append('minVotes', filters.minVotes.toString());
      }

      const response = await fetch(`/api/lms/forum/search?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data.results);
        setTotalResults(data.data.totalResults);
        setSuggestions(data.data.suggestions || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce(performSearch, 300),
    [filters, currentPage, resultsPerPage]
  );

  const hasActiveFilters = () => {
    return filters.categories.length > 0 ||
           filters.tags.length > 0 ||
           filters.authors.length > 0 ||
           filters.dateRange !== 'all' ||
           filters.hasAcceptedAnswer !== null ||
           filters.minVotes !== null ||
           filters.postType !== 'all' ||
           filters.status !== 'all';
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      categories: [],
      tags: [],
      authors: [],
      dateRange: 'all',
      sortBy: 'relevance',
      hasAcceptedAnswer: null,
      minVotes: null,
      postType: 'all',
      status: 'all'
    });
    setCurrentPage(1);
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addCategory = (categoryId: string) => {
    if (!filters.categories.includes(categoryId)) {
      setFilters(prev => ({
        ...prev,
        categories: [...prev.categories, categoryId]
      }));
    }
  };

  const removeCategory = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== categoryId)
    }));
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> : 
        part
    );
  };

  const getResultIcon = (result: SearchResult) => {
    if (result.type === 'post') {
      return result.isAcceptedAnswer ? 
        <CheckCircle className="h-4 w-4 text-green-600" /> :
        <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
    return result.hasAcceptedAnswer ?
      <CheckCircle className="h-4 w-4 text-green-600" /> :
      <MessageSquare className="h-4 w-4 text-blue-600" />;
  };

  const ResultCard = ({ result }: { result: SearchResult }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <VotingComponent
            targetId={result.id}
            targetType={result.type}
            initialVotes={{
              upvotes: result.upvotes,
              downvotes: result.downvotes
            }}
            size="sm"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              {getResultIcon(result)}
              
              <Link
                href={result.type === 'topic' ? 
                  `/forum/topics/${result.id}` : 
                  `/forum/topics/${result.parentTopic?.id}#post-${result.id}`
                }
                className="font-medium hover:text-blue-600 text-lg truncate"
                onClick={() => onResultSelect?.(result)}
              >
                {highlightText(result.title, filters.query)}
              </Link>
              
              <Badge variant="outline" className="text-xs">
                {result.type}
              </Badge>
              
              {result.isAcceptedAnswer && (
                <Badge className="text-xs bg-green-100 text-green-800">
                  Accepted Answer
                </Badge>
              )}
            </div>

            {result.parentTopic && (
              <div className="flex items-center space-x-1 mb-2 text-sm text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>in</span>
                <Link 
                  href={`/forum/topics/${result.parentTopic.id}`}
                  className="hover:text-blue-600"
                >
                  {result.parentTopic.title}
                </Link>
              </div>
            )}

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {highlightText(result.excerpt, filters.query)}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={result.author.avatar} />
                    <AvatarFallback className="text-xs">
                      {result.author.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{result.author.name}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(result.createdAt))} ago</span>
                </div>
                
                <Badge variant="outline" className="text-xs">
                  {result.category.name}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                {result.replyCount !== undefined && (
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{result.replyCount}</span>
                  </div>
                )}
                
                {result.participantCount !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{result.participantCount}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>{result.relevanceScore.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {result.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {result.tags.slice(0, 5).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-blue-100"
                    onClick={() => addTag(tag)}
                  >
                    <Hash className="h-2 w-2 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {result.tags.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{result.tags.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search forum..."
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            className="pl-10"
          />
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="text-sm text-muted-foreground">Searching...</div>
          </div>
        )}

        <div className="space-y-3">
          {results.slice(0, 5).map((result) => (
            <ResultCard key={`${result.type}-${result.id}`} result={result} />
          ))}
        </div>

        {totalResults > 5 && (
          <div className="text-center">
            <Button variant="outline" size="sm">
              View all {totalResults} results
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Forum Search</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Advanced
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${
                showAdvanced ? 'rotate-180' : ''
              }`} />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Main search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search topics, posts, or users..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              className="pl-10 text-lg h-12"
            />
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={filters.sortBy} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, sortBy: value as any }))
            }>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="votes">Highest Voted</SelectItem>
                <SelectItem value="replies">Most Replies</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.postType} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, postType: value as any }))
            }>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="topics">Topics Only</SelectItem>
                <SelectItem value="posts">Posts Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.dateRange} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, dateRange: value as any }))
            }>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters() && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-3 w-3 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Advanced filters */}
          {showAdvanced && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Categories */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Categories</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${category.id}`}
                          checked={filters.categories.includes(category.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              addCategory(category.id);
                            } else {
                              removeCategory(category.id);
                            }
                          }}
                        />
                        <Label htmlFor={`cat-${category.id}`} className="text-sm">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Tags */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Popular Tags</Label>
                  <div className="flex flex-wrap gap-1">
                    {popularTags.slice(0, 10).map((tag) => (
                      <Badge
                        key={tag.name}
                        variant={filters.tags.includes(tag.name) ? 'default' : 'outline'}
                        className="cursor-pointer hover:bg-blue-100 text-xs"
                        onClick={() => {
                          if (filters.tags.includes(tag.name)) {
                            removeTag(tag.name);
                          } else {
                            addTag(tag.name);
                          }
                        }}
                      >
                        <Hash className="h-2 w-2 mr-1" />
                        {tag.name} ({tag.count})
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Additional Filters */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Additional Filters</Label>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has-answer"
                      checked={filters.hasAcceptedAnswer === true}
                      onCheckedChange={(checked) => 
                        setFilters(prev => ({ ...prev, hasAcceptedAnswer: checked ? true : null }))
                      }
                    />
                    <Label htmlFor="has-answer" className="text-sm">
                      Has accepted answer
                    </Label>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="min-votes" className="text-sm">
                      Minimum votes
                    </Label>
                    <Input
                      id="min-votes"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={filters.minVotes || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        minVotes: e.target.value ? parseInt(e.target.value) : null
                      }))}
                      className="w-20 h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Active filters display */}
          {(filters.categories.length > 0 || filters.tags.length > 0) && (
            <>
              <Separator />
              <div className="space-y-2">
                {filters.categories.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Categories:</span>
                    <div className="flex flex-wrap gap-1">
                      {filters.categories.map((categoryId) => {
                        const category = categories.find(c => c.id === categoryId);
                        return (
                          <Badge key={categoryId} variant="secondary" className="text-xs">
                            {category?.name}
                            <X
                              className="h-3 w-3 ml-1 cursor-pointer"
                              onClick={() => removeCategory(categoryId)}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {filters.tags.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {filters.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Hash className="h-2 w-2 mr-1" />
                          {tag}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {loading && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-lg">Searching...</div>
          </CardContent>
        </Card>
      )}

      {!loading && filters.query.trim() && results.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters
            </p>
            
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Did you mean:</p>
                <div className="flex justify-center flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, query: suggestion }))}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && results.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {totalResults.toLocaleString()} result{totalResults !== 1 ? 's' : ''} found
                  {filters.query.trim() && (
                    <span className="text-muted-foreground"> for "{filters.query}"</span>
                  )}
                </span>
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {Math.ceil(totalResults / resultsPerPage)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result) => (
                  <ResultCard key={`${result.type}-${result.id}`} result={result} />
                ))}
              </div>

              {/* Pagination */}
              {totalResults > resultsPerPage && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, Math.ceil(totalResults / resultsPerPage)) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === Math.ceil(totalResults / resultsPerPage)}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};