'use client';

import { useState, useEffect } from 'react';
import Button from '../../../shared/components/ui/Button';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number; // in minutes
  passingScore: number;
  questions: QuizQuestion[];
}

interface QuizAttempt {
  id: string;
  score: number;
  passed: boolean;
  answers: Record<string, number>;
  completedAt: string;
  timeSpent: number;
}

interface QuizComponentProps {
  quiz: Quiz;
  onComplete: (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => void;
  previousAttempts?: QuizAttempt[];
  maxAttempts?: number;
}

export default function QuizComponent({
  quiz,
  onComplete,
  previousAttempts = [],
  maxAttempts = 3
}: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [quizStarted, setQuizStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const canRetake = previousAttempts.length < maxAttempts;
  const bestAttempt = previousAttempts.reduce((best, attempt) => 
    attempt.score > (best?.score || 0) ? attempt : best, 
    null as QuizAttempt | null
  );

  // Timer logic
  useEffect(() => {
    if (!quizStarted || !timeRemaining || showResults) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeRemaining, showResults]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Calculate score
    const correctAnswers = quiz.questions.reduce((count, question) => {
      const userAnswer = answers[question.id];
      return userAnswer === question.correctAnswer ? count + 1 : count;
    }, 0);

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;
    const timeSpent = quiz.timeLimit ? (quiz.timeLimit * 60 - (timeRemaining || 0)) : 0;

    const attempt = {
      score,
      passed,
      answers,
      timeSpent
    };

    setShowResults(true);
    setIsSubmitting(false);
    
    await onComplete(attempt);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (questionIndex: number) => {
    const question = quiz.questions[questionIndex];
    if (!answers.hasOwnProperty(question.id)) return 'unanswered';
    
    if (showResults) {
      return answers[question.id] === question.correctAnswer ? 'correct' : 'incorrect';
    }
    
    return 'answered';
  };

  // Quiz start screen
  if (!quizStarted) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h2>
          {quiz.description && (
            <p className="text-gray-600 mb-6">{quiz.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            {quiz.timeLimit && (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{quiz.timeLimit} min</div>
                <div className="text-sm text-gray-600">Time Limit</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{quiz.passingScore}%</div>
              <div className="text-sm text-gray-600">Passing Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{previousAttempts.length}/{maxAttempts}</div>
              <div className="text-sm text-gray-600">Attempts Used</div>
            </div>
          </div>

          {bestAttempt && (
            <div className={`p-4 rounded-lg mb-6 ${
              bestAttempt.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-center space-x-2 mb-2">
                {bestAttempt.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-semibold ${
                  bestAttempt.passed ? 'text-green-600' : 'text-red-600'
                }`}>
                  Best Score: {bestAttempt.score}%
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {bestAttempt.passed ? 'You have passed this quiz!' : 'You need to score at least ' + quiz.passingScore + '% to pass.'}
              </p>
            </div>
          )}

          {canRetake ? (
            <Button
              onClick={handleStartQuiz}
              size="lg"
              className="w-full md:w-auto"
            >
              {previousAttempts.length === 0 ? 'Start Quiz' : 'Retake Quiz'}
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-red-600 mb-4">
                You have used all {maxAttempts} attempts for this quiz.
              </p>
              {bestAttempt?.passed && (
                <div className="text-green-600">
                  Congratulations! You passed with {bestAttempt.score}%.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Quiz results screen
  if (showResults) {
    const correctAnswers = quiz.questions.reduce((count, question) => {
      return answers[question.id] === question.correctAnswer ? count + 1 : count;
    }, 0);
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {passed ? (
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {passed ? 'Congratulations!' : 'Quiz Complete'}
          </h2>
          
          <div className={`text-4xl font-bold mb-2 ${
            passed ? 'text-green-600' : 'text-red-600'
          }`}>
            {score}%
          </div>
          
          <p className="text-gray-600 mb-4">
            You scored {correctAnswers} out of {totalQuestions} questions correctly.
          </p>

          {passed ? (
            <p className="text-green-600 font-semibold">
              You passed! Well done!
            </p>
          ) : (
            <p className="text-red-600">
              You need {quiz.passingScore}% to pass. {canRetake ? 'You can try again.' : ''}
            </p>
          )}
        </div>

        {/* Question Review */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Review Answers</h3>
          
          {quiz.questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <div key={question.id} className="border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    {index + 1}. {question.question}
                  </h4>
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 ml-2" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 ml-2" />
                  )}
                </div>

                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-3 rounded-lg border ${
                        optionIndex === question.correctAnswer
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : userAnswer === optionIndex && !isCorrect
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        <span>{option}</span>
                        {optionIndex === question.correctAnswer && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                        {userAnswer === optionIndex && !isCorrect && (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {question.explanation && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          {canRetake && !passed && (
            <Button onClick={handleStartQuiz}>
              Retake Quiz
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setQuizStarted(false)}
          >
            Back to Overview
          </Button>
        </div>
      </div>
    );
  }

  // Quiz taking interface
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{quiz.title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>

          {timeRemaining !== null && (
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              timeRemaining < 300 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-medium">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="p-8">
        <h3 className="text-xl font-medium text-gray-900 mb-6">
          {currentQuestion.question}
        </h3>

        <div className="space-y-4 mb-8">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(currentQuestion.id, index)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                answers[currentQuestion.id] === index
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  answers[currentQuestion.id] === index
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-300'
                }`}>
                  {answers[currentQuestion.id] === index && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
                <span className="font-medium text-gray-700">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="text-gray-900">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Question indicators */}
            <div className="hidden md:flex space-x-1">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-red-600 text-white'
                      : getQuestionStatus(index) === 'answered'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button
                onClick={handleNextQuestion}
                disabled={!answers.hasOwnProperty(currentQuestion.id)}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(answers).length < totalQuestions || isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
