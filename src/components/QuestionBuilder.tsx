import type React from 'react';
import type { QuizQuestion } from '../context/AppContext';

interface QuestionBuilderProps {
  index: number;
  question: QuizQuestion;
  onChange: (question: QuizQuestion) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  index,
  question,
  onChange,
  onRemove,
  canRemove,
}) => {
  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...question,
      question: e.target.value,
    });
  };

  const handleOptionChange = (optionIndex: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    onChange({
      ...question,
      options: newOptions,
    });
  };

  const handleCorrectAnswerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...question,
      correctAnswer: parseInt(e.target.value),
    });
  };

  const handleRemarkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...question,
      remark: e.target.value,
    });
  };

  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg text-gray-900">Question {index}</h3>
        {canRemove && (
          <button
            onClick={onRemove}
            className="btn-danger py-1 px-3 text-sm"
          >
            Remove
          </button>
        )}
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Text
        </label>
        <textarea
          value={question.question}
          onChange={handleQuestionChange}
          placeholder="Enter the question here..."
          rows={3}
          className="input-field"
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {question.options.map((option, idx) => (
          <div key={idx}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Option {idx + 1}
            </label>
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
              className="input-field"
            />
          </div>
        ))}
      </div>

      {/* Correct Answer */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correct Answer
        </label>
        <select
          value={question.correctAnswer}
          onChange={handleCorrectAnswerChange}
          className="input-field"
        >
          {question.options.map((_, idx) => (
            <option key={idx} value={idx}>
              Option {idx + 1}
            </option>
          ))}
        </select>
      </div>

      {/* Remark */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teacher's Remark (for incorrect attempts)
        </label>
        <textarea
          value={question.remark}
          onChange={handleRemarkChange}
          placeholder="e.g., See Chapter 5, Page 23 for reference"
          rows={2}
          className="input-field"
        />
      </div>
    </div>
  );
};

export default QuestionBuilder;
