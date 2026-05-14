import { useState } from 'react';
import type { Quiz } from '../context/AppContext';
import type React from 'react';

interface QuizResultsProps {
  quiz: Quiz;
  answers: number[];
  score: number;
  totalQuestions: number;
  onBack: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  quiz,
  answers,
  score,
  totalQuestions,
  onBack,
}) => {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const percentage = Math.round((score / totalQuestions) * 100);
  const isPassed = percentage >= 60;

  const toggleQuestion = (index: number) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Score Summary */}
      <div
        className={`card mb-6 ${
          isPassed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
        } text-white`}
      >
        <div className="text-center mb-4">
          <p className="text-lg opacity-90">Your Score</p>
          <h1 className="text-6xl font-bold my-2">
            {score}/{totalQuestions}
          </h1>
          <p className="text-2xl font-semibold">{percentage}%</p>
        </div>

        <div className="text-center">
          {isPassed ? (
            <div>
              <p className="text-2xl font-bold mb-2">🎉 Congratulations!</p>
              <p className="text-lg opacity-90">You have passed the quiz</p>
            </div>
          ) : (
            <div>
              <p className="text-2xl font-bold mb-2">📚 Keep Learning!</p>
              <p className="text-lg opacity-90">You need 60% to pass. Try again!</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-gray-600 text-sm">Correct Answers</p>
          <p className="text-3xl font-bold text-green-600">{score}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 text-sm">Incorrect Answers</p>
          <p className="text-3xl font-bold text-red-600">{totalQuestions - score}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 text-sm">Total Questions</p>
          <p className="text-3xl font-bold text-gray-900">{totalQuestions}</p>
        </div>
      </div>

      {/* Detailed Review */}
      <div className="card mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📖 Detailed Review</h2>

        <div className="space-y-4">
          {quiz.questions.map((question, index) => {
            const studentAnswer = answers[index];
            const correctAnswer = question.correctAnswer;
            const isCorrect = studentAnswer === correctAnswer;

            return (
              <div key={index}>
                <button
                  onClick={() => toggleQuestion(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    isCorrect
                      ? 'bg-green-50 border-green-300 hover:bg-green-100'
                      : 'bg-red-50 border-red-300 hover:bg-red-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isCorrect ? (
                          <span className="text-green-600 font-bold">✓ CORRECT</span>
                        ) : (
                          <span className="text-red-600 font-bold">✗ INCORRECT</span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">
                        Question {index + 1}: {question.question}
                      </p>
                    </div>
                    <span className="text-gray-500 ml-2">
                      {expandedQuestion === index ? '▼' : '▶'}
                    </span>
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedQuestion === index && (
                  <div className={`p-4 border-2 border-t-0 rounded-b-lg ${
                    isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                  }`}>
                    <div className="space-y-3">
                      {/* Options with highlighting */}
                      <div>
                        <p className="font-semibold text-gray-900 mb-2">Options:</p>
                        <div className="space-y-2 ml-2">
                          {question.options.map((option, optIdx) => {
                            const isStudentAnswer = optIdx === studentAnswer;
                            const isCorrectAns = optIdx === correctAnswer;

                            return (
                              <div
                                key={optIdx}
                                className={`p-2 rounded text-sm ${
                                  isCorrectAns
                                    ? 'bg-green-200 text-green-900 font-semibold border-l-4 border-green-600'
                                    : isStudentAnswer && !isCorrect
                                    ? 'bg-red-200 text-red-900 font-semibold border-l-4 border-red-600'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                <span className="font-bold">Option {optIdx + 1}:</span> {option}
                                {isCorrectAns && ' ✓ CORRECT ANSWER'}
                                {isStudentAnswer && !isCorrect && ' ✗ YOUR ANSWER'}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Teacher's Remark */}
                      {!isCorrect && question.remark && (
                        <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                          <p className="font-semibold text-blue-900 mb-1">👨‍🏫 Teacher's Note:</p>
                          <p className="text-blue-800">{question.remark}</p>
                        </div>
                      )}

                      {isCorrect && (
                        <div className="bg-white p-3 rounded border-l-4 border-green-500">
                          <p className="text-green-800">
                            ✓ Great job! You answered this question correctly.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 btn-primary"
        >
          Back to Quizzes
        </button>
      </div>
    </div>
  );
};

export default QuizResults;
