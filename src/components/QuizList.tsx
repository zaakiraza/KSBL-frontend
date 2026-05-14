import React from 'react';
import { useApp } from '../context/AppContext';

const QuizList: React.FC = () => {
  const { quizzes, publishQuiz } = useApp();

  const handlePublish = (quizId: string) => {
    if (window.confirm('Are you sure you want to publish this quiz?')) {
      publishQuiz(quizId);
      alert('Quiz published successfully! Students can now access it.');
    }
  };

  const unpublishedQuizzes = quizzes.filter((q) => !q.published);
  const publishedQuizzes = quizzes.filter((q) => q.published);

  return (
    <div className="space-y-8">
      {/* Unpublished Quizzes */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Drafts ({unpublishedQuizzes.length})
        </h2>

        {unpublishedQuizzes.length === 0 ? (
          <p className="text-gray-600">No draft quizzes yet. Create one to get started!</p>
        ) : (
          <div className="space-y-4">
            {unpublishedQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{quiz.title}</h3>
                    <p className="text-sm text-gray-600">
                      Chapter: {quiz.chapter} | Topic: {quiz.topic}
                    </p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    Draft
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Questions</p>
                    <p className="font-semibold text-gray-900">{quiz.totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">{quiz.duration} min</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handlePublish(quiz.id)}
                  className="btn-success w-full"
                >
                  Publish Quiz
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Published Quizzes */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Published ({publishedQuizzes.length})
        </h2>

        {publishedQuizzes.length === 0 ? (
          <p className="text-gray-600">No published quizzes yet.</p>
        ) : (
          <div className="space-y-4">
            {publishedQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="border border-green-200 rounded-lg p-4 bg-green-50 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{quiz.title}</h3>
                    <p className="text-sm text-gray-600">
                      Chapter: {quiz.chapter} | Topic: {quiz.topic}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Published
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Questions</p>
                    <p className="font-semibold text-gray-900">{quiz.totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">{quiz.duration} min</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Published</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-green-700">
                  ✓ This quiz is now available for students to take
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizList;
