import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Textbook } from '../context/AppContext';
import type React from 'react';

const ResourceManager: React.FC = () => {
  const { currentUser, textbooks, addTextbook } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    url: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!formData.title.trim() || !formData.subject.trim() || !formData.url.trim()) {
      alert('Please fill all fields');
      return;
    }

    const newTextbook: Textbook = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      subject: formData.subject,
      url: formData.url,
      uploadedBy: currentUser?.username || 'Anonymous',
      uploadedAt: new Date().toISOString(),
    };

    addTextbook(newTextbook);
    setFormData({ title: '', subject: '', url: '' });
    setSuccessMessage('Textbook uploaded successfully!');

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Textbook</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Book Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Mathematics - Class 10"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select Subject</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource URL
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com/textbook.pdf"
              className="input-field"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-6"
          >
            Upload Textbook
          </button>
        </form>

        {successMessage && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            ✓ {successMessage}
          </div>
        )}
      </div>

      {/* Uploaded Books List */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Uploaded Textbooks</h2>
        {textbooks.length === 0 ? (
          <p className="text-gray-600">No textbooks uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {textbooks.map((book) => (
              <div key={book.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                <h3 className="font-semibold text-gray-900 mb-2">{book.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Subject:</span> {book.subject}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Uploaded: {new Date(book.uploadedAt).toLocaleDateString()}
                </p>
                <a
                  href={book.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Open Resource →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceManager;
