import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import QuizResults from './QuizResults';
import type { Quiz } from '../context/AppContext';
import type React from 'react';

interface QuizInterfaceProps {
  quiz: Quiz;
  onBack: () => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ quiz, onBack }) => {
  const { currentUser, saveAttempt } = useApp();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(quiz.questions.length).fill(-1));
  const [timeRemaining, setTimeRemaining] = useState(quiz.duration * 60); // Convert to seconds
  const [quizFinished, setQuizFinished] = useState(false);
  const [startTime] = useState(new Date());

  // Timer effect
  useEffect(() => {
    if (quizFinished) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setQuizFinished(true);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizFinished]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (!quizFinished) {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = optionIndex;
      setAnswers(newAnswers);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const endTime = new Date();
    const timeTaken = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    // Calculate score
    let score = 0;
    answers.forEach((answer, index) => {
      if (answer === quiz.questions[index].correctAnswer) {
        score++;
      }
    });

    const attempt = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: currentUser?.id || '',
      quizId: quiz.id,
      answers,
      score,
      totalQuestions: quiz.questions.length,
      attemptedAt: new Date().toISOString(),
      timeTaken,
    };

    saveAttempt(attempt);
    setQuizFinished(true);
  };

  if (quizFinished) {
    const score = answers.filter(
      (answer, index) => answer === quiz.questions[index].correctAnswer
    ).length;

    return (
      <QuizResults
        quiz={quiz}
        answers={answers}
        score={score}
        totalQuestions={quiz.questions.length}
        onBack={onBack}
      />
    );
  }

  const question = quiz.questions[currentQuestion];
  const timeColor =
    timeRemaining <= 60 ? 'text-red-600' : timeRemaining <= 300 ? 'text-yellow-600' : 'text-gray-600';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="card mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-blue-100">{quiz.topic}</p>
          </div>
          <div className={`text-3xl font-bold ${timeColor}`}>
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-blue-400 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
            }}
          />
        </div>
        <p className="text-sm text-blue-100 mt-2">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </p>
      </div>

      {/* Question */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {question.question}
        </h2>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                answers[currentQuestion] === index
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion] === index
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-400'
                  }`}
                >
                  {answers[currentQuestion] === index && (
                    <span className="text-white text-sm font-bold">✓</span>
                  )}
                </div>
                <span className="font-medium text-gray-900">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Answer Status */}
        {answers[currentQuestion] !== -1 && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded">
            ✓ Answer selected
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={`flex-1 py-3 rounded-lg font-semibold ${
            currentQuestion === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'btn-secondary'
          }`}
        >
          ← Previous
        </button>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="flex-1 btn-success"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 btn-primary"
          >
            Next →
          </button>
        )}
      </div>

      {/* Question Map */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">Question Navigator</h3>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-full aspect-square rounded text-sm font-semibold transition-colors ${
                currentQuestion === index
                  ? 'bg-blue-600 text-white'
                  : answers[index] !== -1
                  ? 'bg-green-200 text-green-900 hover:bg-green-300'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;
