import { useState } from 'react';
import { useApp } from '../context/AppContext';
import QuizInterface from './QuizInterface';
import type React from 'react';

const QuizPortal: React.FC = () => {
  const { getPublishedQuizzes } = useApp();
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  const publishedQuizzes = getPublishedQuizzes();

  if (activeQuizId) {
    const quiz = publishedQuizzes.find((q) => q.id === activeQuizId);
    if (quiz) {
      return (
        <QuizInterface
          quiz={quiz}
          onBack={() => setActiveQuizId(null)}
        />
      );
    }
  }

  return (
    <div className="space-y-8">
      <div className="card">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">📋 Available Quizzes</h2>
        <p className="text-gray-600 mb-6">
          Take quizzes to test your knowledge and improve your learning
        </p>

        {publishedQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No quizzes available yet.</p>
            <p className="text-gray-500 text-sm mt-2">
              Check back later when your teachers publish quizzes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publishedQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="border-2 border-blue-200 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition"
              >
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {quiz.chapter} | {quiz.topic}
                  </p>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">📝 Questions:</span>
                    <span className="font-semibold text-gray-900">
                      {quiz.totalQuestions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">⏱️ Duration:</span>
                    <span className="font-semibold text-gray-900">
                      {quiz.duration} minutes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">👨‍🏫 Created by:</span>
                    <span className="font-semibold text-gray-900">
                      {quiz.createdBy}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveQuizId(quiz.id)}
                  className="btn-primary w-full"
                >
                  Start Quiz
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPortal;
