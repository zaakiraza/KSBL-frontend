import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { demoUsers, type DemoRole } from '../data/demoUsers';

type UserRole = 'teacher' | 'student';
type AuthMode = 'login' | 'register';

interface RegisteredTeacher {
  name: string;
  email: string;
  password: string;
}

interface LoginResponse {
  status?: string;
  message?: string;
  token?: string;
  data?: {
    token?: string;
  };
  role?: UserRole;
  user?: {
    role?: UserRole;
  };
}

const REGISTERED_TEACHER_KEY = 'registeredTeacher';

const Login = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL ?? '';
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, students } = useApp();
  const navigate = useNavigate();

  const getRegisteredTeacher = (): RegisteredTeacher | null => {
    const stored = localStorage.getItem(REGISTERED_TEACHER_KEY);
    return stored ? (JSON.parse(stored) as RegisteredTeacher) : null;
  };

  const saveRegisteredTeacher = (teacher: RegisteredTeacher) => {
    localStorage.setItem(REGISTERED_TEACHER_KEY, JSON.stringify(teacher));
  };

  const fillDemoAccount = (demoRole: DemoRole) => {
    const demoUser = demoUsers.find((user) => user.role === demoRole);
    if (!demoUser) return;

    setAuthMode('login');
    setRole(demoRole);
    setName('');
    setUsername(demoUser.username);
    setPassword(demoUser.password);
    setError('');
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      let apiErrorMessage = '';

      if (baseUrl.trim()) {
        const response = await fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: username,
            password,
            role,
          }),
        });

        if (response.ok) {
          const responseData = (await response.json().catch(() => ({}))) as LoginResponse;
          const apiToken = responseData.data?.token ?? responseData.token;
          const apiRole = responseData.user?.role ?? responseData.role ?? role;

          if (apiToken) {
            localStorage.setItem('authToken', apiToken);
          }

          if (responseData.status === 'success' || apiToken) {
            login(username, apiRole);
            navigate(apiRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
            return;
          }
        } else {
          apiErrorMessage = await response.text();
        }
      }

      const registeredTeacher = getRegisteredTeacher();
      const matchedDemoUser = demoUsers.find((user) => user.username === username && user.password === password);
      const matchedStudent = students.find((student) => student.email === username && student.password === password);
      const matchedRegisteredTeacher =
        registeredTeacher !== null &&
        registeredTeacher.email === username &&
        registeredTeacher.password === password;

      const resolvedRole: UserRole | null = matchedRegisteredTeacher
        ? 'teacher'
        : matchedStudent
          ? 'student'
          : matchedDemoUser?.role ?? null;

      if (!resolvedRole) {
        setError(apiErrorMessage || 'Invalid credentials. Use the demo accounts, a registered teacher, or a teacher-added student account.');
        return;
      }

      login(username, resolvedRole);
      navigate(resolvedRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!username.trim()) {
      setError('Email is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    if (role !== 'teacher') {
      setError('Teacher registration is only available for the teacher role');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email: username,
          password,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Teacher registration failed');
      }

      saveRegisteredTeacher({
        name,
        email: username,
        password,
      });

      login(name, 'teacher');
      navigate('/teacher-dashboard');
    } catch (registrationError) {
      const message = registrationError instanceof Error ? registrationError.message : 'Teacher registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card bg-white shadow-2xl">
          <div className="flex flex-col items-center">
            <img src="/src/assets/learnovaRbg.png" alt="Learnova logo" className="w-36 h-auto mb-4" />
            <p className="text-center text-gray-600 text-sm mb-6">Classroom & Quiz Management System</p>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                role === 'student'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                role === 'teacher'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Teacher
            </button>
          </div>

          {authMode === 'login' && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => fillDemoAccount('teacher')}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                Use Teacher Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('student')}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Use Student Demo
              </button>
            </div>
          )}

          {authMode === 'register' ? (
            <form onSubmit={handleTeacherRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Zakir Raza"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="zaakiraza110@gmail.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="12345678"
                  className="input-field"
                />
              </div>

              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

              <button type="submit" className="w-full btn-primary" disabled={loading}>
                {loading ? 'Registering...' : 'Register Teacher'}
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="w-full text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Back to login
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username / Email</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={`Enter ${role} username`}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={`Enter ${role} password`}
                  className="input-field"
                />
              </div>

              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

              <button type="submit" className="w-full btn-primary">
                Login as {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>

              {role === 'teacher' && (
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="w-full text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Need a teacher account? Register here
                </button>
              )}
            </form>
          )}

          <p className="text-center text-gray-600 text-xs mt-6">
            Teacher demo: teacher@lms.com / teacher123 | Student demo: student@lms.com / student123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
