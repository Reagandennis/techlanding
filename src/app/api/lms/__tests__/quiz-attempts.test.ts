/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { POST, GET } from '../quiz-attempts/route'

// Mock the prisma client
const mockPrisma = {
  quiz: {
    findUnique: jest.fn(),
  },
  quizAttempt: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}))

// Mock Clerk authentication
jest.mock('@clerk/nextjs/server', () => ({
  auth: () => ({
    userId: 'test-user-id',
    sessionClaims: {},
  }),
}))

describe('/api/lms/quiz-attempts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/lms/quiz-attempts', () => {
    const mockQuiz = {
      id: 'quiz-1',
      title: 'Test Quiz',
      timeLimit: 30,
      questions: [
        {
          id: 'q1',
          question: 'Test question?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
        },
      ],
    }

    it('should create a new quiz attempt', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue(mockQuiz)
      mockPrisma.quizAttempt.create.mockResolvedValue({
        id: 'attempt-1',
        userId: 'test-user-id',
        quizId: 'quiz-1',
        answers: [],
        score: null,
        completed: false,
        startedAt: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/lms/quiz-attempts', {
        method: 'POST',
        body: JSON.stringify({
          quizId: 'quiz-1',
        }),
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('attempt-1')
      expect(data.quizId).toBe('quiz-1')
      expect(mockPrisma.quiz.findUnique).toHaveBeenCalledWith({
        where: { id: 'quiz-1' },
        include: { questions: true },
      })
      expect(mockPrisma.quizAttempt.create).toHaveBeenCalled()
    })

    it('should return 404 if quiz not found', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/lms/quiz-attempts', {
        method: 'POST',
        body: JSON.stringify({
          quizId: 'nonexistent-quiz',
        }),
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(404)
    })

    it('should return 400 for invalid request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/lms/quiz-attempts', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should handle database errors', async () => {
      mockPrisma.quiz.findUnique.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/lms/quiz-attempts', {
        method: 'POST',
        body: JSON.stringify({
          quizId: 'quiz-1',
        }),
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })
  })

  describe('GET /api/lms/quiz-attempts', () => {
    it('should return user quiz attempts', async () => {
      const mockAttempts = [
        {
          id: 'attempt-1',
          userId: 'test-user-id',
          quizId: 'quiz-1',
          score: 85,
          completed: true,
          completedAt: new Date(),
          quiz: {
            id: 'quiz-1',
            title: 'Test Quiz',
          },
        },
      ]

      mockPrisma.quizAttempt.findMany.mockResolvedValue(mockAttempts)

      const request = new NextRequest('http://localhost:3000/api/lms/quiz-attempts')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].id).toBe('attempt-1')
      expect(mockPrisma.quizAttempt.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-id' },
        include: { quiz: true },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should filter by quiz ID when provided', async () => {
      const mockAttempts = [
        {
          id: 'attempt-1',
          userId: 'test-user-id',
          quizId: 'quiz-1',
          score: 85,
          completed: true,
          quiz: { id: 'quiz-1', title: 'Test Quiz' },
        },
      ]

      mockPrisma.quizAttempt.findMany.mockResolvedValue(mockAttempts)

      const request = new NextRequest('http://localhost:3000/api/lms/quiz-attempts?quizId=quiz-1')
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockPrisma.quizAttempt.findMany).toHaveBeenCalledWith({
        where: { 
          userId: 'test-user-id',
          quizId: 'quiz-1'
        },
        include: { quiz: true },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should handle database errors on GET', async () => {
      mockPrisma.quizAttempt.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/lms/quiz-attempts')
      const response = await GET(request)

      expect(response.status).toBe(500)
    })
  })
})