'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserRole } from '@/hooks/useRoleAccess';
import { toast } from 'react-hot-toast';

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

const roleOptions: RoleOption[] = [
  {
    role: 'student',
    title: 'Student',
    description: 'Learn from expert instructors and access courses',
    icon: '🎓',
    features: [
      'Access to all courses',
      'Track your progress',
      'Earn certificates',
      'Join discussions',
      'Mobile learning app'
    ]
  },
  {
    role: 'instructor',
    title: 'Instructor',
    description: 'Share your knowledge and create courses',
    icon: '👨‍🏫',
    features: [
      'Create unlimited courses',
      'Student analytics',
      'Course management tools',
      'Revenue sharing',
      'Instructor community'
    ]
  }
];

interface RoleSelectionProps {
  onRoleSelected?: (role: UserRole) => void;
  showAdminOption?: boolean;
}

export default function RoleSelection({ onRoleSelected, showAdminOption = false }: RoleSelectionProps) {
  const { user } = useUser();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Add admin option if requested
  const availableRoles = showAdminOption ? [
    ...roleOptions,
    {
      role: 'admin' as UserRole,
      title: 'Administrator',
      description: 'Manage the platform and all users',
      icon: '👑',
      features: [
        'Full platform access',
        'User management',
        'Course approval',
        'Analytics dashboard',
        'System configuration'
      ]
    }
  ] : roleOptions;

  const handleRoleSelect = async (role: UserRole) => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    setSelectedRole(role);
    setIsUpdating(true);

    try {
      // Update user metadata with selected role
      await user.update({
        publicMetadata: {
          ...user.publicMetadata,
          role: role,
          roleSelectedAt: new Date().toISOString(),
        }
      });

      toast.success(`Role updated to ${role}!`);
      
      if (onRoleSelected) {
        onRoleSelected(role);
      }

      // Redirect based on role after a short delay
      setTimeout(() => {
        switch (role) {
          case 'admin':
            window.location.href = '/admin/dashboard';
            break;
          case 'instructor':
            window.location.href = '/instructor/dashboard';
            break;
          case 'student':
          default:
            window.location.href = '/student/dashboard';
            break;
        }
      }, 1500);

    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const currentRole = user?.publicMetadata?.role as UserRole;

  if (currentRole && !showAdminOption) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome back!</h2>
          <p className="text-gray-600 mb-6">
            Your role is set to <span className="font-semibold capitalize">{currentRole}</span>
          </p>
          <button
            onClick={() => {
              switch (currentRole) {
                case 'admin':
                  window.location.href = '/admin/dashboard';
                  break;
                case 'instructor':
                  window.location.href = '/instructor/dashboard';
                  break;
                case 'student':
                default:
                  window.location.href = '/student/dashboard';
                  break;
              }
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Role
        </h2>
        <p className="text-gray-600 text-lg">
          Select how you'd like to use TechGetAfrica LMS
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {availableRoles.map((option) => (
          <div
            key={option.role}
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedRole === option.role
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            } ${
              isUpdating && selectedRole === option.role
                ? 'opacity-75 pointer-events-none'
                : ''
            }`}
            onClick={() => handleRoleSelect(option.role)}
          >
            {isUpdating && selectedRole === option.role && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{option.icon}</div>
              <h3 className="text-xl font-bold text-gray-900">{option.title}</h3>
              <p className="text-gray-600 mt-2">{option.description}</p>
            </div>

            <ul className="space-y-2">
              {option.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-700">
                  <svg 
                    className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <button 
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedRole === option.role
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedRole === option.role && isUpdating 
                  ? 'Setting up...' 
                  : `Choose ${option.title}`
                }
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          Don't worry, you can change your role later in your profile settings
        </p>
      </div>
    </div>
  );
}