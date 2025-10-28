'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Flag,
  Timer,
  Brain,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Question {
  id: string
  question: string
  type: 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'TRUE_FALSE' | 'SHORT_ANSWER'
  options?: string[]
  points: number
  order: number
}

interface Quiz {
  id: string
  title: string
  description: string
  timeLimit?: number
  passingScore: number
  maxAttempts: number
  showResultsImmediately: boolean
}

interface QuizAttempt {
  id: string
  startedAt: string
  answers: Record<string, any>
}

interface QuizResults {
  score: number
  passed: boolean
  correctAnswers: number
  totalQuestions: number
  timeSpent: number
  details?: Array<{
    questionId: string
    question: string
    userAnswer: any
    correctAnswer: any
    isCorrect: boolean
    points: number
    explanation?: string
  }>
}

interface QuizTakerProps {
  quizId: string
  onComplete?: () => void
}

export default function QuizTaker({ quizId, onComplete }: QuizTakerProps) {
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<QuizResults | null>(null)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Timer effect
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !results) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev !== null && prev <= 1000) {
            // Auto-submit when time runs out
            handleSubmit()
            return 0
          }
          return prev !== null ? prev - 1000 : null
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [timeRemaining, results])

  // Start quiz attempt
  const startQuizAttempt = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/quizzes/${quizId}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || 'Failed to start quiz')
      }

      const data = await response.json()
      setAttempt(data.attempt)
      setQuestions(data.questions)
      setTimeRemaining(data.timeRemaining)
      
      // Parse existing answers if resuming
      if (data.attempt.answers) {
        const existingAnswers = JSON.parse(data.attempt.answers)
        setAnswers(existingAnswers)
      }
      
    } catch (error) {
      console.error('Failed to start quiz:', error)
      setError(error instanceof Error ? error.message : 'Failed to start quiz')
    } finally {
      setLoading(false)
    }
  }, [quizId])

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${quizId}`)
        if (response.ok) {
          const quizData = await response.json()
          setQuiz(quizData)
        }
      } catch (error) {
        console.error('Failed to load quiz:', error)
      }
    }
    
    loadQuiz()
    startQuizAttempt()
  }, [quizId, startQuizAttempt])

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const toggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const handleSubmit = async () => {
    if (!attempt || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/quizzes/${quizId}/attempt`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: attempt.id,
          answers
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit quiz')
      }

      const data = await response.json()
      setResults(data.results)
      onComplete?.()
      
    } catch (error) {
      console.error('Failed to submit quiz:', error)
      setError('Failed to submit quiz. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    const answeredQuestions = Object.keys(answers).length
    return (answeredQuestions / questions.length) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Timer className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Quiz</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <div className="mb-4">
                {results.passed ? (
                  <Award className="h-16 w-16 text-green-500 mx-auto" />
                ) : (
                  <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {results.passed ? 'Congratulations!' : 'Quiz Complete'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{results.score}%</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {results.correctAnswers}/{results.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.floor(results.timeSpent / 60)}m {results.timeSpent % 60}s
                  </div>
                  <div className="text-sm text-gray-600">Time</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Badge variant={results.passed ? "default" : "destructive"} className="text-lg px-3 py-1">
                    {results.passed ? 'Passed' : 'Failed'}
                  </Badge>
                  <div className="text-sm text-gray-600 mt-1">Status</div>
                </div>
              </div>

              {results.details && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Question Review</h3>
                  {results.details.map((detail, index) => (
                    <Card key={detail.questionId} className="p-4">
                      <div className="flex items-start gap-3">
                        {detail.isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-2">Question {index + 1}: {detail.question}</p>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Your answer: </span>
                              <span className={detail.isCorrect ? 'text-green-600' : 'text-red-600'}>
                                {Array.isArray(detail.userAnswer) 
                                  ? detail.userAnswer.join(', ') 
                                  : detail.userAnswer || 'No answer'
                                }
                              </span>
                            </div>
                            {!detail.isCorrect && (
                              <div>
                                <span className="font-medium text-gray-700">Correct answer: </span>
                                <span className="text-green-600">
                                  {Array.isArray(detail.correctAnswer) 
                                    ? detail.correctAnswer.join(', ') 
                                    : detail.correctAnswer
                                  }
                                </span>
                              </div>
                            )}
                            {detail.explanation && (
                              <div className="mt-2 p-2 bg-blue-50 rounded">
                                <span className="font-medium text-blue-800">Explanation: </span>
                                <span className="text-blue-700">{detail.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex justify-center">
                <Button onClick={() => router.back()} size="lg">
                  Back to Course
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!quiz || !questions.length || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading quiz...</p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{quiz.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {timeRemaining !== null && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  timeRemaining < 300000 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  <Clock className="h-4 w-4" />
                  <span className="font-mono font-medium">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                Progress: {Math.round(getProgressPercentage())}%
              </div>
              
              <Progress value={getProgressPercentage()} className="w-24" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">Questions</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`aspect-square rounded text-sm font-medium transition-colors ${
                        index === currentQuestionIndex
                          ? 'bg-blue-600 text-white'
                          : answers[q.id] !== undefined
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : flaggedQuestions.has(q.id)
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                      {flaggedQuestions.has(q.id) && (
                        <Flag className="h-3 w-3 ml-1 inline" />
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-100 rounded"></div>
                    <span>Not answered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Question {currentQuestionIndex + 1}</Badge>
                      <Badge variant="secondary">{currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}</Badge>
                    </div>
                    <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFlagQuestion(currentQuestion.id)}
                    className={flaggedQuestions.has(currentQuestion.id) ? 'text-yellow-600' : 'text-gray-400'}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Question Answers */}
                {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                  <RadioGroup
                    value={answers[currentQuestion.id] || ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  >
                    {currentQuestion.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${currentQuestion.id}-${index}`} />
                        <Label htmlFor={`${currentQuestion.id}-${index}`} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQuestion.type === 'MULTIPLE_SELECT' && (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${currentQuestion.id}-${index}`}
                          checked={(answers[currentQuestion.id] || []).includes(option)}
                          onCheckedChange={(checked) => {
                            const currentAnswers = answers[currentQuestion.id] || []
                            if (checked) {
                              handleAnswerChange(currentQuestion.id, [...currentAnswers, option])
                            } else {
                              handleAnswerChange(currentQuestion.id, currentAnswers.filter((a: string) => a !== option))
                            }
                          }}
                        />
                        <Label htmlFor={`${currentQuestion.id}-${index}`} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'TRUE_FALSE' && (
                  <RadioGroup
                    value={answers[currentQuestion.id] || ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id={`${currentQuestion.id}-true`} />
                      <Label htmlFor={`${currentQuestion.id}-true`} className="cursor-pointer">True</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id={`${currentQuestion.id}-false`} />
                      <Label htmlFor={`${currentQuestion.id}-false`} className="cursor-pointer">False</Label>
                    </div>
                  </RadioGroup>
                )}

                {currentQuestion.type === 'SHORT_ANSWER' && (
                  <Textarea
                    placeholder="Enter your answer..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="min-h-[100px]"
                  />
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {isLastQuestion ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                      <CheckCircle2 className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}