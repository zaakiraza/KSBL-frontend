import { useState, type ChangeEvent } from 'react';
import { useApp } from '../context/AppContext';
import type { Quiz, QuizQuestion } from '../context/AppContext';
import QuestionBuilder from './QuestionBuilder';
import type React from 'react';

type ComplexityLevel = 'easy' | 'medium' | 'hard';
type MarksType = 'equal' | 'custom';

const initialQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    remark: '',
  },
];

const normalizeQuestions = (payload: unknown): QuizQuestion[] => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const response = payload as { questions?: unknown[] };
  const questionsList = Array.isArray(response.questions) ? response.questions : [];

  return questionsList
    .map((question) => {
      if (!question || typeof question !== 'object') {
        return null;
      }

      const q = question as {
        questionId?: string;
        stem?: string;
        type?: string;
        options?: Array<{ optionId?: string; text?: string }>;
        correctOptionId?: string;
        trueFalseCorrect?: boolean;
        blanks?: Array<{ blankId?: string; correctAnswers?: string[] }>;
        shortAnswerReferenceAnswers?: string[];
        rationale?: string;
      };

      const stem = q.stem?.toString() || '';
      const type = q.type?.toString().toLowerCase() || 'mcq';
      const remark = q.rationale?.toString() || '';

      let options: string[] = [];
      let correctAnswer = 0;

      if (type === 'mcq' && Array.isArray(q.options)) {
        options = q.options.map((opt) => opt.text?.toString() || '');
        const correctIdx = q.options.findIndex((opt) => opt.optionId === q.correctOptionId);
        correctAnswer = correctIdx >= 0 ? correctIdx : 0;
      } else if (type === 'true_false') {
        options = ['True', 'False'];
        correctAnswer = q.trueFalseCorrect === true ? 0 : 1;
      } else if (type === 'fitb' && Array.isArray(q.blanks) && q.blanks.length > 0) {
        const blank = q.blanks[0];
        const answers = Array.isArray(blank.correctAnswers) ? blank.correctAnswers : [];
        options = answers.length > 0 ? answers : ['[blank]'];
        correctAnswer = 0;
      } else if (type === 'short_answer') {
        const answers = Array.isArray(q.shortAnswerReferenceAnswers) ? q.shortAnswerReferenceAnswers : [];
        options = answers.length > 0 ? answers : ['[short answer]'];
        correctAnswer = 0;
      } else {
        options = ['Option 1', 'Option 2'];
        correctAnswer = 0;
      }

      return {
        id: q.questionId?.toString() || Math.random().toString(36).slice(2, 10),
        question: stem,
        options,
        correctAnswer,
        remark,
      } satisfies QuizQuestion;
    })
    .filter((question): question is QuizQuestion => Boolean(question));
};

