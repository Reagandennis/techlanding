'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import LMSProtectedRoute from '@/components/LMSProtectedRoute';
import LMSLayout from '@/components/LMSLayout';
import FileUpload from '@/components/common/FileUpload';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Settings, 
  Upload, 
  Plus, 
  Trash2,
  Save,
  Eye,
  DollarSign,
  Clock,
  Users,
  Star
} from 'lucide-react';

// Form validation schemas
const basicInfoSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  shortDescription: z.string().max(160, 'Short description must be under 160 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']),
  language: z.string().default('en'),
  tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed'),
});

const pricingSchema = z.object({
  price: z.number().min(0, 'Price cannot be negative'),
  discountPrice: z.number().min(0, 'Discount price cannot be negative').optional(),
  currency: z.string().default('USD'),
});

const moduleSchema = z.object({
  title: z.string().min(3, 'Module title must be at least 3 characters'),
  description: z.string().optional(),
  lessons: z.array(z.object({
    title: z.string().min(3, 'Lesson title must be at least 3 characters'),
    description: z.string().optional(),
    type: z.enum(['TEXT', 'VIDEO', 'QUIZ', 'ASSIGNMENT', 'DOCUMENT']),
    content: z.string().optional(),
    videoUrl: z.string().optional(),
    duration: z.number().optional(),
    isFree: z.boolean().default(false),
  })),
});

interface CourseFormData {
  // Basic Info
  title: string;
  shortDescription: string;
  description: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
  language: string;
  tags: string[];
  thumbnail: string;
  
  // Pricing
  price: number;
  discountPrice?: number;
  currency: string;
  
  // Curriculum
  modules: {
    title: string;
    description?: string;
    lessons: {
      title: string;
      description?: string;
      type: 'TEXT' | 'VIDEO' | 'QUIZ' | 'ASSIGNMENT' | 'DOCUMENT';
      content?: string;
      videoUrl?: string;
      duration?: number;
      isFree: boolean;
    }[];
  }[];
  
  // Settings
  accessCode?: string;
  prerequisites: string[];
}

const STEPS = [
  { id: 'basic', title: 'Basic Info', icon: BookOpen },
  { id: 'curriculum', title: 'Curriculum', icon: BookOpen },
  { id: 'pricing', title: 'Pricing', icon: DollarSign },
  { id: 'settings', title: 'Settings', icon: Settings },
  { id: 'preview', title: 'Preview', icon: Eye },
];

