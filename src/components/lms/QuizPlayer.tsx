'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Trophy,
  RotateCcw,
  Send,
  BookOpen,
  Target,
  Award
} from 'lucide-react';

interface Question {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  questionText: string;
  explanation?: string;
  points: number;
  order: number;
  options?: any; // JSON object for multiple choice options
  correctAnswer?: string;
  imageUrl?: string;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number; // in minutes
  maxAttempts: number;
  passingScore: number;
  totalPoints: number;
  isPublished: boolean;
  instructions?: string;
  questions: Question[];
}

interface QuizAttempt {
  id?: string;
  attemptNumber: number;
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  startedAt: Date;
  completedAt?: Date;
  timeSpent?: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'SUBMITTED' | 'GRADED';
  answers: { [questionId: string]: string };
}

interface QuizPlayerProps {
  quiz: Quiz;
  courseId: string;
  lessonId?: string;
  previousAttempts?: QuizAttempt[];
  onComplete: (attempt: QuizAttempt) => void;
  onClose: () => void;
  allowRetake?: boolean;
}

export default function QuizPlayer({
  quiz,
  courseId,
  lessonId,
  previousAttempts = [],
  onComplete,
  onClose,
  allowRetake = true,
}: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const canRetake = allowRetake && previousAttempts.length < quiz.maxAttempts;
  const hasReachedMaxAttempts = previousAttempts.length >= quiz.maxAttempts;
  const bestAttempt = previousAttempts.reduce((best, attempt) => 
    !best || attempt.percentage > best.percentage ? attempt : best
  , null as QuizAttempt | null);

  // Timer effect
  useEffect(() => {
    if (quizStarted && !quizCompleted && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            // Time's up - auto submit
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, quizCompleted, timeLeft]);

  const startQuiz = useCallback(() => {
    const attempt: QuizAttempt = {
      attemptNumber: previousAttempts.length + 1,
      score: 0,
      maxScore: quiz.totalPoints,
      percentage: 0,
      isPassed: false,
      startedAt: new Date(),
      status: 'IN_PROGRESS',
      answers: {},
    };
    
    setCurrentAttempt(attempt);
    setQuizStarted(true);
    setAnswers({});
    setCurrentQuestionIndex(0);
  }, [previousAttempts.length, quiz.totalPoints]);

  const handleAnswerChange = useCallback((questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  const calculateScore = useCallback(() => {
    let totalScore = 0;
    const gradedAnswers: { [questionId: string]: boolean } = {};

    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      let isCorrect = false;

      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.type === 'SHORT_ANSWER') {
        // For short answers, do basic comparison (can be enhanced with AI)
        const correctAnswer = question.correctAnswer?.toLowerCase().trim();
        const userAnswerNormalized = userAnswer?.toLowerCase().trim();
        isCorrect = correctAnswer === userAnswerNormalized;
      }
      // Essay questions need manual grading

      if (isCorrect) {
        totalScore += question.points;
      }
      gradedAnswers[question.id] = isCorrect;
    });

    return { totalScore, gradedAnswers };
  }, [quiz.questions, answers]);

  const handleSubmitQuiz = useCallback(async () => {
    if (!currentAttempt) return;

    setIsSubmitting(true);
    const { totalScore } = calculateScore();
    const percentage = (totalScore / quiz.totalPoints) * 100;

    const completedAttempt: QuizAttempt = {
      ...currentAttempt,
      score: totalScore,
      percentage,
      isPassed: percentage >= quiz.passingScore,
      completedAt: new Date(),
      timeSpent: Math.floor((new Date().getTime() - currentAttempt.startedAt.getTime()) / 1000),
      status: 'COMPLETED',
      answers,
    };

    try {
      // Submit to API
      const response = await fetch('/api/lms/quiz/attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: quiz.id,
          courseId,
          lessonId,
          attempt: completedAttempt,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        completedAttempt.id = result.id;
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }

    setCurrentAttempt(completedAttempt);
    setQuizCompleted(true);
    setShowResults(true);
    setIsSubmitting(false);
    onComplete(completedAttempt);
  }, [currentAttempt, calculateScore, quiz, courseId, lessonId, answers, onComplete]);

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderMultipleChoice = (question: Question) => {
    const options = question.options || {};
    const userAnswer = answers[question.id];

    return (
      <div className="space-y-3">
        {Object.entries(options).map(([key, value]) => (
          <label
            key={key}
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              userAnswer === key 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name={`question_${question.id}`}
              value={key}
              checked={userAnswer === key}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
              userAnswer === key 
                ? 'border-blue-500 bg-blue-500' 
                : 'border-gray-300'
            }`}>
              {userAnswer === key && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <span className="text-gray-900">{value as string}</span>
          </label>
        ))}
      </div>
    );
  };

  const renderTrueFalse = (question: Question) => {
    const userAnswer = answers[question.id];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['true', 'false'].map((option) => (
          <label
            key={option}
            className={`flex items-center justify-center p-6 border-2 rounded-lg cursor-pointer transition-all ${
              userAnswer === option
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name={`question_${question.id}`}
              value={option}
              checked={userAnswer === option}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="sr-only"
            />
            <div className="text-center">
              <div className={`w-8 h-8 rounded-full border-2 mx-auto mb-2 flex items-center justify-center ${
                userAnswer === option
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300'
              }`}>
                {userAnswer === option && (
                  <CheckCircle className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="text-lg font-medium capitalize">{option}</span>
            </div>
          </label>
        ))}
      </div>
    );
  };

  const renderShortAnswer = (question: Question) => {
    const userAnswer = answers[question.id] || '';

    return (
      <div>
        <textarea
          value={userAnswer}
          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          placeholder="Type your answer here..."
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
          rows={4}
        />
        <p className="text-sm text-gray-500 mt-2">
          {userAnswer.length}/500 characters
        </p>
      </div>
    );
  };

  const renderEssay = (question: Question) => {
    const userAnswer = answers[question.id] || '';

    return (
      <div>
        <textarea
          value={userAnswer}
          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          placeholder="Write your essay here..."
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
          rows={8}
        />
        <p className="text-sm text-gray-500 mt-2">
          {userAnswer.length}/2000 characters
        </p>
      </div>
    );
  };

  // Pre-quiz screen
  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
                {quiz.description && (
                  <p className="text-blue-100">{quiz.description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Quiz Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{quiz.questions.length}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              
              {quiz.timeLimit && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{quiz.timeLimit}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
              )}
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{quiz.passingScore}%</div>
                <div className="text-sm text-gray-600">Passing Score</div>
              </div>
            </div>

            {/* Instructions */}
            {quiz.instructions && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-900 mb-2">Instructions</h3>
                <p className="text-yellow-800">{quiz.instructions}</p>
              </div>
            )}

            {/* Previous Attempts */}
            {previousAttempts.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Previous Attempts</h3>
                <div className="space-y-2">
                  {previousAttempts.map((attempt, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">Attempt {attempt.attemptNumber}</span>
                        <span className="text-gray-600 ml-2">
                          {attempt.percentage.toFixed(1)}% 
                          {attempt.isPassed ? (
                            <CheckCircle className="w-4 h-4 text-green-500 inline ml-1" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 inline ml-1" />
                          )}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : 'In Progress'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              
              {hasReachedMaxAttempts ? (
                <div className="text-center">
                  <p className="text-red-600 font-medium">Maximum attempts reached</p>
                  {bestAttempt && (
                    <p className="text-sm text-gray-600">
                      Best score: {bestAttempt.percentage.toFixed(1)}%
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={startQuiz}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Start Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults && currentAttempt) {
    const { gradedAnswers } = calculateScore();
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Results Header */}
          <div className={`p-6 text-white ${
            currentAttempt.isPassed ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'
          }`}>
            <div className="text-center">
              <div className="mb-4">
                {currentAttempt.isPassed ? (
                  <Trophy className="w-16 h-16 mx-auto" />
                ) : (
                  <AlertCircle className="w-16 h-16 mx-auto" />
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {currentAttempt.isPassed ? 'Congratulations!' : 'Keep Trying!'}
              </h1>
              <p className="text-xl">
                You scored {currentAttempt.percentage.toFixed(1)}%
              </p>
              <p className="text-sm opacity-90">
                {currentAttempt.score} out of {currentAttempt.maxScore} points
              </p>
            </div>
          </div>

          <div className="p-6">
            {/* Score Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{currentAttempt.score}</div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{currentAttempt.percentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Percentage</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {currentAttempt.timeSpent ? Math.floor(currentAttempt.timeSpent / 60) : 0}
                </div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
            </div>

            {/* Question Review */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Question Review</h3>
              <div className="space-y-4">
                {quiz.questions.map((question, index) => {
                  const userAnswer = answers[question.id];
                  const isCorrect = gradedAnswers[question.id];
                  
                  return (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          Question {index + 1}: {question.questionText}
                        </h4>
                        <div className="flex items-center ml-2">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="ml-1 text-sm text-gray-600">
                            {question.points} pts
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        Your answer: <span className="font-medium">{userAnswer || 'No answer'}</span>
                      </div>
                      
                      {question.type !== 'ESSAY' && question.correctAnswer && (
                        <div className="text-sm text-green-600 mb-2">
                          Correct answer: <span className="font-medium">{question.correctAnswer}</span>
                        </div>
                      )}
                      
                      {question.explanation && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-blue-800">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Continue Learning
              </button>
              
              {canRetake && !currentAttempt.isPassed && (
                <button
                  onClick={() => {
                    setQuizStarted(false);
                    setQuizCompleted(false);
                    setShowResults(false);
                    setCurrentAttempt(null);
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz interface
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Quiz Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="font-semibold text-gray-900">{quiz.title}</h2>
              <span className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {timeLeft !== null && (
                <div className={`flex items-center ${timeLeft < 300 ? 'text-red-600' : 'text-gray-600'}`}>
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="font-mono font-medium">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-6">
          {/* Question */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-medium text-gray-900 leading-relaxed">
                {currentQuestion.questionText}
              </h3>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {currentQuestion.points} pts
              </span>
            </div>
            
            {currentQuestion.imageUrl && (
              <div className="mb-6">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Question illustration"
                  className="max-w-full h-auto rounded-lg border border-gray-200"
                />
              </div>
            )}
            
            {/* Answer Input */}
            <div className="mb-6">
              {currentQuestion.type === 'MULTIPLE_CHOICE' && renderMultipleChoice(currentQuestion)}
              {currentQuestion.type === 'TRUE_FALSE' && renderTrueFalse(currentQuestion)}
              {currentQuestion.type === 'SHORT_ANSWER' && renderShortAnswer(currentQuestion)}
              {currentQuestion.type === 'ESSAY' && renderEssay(currentQuestion)}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            
            <div className="flex items-center space-x-4">
              {showExplanation && currentQuestion.explanation && (
                <button
                  onClick={() => setShowExplanation(false)}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Hide Explanation
                </button>
              )}
              
              {isLastQuestion ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}