const QuizFactory: React.FC = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL ?? '';
  const { currentUser, addQuiz } = useApp();
  const [formData, setFormData] = useState({
    topicName: '',
    expiresAt: '',
    questionCount: 5,
    marksType: 'equal' as MarksType,
    equalMarksPerQuestion: 10,
    complexityLevel: 'medium' as ComplexityLevel,
    maxAttempts: 2,
    duration: 30,
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: ['questionCount', 'equalMarksPerQuestion', 'maxAttempts', 'duration'].includes(name)
        ? parseInt(value, 10)
        : value,
    }));
  };

  const handlePdfChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setError('');
    setSuccessMessage('');
    setPdfFile(file);
  };

  const handleAddQuestion = () => {
    setQuestions((previous) => [
      ...previous,
      {
        id: Math.random().toString(36).slice(2, 10),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        remark: '',
      },
    ]);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions((previous) => previous.filter((question) => question.id !== id));
  };

  const handleQuestionChange = (id: string, updatedQuestion: QuizQuestion) => {
    setQuestions((previous) => previous.map((question) => (question.id === id ? updatedQuestion : question)));
  };

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');

    if (!formData.topicName.trim()) {
      setError('Topic name is required');
      return;
    }

    if (!formData.expiresAt.trim()) {
      setError('Expiry date is required');
      return;
    }

    if (!pdfFile) {
      setError('Please upload a PDF file');
      return;
    }

    if (formData.questionCount < 1) {
      setError('Question count must be at least 1');
      return;
    }

    setLoading(true);

    try {
      const requestFormData = new FormData();
      requestFormData.append('classId', 'class_001');
      requestFormData.append('topicName', formData.topicName);
      requestFormData.append('expiresAt', new Date(formData.expiresAt).toISOString());
      requestFormData.append('questionCount', formData.questionCount.toString());
      requestFormData.append('marksType', formData.marksType);
      requestFormData.append('equalMarksPerQuestion', formData.equalMarksPerQuestion.toString());
      requestFormData.append('complexityLevel', formData.complexityLevel);
      requestFormData.append('maxAttempts', formData.maxAttempts.toString());
      requestFormData.append('file', pdfFile);

      const headers: Record<string, string> = {};
      const token = localStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${baseUrl}/api/quiz`, {
        method: 'POST',
        headers,
        body: requestFormData,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Quiz creation failed');
      }

      const responseData = (await response.json().catch(() => ({}))) as unknown;
      const apiQuestions = normalizeQuestions(responseData);

      if (apiQuestions.length === 0) {
        throw new Error('Quiz created, but no questions were returned.');
      }

      const quizIdFromResponse = (responseData as { quizId?: string }).quizId;

      const newQuiz: Quiz = {
        id: quizIdFromResponse || Math.random().toString(36).slice(2, 10),
        title: formData.topicName,
        chapter: 'API Generated',
        topic: formData.topicName,
        totalQuestions: apiQuestions.length,
        duration: formData.duration,
        questions: apiQuestions,
        createdBy: currentUser?.username || 'Anonymous',
        published: false,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(formData.expiresAt).toISOString(),
        marksType: formData.marksType,
        equalMarksPerQuestion: formData.equalMarksPerQuestion,
        complexityLevel: formData.complexityLevel,
        maxAttempts: formData.maxAttempts,
      };

      addQuiz(newQuiz);
      setSuccessMessage('Quiz created successfully. Check Manage Quizzes to publish it.');
      setQuestions(initialQuestions);
      setPdfFile(null);
      setFormData({
        topicName: '',
        expiresAt: '',
        questionCount: 5,
        marksType: 'equal',
        equalMarksPerQuestion: 10,
        complexityLevel: 'medium',
        maxAttempts: 2,
        duration: 30,
      });
    } catch (quizError) {
      const message = quizError instanceof Error ? quizError.message : 'Quiz creation failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="card space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Quiz</h2>
          <p className="text-sm text-gray-600">Upload a PDF file to generate quiz questions automatically.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">PDF File</label>
            <input type="file" accept="application/pdf" onChange={handlePdfChange} className="input-field" />
            {pdfFile && <p className="mt-2 text-xs text-gray-500">Selected: {pdfFile.name}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Topic Name</label>
            <input
              type="text"
              name="topicName"
              value={formData.topicName}
              onChange={handleChange}
              placeholder="Introduction to Machine Learning"
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Expires At</label>
            <input
              type="datetime-local"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Question Count</label>
            <input
              type="number"
              name="questionCount"
              min={1}
              value={formData.questionCount}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Marks Type</label>
            <select name="marksType" value={formData.marksType} onChange={handleChange} className="input-field">
              <option value="equal">Equal</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Marks Per Question</label>
            <input
              type="number"
              name="equalMarksPerQuestion"
              min={1}
              value={formData.equalMarksPerQuestion}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Complexity Level</label>
            <select
              name="complexityLevel"
              value={formData.complexityLevel}
              onChange={handleChange}
              className="input-field"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Max Attempts</label>
            <input
              type="number"
              name="maxAttempts"
              min={1}
              value={formData.maxAttempts}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Duration Minutes</label>
            <input
              type="number"
              name="duration"
              min={5}
              value={formData.duration}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Questions ({questions.length})</h2>
            <p className="text-sm text-gray-600">Optional fallback questions if the API does not return generated ones.</p>
          </div>
          <button type="button" onClick={handleAddQuestion} className="btn-success">
            + Add Question
          </button>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <QuestionBuilder
              key={question.id}
              index={index + 1}
              question={question}
              onChange={(updatedQuestion) => handleQuestionChange(question.id, updatedQuestion)}
              onRemove={() => handleRemoveQuestion(question.id)}
              canRemove={questions.length > 1}
            />
          ))}
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
      {successMessage && <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-green-700">{successMessage}</div>}

      <div className="flex gap-4">
        <button onClick={handleSubmit} className="btn-primary flex-1" disabled={loading}>
          {loading ? 'Creating Quiz...' : 'Create Quiz'}
        </button>
      </div>
    </div>
  );
};

export default QuizFactory;