export default function CreateCoursePage() {
  const { user } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseData, setCourseData] = useState<Partial<CourseFormData>>({
    language: 'en',
    currency: 'USD',
    level: 'BEGINNER',
    tags: [],
    modules: [{
      title: 'Introduction',
      lessons: [{
        title: 'Welcome to the Course',
        type: 'TEXT',
        isFree: true
      }]
    }],
    prerequisites: [],
    price: 0
  });

  const form = useForm<CourseFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: courseData as CourseFormData,
  });

  const { control, watch, setValue, getValues } = form;
  const { fields: moduleFields, append: appendModule, remove: removeModule } = useFieldArray({
    control,
    name: 'modules',
  });

  const handleNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      // Save current step data
      const stepData = getValues();
      setCourseData({ ...courseData, ...stepData });
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleThumbnailUpload = useCallback((result: any) => {
    setCourseData(prev => ({ ...prev, thumbnail: result.secure_url }));
    setValue('thumbnail', result.secure_url);
  }, [setValue]);

  const addModule = () => {
    appendModule({
      title: `Module ${moduleFields.length + 1}`,
      description: '',
      lessons: [{
        title: 'New Lesson',
        type: 'TEXT',
        isFree: false
      }]
    });
  };

  const addLesson = (moduleIndex: number) => {
    const modules = getValues('modules');
    modules[moduleIndex].lessons.push({
      title: 'New Lesson',
      type: 'TEXT',
      isFree: false
    });
    setValue('modules', modules);
  };

  const submitCourse = async (isDraft = true) => {
    setIsSubmitting(true);
    try {
      const finalData = { ...courseData, ...getValues() };
      
      const response = await fetch('/api/lms/instructor/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...finalData,
          status: isDraft ? 'DRAFT' : 'PUBLISHED',
        }),
      });

      if (response.ok) {
        const course = await response.json();
        router.push(`/lms/instructor/courses/${course.id}`);
      } else {
        throw new Error('Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error creating course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course Title
        </label>
        <input
          type="text"
          {...form.register('title')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Enter an engaging course title"
        />
        {form.formState.errors.title && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Short Description (for course cards)
        </label>
        <input
          type="text"
          {...form.register('shortDescription')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Brief description (max 160 characters)"
          maxLength={160}
        />
        <p className="text-xs text-gray-500 mt-1">
          {watch('shortDescription')?.length || 0}/160 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Detailed Description
        </label>
        <textarea
          {...form.register('description')}
          rows={8}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Provide a comprehensive description of what students will learn..."
        />
        {form.formState.errors.description && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Level
          </label>
          <select
            {...form.register('level')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="ALL_LEVELS">All Levels</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            {...form.register('language')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course Thumbnail
        </label>
        {courseData.thumbnail ? (
          <div className="relative">
            <img
              src={courseData.thumbnail}
              alt="Course thumbnail"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={() => {
                setCourseData(prev => ({ ...prev, thumbnail: undefined }));
                setValue('thumbnail', '');
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <FileUpload
            onUpload={handleThumbnailUpload}
            uploadType="course-thumbnail"
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
            maxSize={5 * 1024 * 1024} // 5MB
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (help students find your course)
        </label>
        <input
          type="text"
          placeholder="Press Enter to add tags (e.g., JavaScript, React, Web Development)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const value = e.currentTarget.value.trim();
              if (value && !courseData.tags?.includes(value) && (courseData.tags?.length || 0) < 5) {
                const newTags = [...(courseData.tags || []), value];
                setCourseData(prev => ({ ...prev, tags: newTags }));
                setValue('tags', newTags);
                e.currentTarget.value = '';
              }
            }
          }}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {courseData.tags?.map((tag, index) => (
            <span
              key={index}
              className="bg-red-100 text-red-800 px-2 py-1 text-sm rounded-full flex items-center"
            >
              {tag}
              <button
                onClick={() => {
                  const newTags = courseData.tags?.filter((_, i) => i !== index);
                  setCourseData(prev => ({ ...prev, tags: newTags }));
                  setValue('tags', newTags || []);
                }}
                className="ml-1 hover:text-red-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCurriculumStep = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Course Curriculum</h3>
        <button
          onClick={addModule}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </button>
      </div>

      <div className="space-y-6">
        {moduleFields.map((module, moduleIndex) => (
          <div key={module.id} className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 space-y-4">
                <input
                  {...form.register(`modules.${moduleIndex}.title`)}
                  className="w-full p-3 border border-gray-300 rounded-lg font-medium"
                  placeholder="Module Title"
                />
                <textarea
                  {...form.register(`modules.${moduleIndex}.description`)}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Module Description (optional)"
                />
              </div>
              {moduleFields.length > 1 && (
                <button
                  onClick={() => removeModule(moduleIndex)}
                  className="ml-4 p-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-700">Lessons</h4>
                <button
                  onClick={() => addLesson(moduleIndex)}
                  className="text-red-600 hover:text-red-700 text-sm flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Lesson
                </button>
              </div>

              {module.lessons.map((lesson, lessonIndex) => (
                <div key={lessonIndex} className="bg-white p-4 rounded-lg border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      {...form.register(`modules.${moduleIndex}.lessons.${lessonIndex}.title`)}
                      className="p-2 border border-gray-300 rounded"
                      placeholder="Lesson Title"
                    />
                    <select
                      {...form.register(`modules.${moduleIndex}.lessons.${lessonIndex}.type`)}
                      className="p-2 border border-gray-300 rounded"
                    >
                      <option value="TEXT">Text/Article</option>
                      <option value="VIDEO">Video</option>
                      <option value="QUIZ">Quiz</option>
                      <option value="ASSIGNMENT">Assignment</option>
                      <option value="DOCUMENT">Document</option>
                    </select>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...form.register(`modules.${moduleIndex}.lessons.${lessonIndex}.isFree`)}
                          className="mr-2"
                        />
                        <span className="text-sm">Free Preview</span>
                      </label>
                      {module.lessons.length > 1 && (
                        <button
                          onClick={() => {
                            const modules = getValues('modules');
                            modules[moduleIndex].lessons = modules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
                            setValue('modules', modules);
                          }}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea
                    {...form.register(`modules.${moduleIndex}.lessons.${lessonIndex}.description`)}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded mt-2"
                    placeholder="Lesson description (optional)"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPricingStep = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Pricing Strategy</h3>
        <p className="text-blue-700 text-sm">
          Set your course price based on the value you provide. You can always adjust it later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Price
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="number"
              min="0"
              step="0.01"
              {...form.register('price', { valueAsNumber: true })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Set to 0 for a free course</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount Price (optional)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="number"
              min="0"
              step="0.01"
              {...form.register('discountPrice', { valueAsNumber: true })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Currency
        </label>
        <select
          {...form.register('currency')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="USD">USD - US Dollar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
          <option value="NGN">NGN - Nigerian Naira</option>
          <option value="KES">KES - Kenyan Shilling</option>
          <option value="GHS">GHS - Ghanaian Cedi</option>
        </select>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Revenue Sharing</h4>
        <div className="text-sm text-gray-600">
          <p>• Platform fee: 10% of gross revenue</p>
          <p>• Payment processing: ~3%</p>
          <p>• Your net earning: ~87% of listed price</p>
        </div>
      </div>
    </div>
  );

  const renderSettingsStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Access Code (optional)
        </label>
        <input
          type="text"
          {...form.register('accessCode')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Create a private access code for exclusive enrollment"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty for public course. Students will need this code to enroll.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prerequisites (optional)
        </label>
        <textarea
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="List any skills or knowledge students should have before taking this course..."
          onChange={(e) => {
            const prerequisites = e.target.value.split('\n').filter(p => p.trim());
            setCourseData(prev => ({ ...prev, prerequisites }));
            setValue('prerequisites', prerequisites);
          }}
        />
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">Before Publishing</h4>
        <ul className="text-yellow-800 text-sm space-y-1">
          <li>• Ensure all lessons have content</li>
          <li>• Add a compelling course thumbnail</li>
          <li>• Write a detailed course description</li>
          <li>• Set appropriate pricing</li>
          <li>• Test your course as a student would</li>
        </ul>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="aspect-video bg-gray-200 flex items-center justify-center">
          {courseData.thumbnail ? (
            <img
              src={courseData.thumbnail}
              alt="Course preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-500">Course thumbnail will appear here</div>
          )}
        </div>
        
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {courseData.title || 'Course Title'}
          </h1>
          
          <p className="text-gray-600 mb-4">
            {courseData.shortDescription || 'Course short description will appear here'}
          </p>
          
          <div className="flex items-center space-x-4 mb-6">
            <span className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded-full">
              {courseData.level}
            </span>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {courseData.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0} lessons
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              {courseData.level}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-gray-900">
              {courseData.price === 0 ? 'Free' : `$${courseData.price}`}
              {courseData.discountPrice && courseData.discountPrice < (courseData.price || 0) && (
                <span className="text-lg text-gray-500 line-through ml-2">
                  ${courseData.discountPrice}
                </span>
              )}
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm text-gray-500">No ratings yet</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Course Curriculum</h3>
        <div className="space-y-2">
          {courseData.modules?.map((module, index) => (
            <div key={index} className="bg-white p-3 rounded border">
              <h4 className="font-medium text-gray-900">{module.title}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {module.lessons?.length || 0} lessons
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <LMSProtectedRoute requiredSection="instructor">
      <LMSLayout currentSection="instructor">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
                <p className="text-gray-600">Build and publish your course step by step</p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-center ${
                      index !== STEPS.length - 1 ? 'flex-1' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                          isActive
                            ? 'border-red-500 bg-red-500 text-white'
                            : isCompleted
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300 text-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p
                          className={`text-sm font-medium ${
                            isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {step.title}
                        </p>
                      </div>
                    </div>
                    
                    {index !== STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            {currentStep === 0 && renderBasicInfoStep()}
            {currentStep === 1 && renderCurriculumStep()}
            {currentStep === 2 && renderPricingStep()}
            {currentStep === 3 && renderSettingsStep()}
            {currentStep === 4 && renderPreviewStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            <div className="flex space-x-3">
              {currentStep === STEPS.length - 1 ? (
                <>
                  <button
                    onClick={() => submitCourse(true)}
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </button>
                  <button
                    onClick={() => submitCourse(false)}
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Publish Course
                  </button>
                </>
              ) : (
                <button
                  onClick={handleNextStep}
                  className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </LMSLayout>
    </LMSProtectedRoute>
  );
}