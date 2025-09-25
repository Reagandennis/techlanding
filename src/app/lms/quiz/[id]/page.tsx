
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import QuizComponent from '@/features/education/components/QuizComponent'
import { prisma } from '@/lib/prisma'
import { Quiz, QuizAttempt } from '@prisma/client'

export default function QuizPage() {
  const params = useParams()
  const quizId = params.id as string
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [previousAttempts, setPreviousAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (quizId) {
      fetchQuizData()
    }
  }, [quizId])

  const fetchQuizData = async () => {
    try {
      const response = await fetch(`/api/lms/quiz/${quizId}`)
      if (response.ok) {
        const data = await response.json()
        setQuiz(data.quiz)
        setPreviousAttempts(data.previousAttempts)
      } else {
        setError('Failed to load quiz data.')
      }
    } catch (err) {
      setError('An error occurred while fetching quiz data.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => {
    try {
      const response = await fetch(`/api/lms/quiz/${quizId}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attempt),
      })
      if (response.ok) {
        // Refresh data to show new attempt
        fetchQuizData()
      } else {
        alert('Failed to submit quiz attempt.')
      }
    } catch (error) {
      console.error('Error submitting quiz attempt:', error)
      alert('An error occurred while submitting your attempt.')
    }
  }

  if (loading) {
    return <div>Loading quiz...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (!quiz) {
    return <div>Quiz not found.</div>
  }

  return (
    <div className="container mx-auto py-8">
      <QuizComponent
        quiz={quiz}
        onComplete={handleComplete}
        previousAttempts={previousAttempts}
      />
    </div>
  )
}
