// Enhanced CourseCard component for both marketing and LMS usage
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, Star, Award, Lock, CheckCircle, Calendar, GraduationCap, ArrowRight } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';

export interface CourseCardProps {
  id: string | number;
  title: string;
  description: string;
  duration?: string;
  level?: string;
  provider?: string;
  imageSrc?: string;
  imageAlt?: string;
  badges?: string[];
  href?: string;
  // LMS specific props
  thumbnail?: string;
  price?: number;
  instructor?: {
    id: string;
    name: string;
    image?: string;
  };
  _count?: {
    lessons: number;
    enrollments: number;
  };
  isEnrolled?: boolean;
  canAccess?: boolean;
  paymentStatus?: string;
  userProgress?: number;
  onEnroll?: (courseId: string) => void;
  onPayment?: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  duration,
  level,
  provider,
  imageSrc,
  imageAlt,
  badges,
  href,
  // LMS props
  thumbnail,
  price,
  instructor,
  _count,
  isEnrolled,
  canAccess,
  paymentStatus,
  userProgress,
  onEnroll,
  onPayment
}) => {
  // Use either LMS data or marketing data
  const courseImage = thumbnail || imageSrc;
  const lessonCount = _count?.lessons;
  const enrollmentCount = _count?.enrollments;
  const instructorName = instructor?.name || provider;
  const courseDuration = duration || (lessonCount ? `${lessonCount} lessons` : undefined);
  const isLMSMode = price !== undefined; // Determine if this is LMS or marketing mode

  const handleEnrollClick = () => {
    if (onEnroll) {
      onEnroll(String(id));
    }
  };

  const handlePaymentClick = () => {
    if (onPayment) {
      onPayment(String(id));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 border border-gray-100 overflow-hidden h-full flex flex-col">
      {/* Course Image */}
      <div className="h-48 bg-gradient-to-br from-red-500 to-red-600 relative">
        {courseImage ? (
          <Image
            src={courseImage.startsWith('https://placehold.co') 
              ? courseImage 
              : courseImage || `https://placehold.co/800x450/e2e8f0/4a5568?text=${title.replace(/\s+/g, '+')}`
            }
            alt={imageAlt || `Image for ${title} course`}
            fill
            className="object-cover"
            unoptimized={courseImage?.startsWith('https://placehold.co')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-sm opacity-90">Course Preview</p>
            </div>
          </div>
        )}
        
        {/* Provider/Instructor Badge */}
        {!isLMSMode && provider && (
          <div className="absolute top-4 left-4 bg-white rounded-full px-3 py-1 text-xs font-semibold text-gray-700 shadow">
            {provider}
          </div>
        )}

        {/* Level Badge */}
        {level && (
          <div className="absolute top-4 right-4">
            <span className="bg-white text-red-600 text-xs font-medium px-3 py-1 rounded-full flex items-center">
              <Award className="w-3 h-3 mr-1" />
              {level}
            </span>
          </div>
        )}

        {/* Badges */}
        {badges && badges.length > 0 && (
          <div className={`absolute top-4 ${level ? 'left-4' : 'right-4'} ${level ? '' : 'flex flex-col space-y-1 items-end'}`}>
            {badges.slice(0, 2).map((badge, index) => (
              <span
                key={index}
                className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow mr-1 mb-1"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Progress Bar for Enrolled Students */}
        {isEnrolled && typeof userProgress === 'number' && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
            <div className="flex items-center justify-between text-white text-xs mb-1">
              <span>Progress</span>
              <span>{userProgress}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${userProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
          {!isLMSMode ? (
            <Link href={href || `/courses/${id}`}>
              <span className="absolute inset-0" aria-hidden="true" />
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
          {description}
        </p>

        {/* Course Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-3">
            {instructorName && (
              <span className="flex items-center">
                {instructor?.image ? (
                  <Image
                    src={instructor.image}
                    alt={instructor.name}
                    width={16}
                    height={16}
                    className="rounded-full mr-1"
                  />
                ) : (
                  <div className="w-4 h-4 bg-gray-300 rounded-full mr-1" />
                )}
                {instructorName}
              </span>
            )}
            
            {courseDuration && (
              <span className="flex items-center">
                {lessonCount ? <Clock className="w-4 h-4 mr-1" /> : <Calendar className="w-3 w-3 mr-1.5 text-gray-400" />}
                {courseDuration}
              </span>
            )}

            {level && !isLMSMode && (
              <span className="flex items-center">
                <GraduationCap className="h-3 w-3 mr-1.5 text-gray-400" /> {level}
              </span>
            )}
          </div>
          
          {enrollmentCount && (
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {enrollmentCount} students
            </span>
          )}
        </div>

        {/* Bottom Section */}
        {isLMSMode ? (
          // LMS Mode - Price and Action Buttons
          <div className="space-y-3">
            {/* Price and Rating */}
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-red-600">
                {price === 0 ? 'Free' : `KES ${price.toLocaleString()}`}
              </div>
              <div className="flex items-center text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm text-gray-600 ml-1">4.8</span>
              </div>
            </div>

            {/* Action Buttons */}
            {canAccess ? (
              // User has full access
              <Link
                href={href || `/learn/courses/${id}`}
                className="flex items-center justify-center w-full text-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {userProgress && userProgress > 0 ? 'Continue Learning' : 'Start Course'}
              </Link>
            ) : isEnrolled && paymentStatus === 'PENDING' ? (
              // Enrolled but payment pending
              <div className="space-y-2">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">Payment pending for this course</p>
                </div>
                <Button
                  onClick={handlePaymentClick}
                  variant="primary"
                  className="w-full"
                >
                  Complete Payment
                </Button>
              </div>
            ) : price === 0 ? (
              // Free course
              <Button
                onClick={handleEnrollClick}
                variant="primary"
                className="w-full"
              >
                Enroll Now
              </Button>
            ) : (
              // Paid course
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                  <Lock className="w-4 h-4" />
                  <span>Premium Course</span>
                </div>
                <Button
                  onClick={handlePaymentClick || handleEnrollClick}
                  variant="primary"
                  className="w-full"
                >
                  Enroll Now
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Marketing Mode - Rating and Learn More link
          <div className="mt-auto pt-4 border-t border-gray-100">
            <Link
              href={href || `/courses/${id}`}
              className="text-sm font-medium text-red-600 hover:text-red-700 inline-flex items-center relative z-10"
            >
              Learn More <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
    