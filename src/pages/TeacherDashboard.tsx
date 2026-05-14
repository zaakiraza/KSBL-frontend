import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ResourceManager from '../components/ResourceManager';
import QuizFactory from '../components/QuizFactory';
import QuizList from '../components/QuizList';
import StudentManager from '../components/StudentManager';
import type React from 'react';

type TabType = 'resources' | 'create-quiz' | 'manage-quiz' | 'students';

const TeacherDashboard: React.FC = () => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('resources');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {currentUser?.username}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'resources'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              📚 Resource Manager
            </button>
            <button
              onClick={() => setActiveTab('create-quiz')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'create-quiz'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              ➕ Create Quiz
            </button>
            <button
              onClick={() => setActiveTab('manage-quiz')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'manage-quiz'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              ⚙️ Manage Quizzes
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'students'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              👩‍🎓 Students
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'resources' && <ResourceManager />}
        {activeTab === 'create-quiz' && <QuizFactory />}
        {activeTab === 'manage-quiz' && <QuizList />}
        {activeTab === 'students' && <StudentManager />}
      </main>
    </div>
  );
};

export default TeacherDashboard;
