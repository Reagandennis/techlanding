'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { verifyClerkConfig, clearClerkSession } from '../../utils/clerk-config';
import { getDomainInfo, validateClerkDomain } from '../../utils/domain-config';
import { validateEnvironmentKeys, getClerkKeys } from '../../utils/clerk-env-config';
import { validateCurrentDomain, generateTestUrls, testDomainVariants } from '../../utils/domain-test';

export default function ClerkDebugPage() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [configInfo, setConfigInfo] = useState<any>(null);

  useEffect(() => {
    // Verify configuration on page load
    const config = verifyClerkConfig();
    setConfigInfo(config);
  }, []);

  const handleClearSession = () => {
    clearClerkSession();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Clerk Configuration Debug</h1>
        
        {/* Configuration Status */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration Status</h2>
          {configInfo && (
            <div className="space-y-2">
              <p><strong>Publishable Key:</strong> {configInfo.hasPublishableKey ? '✅ Set' : '❌ Missing'}</p>
              <p><strong>Secret Key:</strong> {configInfo.hasSecretKey ? '✅ Set' : '❌ Missing'}</p>
              <p><strong>Key Preview:</strong> {configInfo.publishableKey}</p>
            </div>
          )}
        </div>

        {/* Authentication Status */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Clerk Loaded:</strong> {isLoaded ? '✅ Yes' : '❌ No'}</p>
            <p><strong>User Signed In:</strong> {isSignedIn ? '✅ Yes' : '❌ No'}</p>
            {isSignedIn && (
              <>
                <p><strong>User ID:</strong> {userId}</p>
                <p><strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress}</p>
                <p><strong>Name:</strong> {user?.fullName || user?.firstName || 'Not set'}</p>
              </>
            )}
          </div>
        </div>

        {/* Domain Validation */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Domain Validation</h2>
          {(() => {
            const domainInfo = getDomainInfo();
            const clerkValidation = validateClerkDomain();
            
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Current Environment</h3>
                    <p><strong>Domain:</strong> {domainInfo.currentDomain}</p>
                    <p><strong>Environment:</strong> {domainInfo.environment}</p>
                    <p><strong>Supported:</strong> {domainInfo.isSupported ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>Canonical:</strong> {domainInfo.canonicalDomain}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Clerk Compatibility</h3>
                    <p className={`font-medium ${clerkValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {clerkValidation.isValid ? '✅ Compatible' : '❌ Issues Found'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{clerkValidation.message}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Supported Domains</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Production:</p>
                      <ul className="text-sm text-gray-600 ml-4">
                        {domainInfo.supportedDomains.map((domain, index) => (
                          <li key={index}>• {domain}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Development:</p>
                      <ul className="text-sm text-gray-600 ml-4">
                        <li>• localhost</li>
                        <li>• 127.0.0.1</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {!clerkValidation.isValid && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h4 className="font-medium text-red-800 mb-2">Recommendations:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {clerkValidation.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Environment Key Validation */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Key Validation</h2>
          {(() => {
            const envValidation = validateEnvironmentKeys();
            const currentKeys = getClerkKeys();
            
            return (
              <div className="space-y-4">
                <div className={`p-4 rounded-md ${
                  envValidation.isValid 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center mb-2">
                    <span className={`text-lg ${
                      envValidation.isValid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {envValidation.isValid ? '✅' : '❌'}
                    </span>
                    <h3 className={`ml-2 font-medium ${
                      envValidation.isValid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {envValidation.environment.toUpperCase()} Environment
                    </h3>
                  </div>
                  <p className={`text-sm ${
                    envValidation.isValid ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {envValidation.message}
                  </p>
                  
                  {!envValidation.isValid && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <h4 className="font-medium text-yellow-800 mb-2">🚨 ACTION REQUIRED:</h4>
                      <ol className="text-sm text-yellow-700 space-y-1 ml-4 list-decimal">
                        <li>Go to <a href="https://dashboard.clerk.com" target="_blank" className="underline font-medium">Clerk Dashboard</a></li>
                        <li>Select your "Techgetafrica" app</li>
                        <li>Switch to <strong>"Development"</strong> environment (top-left dropdown)</li>
                        <li>Go to "Developers" → "API Keys"</li>
                        <li>Copy the development keys and update your .env.local file</li>
                      </ol>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Current Keys</h4>
                    <p className="text-sm text-gray-600">Publishable: {currentKeys.publishableKey.substring(0, 15)}...</p>
                    <p className="text-sm text-gray-600">Type: {currentKeys.publishableKey.startsWith('pk_test_') ? 'Development' : 'Production'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Required for Localhost</h4>
                    <p className="text-sm text-gray-600">Type: Development keys (pk_test_...)</p>
                    <p className="text-sm text-gray-600">Source: Clerk Dashboard → Development env</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Clerk Configuration */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Clerk URLs & Configuration</h2>
          <div className="space-y-2">
            <p><strong>Frontend API URL:</strong> https://clerk.techgetafrica.com</p>
            <p><strong>Backend API URL:</strong> https://api.clerk.com</p>
            <p><strong>JWKS URL:</strong> https://clerk.techgetafrica.com/.well-known/jwks.json</p>
            <p><strong>Domain Coverage:</strong> Both techgetafrica.com and www.techgetafrica.com</p>
          </div>
        </div>

        {/* Domain Testing */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Domain Testing & URLs</h2>
          {(() => {
            const domainTests = testDomainVariants();
            const testUrls = generateTestUrls();
            
            return (
              <div className="space-y-6">
                {/* Current Domain Status */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Current Domain Status</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p><strong>Host:</strong> {domainTests.currentHost}</p>
                    <p><strong>Environment:</strong> {domainTests.currentTest.environment}</p>
                    <p><strong>Status:</strong> {domainTests.currentTest.status}</p>
                    <p><strong>Expected Keys:</strong> {domainTests.currentTest.clerkExpected}</p>
                  </div>
                </div>
                
                {/* Test URLs */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Test URLs for Both Domains</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Development (localhost)</h4>
                      <div className="space-y-1">
                        <a href={testUrls.development} target="_blank" 
                           className="block text-sm text-blue-600 hover:text-blue-800 underline">
                          🏠 Home: {testUrls.development}
                        </a>
                        <a href={testUrls.debug.local} target="_blank" 
                           className="block text-sm text-blue-600 hover:text-blue-800 underline">
                          🔍 Debug: {testUrls.debug.local}
                        </a>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Production Domains</h4>
                      <div className="space-y-1">
                        <a href={testUrls.production.primary} target="_blank" 
                           className="block text-sm text-green-600 hover:text-green-800 underline">
                          🌐 Primary: {testUrls.production.primary}
                        </a>
                        <a href={testUrls.production.www} target="_blank" 
                           className="block text-sm text-green-600 hover:text-green-800 underline">
                          🌐 WWW: {testUrls.production.www}
                        </a>
                        <a href={testUrls.debug.prod} target="_blank" 
                           className="block text-sm text-green-600 hover:text-green-800 underline">
                          🔍 Debug (Primary): {testUrls.debug.prod}
                        </a>
                        <a href={testUrls.debug.www} target="_blank" 
                           className="block text-sm text-green-600 hover:text-green-800 underline">
                          🔍 Debug (WWW): {testUrls.debug.www}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Browser Extension Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">📢 About Browser Extension Warnings</h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    If you see React Router warnings in the console, they're from browser extensions, not your app.
                  </p>
                  <ul className="text-xs text-yellow-600 space-y-1 ml-4 list-disc">
                    <li>"v7_startTransition" and "v7_relativeSplatPath" warnings are from extensions</li>
                    <li>Your Next.js app uses its own routing system, not React Router</li>
                    <li>These warnings don't affect your application functionality</li>
                    <li>You can safely ignore them or disable the browser extension</li>
                  </ul>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Actions</h2>
          <div className="space-y-4">
            <button
              onClick={handleClearSession}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Clear All Clerk Session Data
            </button>
            <p className="text-sm text-gray-600">
              This will clear all Clerk-related localStorage and cookies, then refresh the page.
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Refresh Page
            </button>
            
            <a
              href="/"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

