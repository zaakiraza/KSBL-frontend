import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useApp } from '../context/AppContext';

interface ApiStudent {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  createdBy?: string;
  createdAt?: string;
}

interface StudentsResponse {
  status?: string;
  message?: string;
  data?: ApiStudent[] | { students?: ApiStudent[] };
  students?: ApiStudent[];
}

const StudentManager = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL ?? '';
  const { currentUser, students } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiStudents, setApiStudents] = useState<ApiStudent[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const teacherStudents = useMemo(() => {
    const sourceStudents = apiStudents.length > 0 ? apiStudents : students;

    if (!currentUser) {
      return sourceStudents;
    }

    return sourceStudents.filter((student) => student.createdBy === currentUser.username || !student.createdBy);
  }, [apiStudents, currentUser, students]);

  const authHeaders = () => {
    const token = localStorage.getItem('authToken');

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  const normalizeStudents = (payload: StudentsResponse | ApiStudent[] | unknown): ApiStudent[] => {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (!payload || typeof payload !== 'object') {
      return [];
    }

    const response = payload as StudentsResponse;
    const candidates = [response.data, response.students];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }

      if (candidate && typeof candidate === 'object' && Array.isArray(candidate.students)) {
        return candidate.students;
      }
    }

    return [];
  };

  const loadStudents = async () => {
    if (!baseUrl.trim()) {
      return;
    }

    setListLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/users/students`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(await response.text() || 'Failed to load students');
      }

      const responseData = (await response.json().catch(() => ({}))) as StudentsResponse | ApiStudent[];
      setApiStudents(normalizeStudents(responseData));
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load students';
      setError(message);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    void loadStudents();
  }, [baseUrl]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleAddStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Student name is required');
      return;
    }

    if (!email.trim()) {
      setError('Student email is required');
      return;
    }

    if (!password.trim()) {
      setError('Student password is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/users/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Student registration failed');
      }

      await loadStudents();

      setSuccess('Student added successfully');
      resetForm();
    } catch (studentError) {
      const message = studentError instanceof Error ? studentError.message : 'Student registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Student Manager</h2>
              <p className="text-sm text-gray-600">Add students and keep their credentials in one place.</p>
            </div>
            <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              {listLoading ? 'Loading...' : `${teacherStudents.length} Students`}
            </div>
          </div>

          <form onSubmit={handleAddStudent} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Student Name</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Sara Khan"
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Student Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="student@ksbl.edu"
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Student@123"
                className="input-field"
              />
            </div>

            {error && <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {success && <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Adding Student...' : 'Add New Student'}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900">Added Students</h3>
          <p className="mt-1 text-sm text-gray-600">These accounts can be used to log in as students.</p>

          <div className="mt-5 space-y-3">
            {listLoading ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
                Loading students...
              </div>
            ) : teacherStudents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
                No students added yet.
              </div>
            ) : (
              teacherStudents.map((student) => (
                <div key={student.id ?? student.email ?? student.name} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600">
                      Student
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
                    <span>Password: {student.password}</span>
                    <span>Added: {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentManager;