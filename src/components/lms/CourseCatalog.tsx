'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  BookOpen,
  ChevronDown,
  X,
  SlidersHorizontal,
  Grid3X3,
  List,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

// Types
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  price: number;
  isFree: boolean;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  instructor: {
    name: string;
    avatar: string | null;
  };
  category: {
    id: string;
    name: string;
    color: string;
  };
  skills: string[];
  lastUpdated: string;
  isEnrolled?: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
  courseCount: number;
}

interface CourseCatalogFilters {
  categories: string[];
  levels: string[];
  priceRange: [number, number];
  duration: [number, number];
  rating: number;
  isFree?: boolean;
}

interface CourseCatalogProps {
  initialFilters?: Partial<CourseCatalogFilters>;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  initialFilters = {}
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'price' | 'newest' | 'popular'>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<CourseCatalogFilters>({
    categories: initialFilters.categories || [],
    levels: initialFilters.levels || [],
    priceRange: initialFilters.priceRange || [0, 500],
    duration: initialFilters.duration || [0, 50], // hours
    rating: initialFilters.rating || 0,
    isFree: initialFilters.isFree
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 12;

  // Load courses and categories
  const loadData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);

      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(sortBy && { sortBy }),
        ...(filters.categories.length > 0 && { categories: filters.categories.join(',') }),
        ...(filters.levels.length > 0 && { levels: filters.levels.join(',') }),
        ...(filters.priceRange[0] > 0 || filters.priceRange[1] < 500) && { 
          minPrice: filters.priceRange[0].toString(),
          maxPrice: filters.priceRange[1].toString()
        },
        ...(filters.duration[0] > 0 || filters.duration[1] < 50) && {
          minDuration: filters.duration[0].toString(),
          maxDuration: filters.duration[1].toString()
        },
        ...(filters.rating > 0 && { minRating: filters.rating.toString() }),
        ...(filters.isFree !== undefined && { isFree: filters.isFree.toString() })
      });

      const [coursesResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/lms/courses/catalog?${searchParams}`),
        isInitial ? fetch('/api/lms/categories') : Promise.resolve(null)
      ]);

      if (!coursesResponse.ok) {
        throw new Error('Failed to load courses');
      }

      const coursesData = await coursesResponse.json();
      
      if (page === 1) {
        setCourses(coursesData.courses);
      } else {
        setCourses(prev => [...prev, ...coursesData.courses]);
      }
      
      setHasMore(coursesData.hasMore);

      // Load categories on initial load
      if (isInitial && categoriesResponse?.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load courses');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [page, searchQuery, sortBy, filters]);

  // Initial load
  useEffect(() => {
    loadData(true);
  }, []);

  // Load more when filters change
  useEffect(() => {
    if (page === 1) {
      loadData();
    } else {
      setPage(1); // Reset to first page, which will trigger loadData
    }
  }, [searchQuery, sortBy, filters]);

  // Load more data when page changes
  useEffect(() => {
    if (page > 1) {
      loadData();
    }
  }, [page]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  // Handle filter changes
  const updateFilter = useCallback((key: keyof CourseCatalogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      categories: [],
      levels: [],
      priceRange: [0, 500],
      duration: [0, 50],
      rating: 0,
      isFree: undefined
    });
    setSearchQuery('');
    setPage(1);
  }, []);

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Format price
  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100);
  };

  // Course Card Component
  const CourseCard = ({ course }: { course: Course }) => (
    <Card className={`group hover:shadow-lg transition-all duration-200 ${viewMode === 'list' ? 'flex' : ''}`}>
      <div className={`relative ${viewMode === 'list' ? 'w-64 flex-shrink-0' : ''}`}>
        <img
          src={course.thumbnailUrl || '/placeholder-course.jpg'}
          alt={course.title}
          className={`object-cover ${viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'} rounded-t-lg group-hover:scale-105 transition-transform duration-200`}
        />
        <div className="absolute top-2 right-2">
          {course.isFree ? (
            <Badge className="bg-green-600">Free</Badge>
          ) : (
            <Badge variant="secondary">{formatPrice(course.price)}</Badge>
          )}
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge variant="outline" className="bg-white/90">
            {course.level}
          </Badge>
        </div>
      </div>
      
      <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="flex items-start justify-between mb-2">
          <Badge 
            variant="secondary" 
            className="text-xs"
            style={{ backgroundColor: `${course.category.color}20`, color: course.category.color }}
          >
            {course.category.name}
          </Badge>
          <div className="flex items-center text-sm text-gray-600">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span>{course.rating}</span>
            <span className="ml-1">({course.reviewCount})</span>
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center space-x-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={course.instructor.avatar || ''} />
            <AvatarFallback className="text-xs">
              {course.instructor.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">{course.instructor.name}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {formatDuration(course.duration)}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {course.enrollmentCount.toLocaleString()}
          </div>
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            Updated {new Date(course.lastUpdated).toLocaleDateString()}
          </div>
        </div>
        
        {course.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {course.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {course.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{course.skills.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <Link href={`/courses/${course.id}/enroll`} className="block">
          <Button className="w-full" variant={course.isEnrolled ? 'outline' : 'default'}>
            {course.isEnrolled ? 'Continue Learning' : course.isFree ? 'Enroll Free' : 'Enroll Now'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  // Filter Panel
  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear all
        </Button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-medium mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={filters.categories.includes(category.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFilter('categories', [...filters.categories, category.id]);
                  } else {
                    updateFilter('categories', filters.categories.filter(id => id !== category.id));
                  }
                }}
              />
              <label
                htmlFor={`category-${category.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center justify-between w-full cursor-pointer"
              >
                <span>{category.name}</span>
                <span className="text-gray-500">({category.courseCount})</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Level */}
      <div>
        <h4 className="font-medium mb-3">Level</h4>
        <div className="space-y-2">
          {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(level => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={`level-${level}`}
                checked={filters.levels.includes(level)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFilter('levels', [...filters.levels, level]);
                  } else {
                    updateFilter('levels', filters.levels.filter(l => l !== level));
                  }
                }}
              />
              <label
                htmlFor={`level-${level}`}
                className="text-sm font-medium leading-none cursor-pointer capitalize"
              >
                {level.toLowerCase()}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="px-3">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
            max={500}
            step={10}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatPrice(filters.priceRange[0] * 100)}</span>
            <span>{formatPrice(filters.priceRange[1] * 100)}</span>
          </div>
        </div>
      </div>

      {/* Duration */}
      <div>
        <h4 className="font-medium mb-3">Duration (hours)</h4>
        <div className="px-3">
          <Slider
            value={filters.duration}
            onValueChange={(value) => updateFilter('duration', value as [number, number])}
            max={50}
            step={1}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{filters.duration[0]}h</span>
            <span>{filters.duration[1]}h</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="font-medium mb-3">Minimum Rating</h4>
        <div className="space-y-2">
          {[4.5, 4.0, 3.5, 3.0].map(rating => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={(checked) => {
                  updateFilter('rating', checked ? rating : 0);
                }}
              />
              <label
                htmlFor={`rating-${rating}`}
                className="text-sm font-medium leading-none cursor-pointer flex items-center"
              >
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                {rating} & up
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Free Courses */}
      <div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="free-courses"
            checked={filters.isFree === true}
            onCheckedChange={(checked) => {
              updateFilter('isFree', checked ? true : undefined);
            }}
          />
          <label
            htmlFor="free-courses"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            Free courses only
          </label>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading courses...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Course Catalog</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover thousands of courses taught by expert instructors. 
          Learn new skills and advance your career.
        </p>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Mobile Filter */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filter Courses</SheetTitle>
                <SheetDescription>
                  Narrow down your search with these filters.
                </SheetDescription>
              </SheetHeader>
              <div className="py-6">
                <FilterPanel />
              </div>
            </SheetContent>
          </Sheet>

          {/* Sort By */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort by
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy('relevance')}>
                Relevance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('rating')}>
                Highest Rated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('popular')}>
                Most Popular
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('newest')}>
                Newest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('price')}>
                Price: Low to High
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop Filters */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <FilterPanel />
            </CardContent>
          </Card>
        </div>

        {/* Course Grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {courses.length} courses
              {searchQuery && ` for "${searchQuery}"`}
            </p>
            
            {/* Active Filters */}
            {(filters.categories.length > 0 || filters.levels.length > 0 || filters.rating > 0 || filters.isFree) && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Filters:</span>
                {filters.categories.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Categories ({filters.categories.length})
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => updateFilter('categories', [])}
                    />
                  </Badge>
                )}
                {filters.levels.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Level ({filters.levels.length})
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => updateFilter('levels', [])}
                    />
                  </Badge>
                )}
                {filters.rating > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.rating}+ Stars
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => updateFilter('rating', 0)}
                    />
                  </Badge>
                )}
                {filters.isFree && (
                  <Badge variant="secondary" className="text-xs">
                    Free Only
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => updateFilter('isFree', undefined)}
                    />
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {courses.length > 0 ? (
            <>
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'space-y-6'
              }>
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-8">
                  <Button
                    onClick={() => setPage(prev => prev + 1)}
                    variant="outline"
                    size="lg"
                  >
                    Load More Courses
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCatalog;