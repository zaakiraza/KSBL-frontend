import React from 'react';
import { useApp } from '../context/AppContext';

const TextbookLibrary: React.FC = () => {
  const { textbooks } = useApp();

  // Group textbooks by subject
  const groupedBySubject = textbooks.reduce(
    (acc, book) => {
      if (!acc[book.subject]) {
        acc[book.subject] = [];
      }
      acc[book.subject].push(book);
      return acc;
    },
    {} as Record<string, typeof textbooks>
  );

  const subjects = Object.keys(groupedBySubject).sort();

  return (
    <div className="space-y-8">
      <div className="card">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">📚 Textbook Library</h2>
        <p className="text-gray-600 mb-6">
          Browse and access textbooks uploaded by your teachers
        </p>

        {textbooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No textbooks available yet.</p>
            <p className="text-gray-500 text-sm mt-2">
              Check back later when your teachers upload resources.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {subjects.map((subject) => (
              <div key={subject}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                    {subject.charAt(0)}
                  </span>
                  {subject}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedBySubject[subject].map((book) => (
                    <div
                      key={book.id}
                      className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-blue-500 hover:shadow-lg transition"
                    >
                      <div className="mb-3">
                        <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded p-3 text-center mb-3">
                          <p className="text-sm font-medium opacity-80">Textbook</p>
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg line-clamp-2">
                          {book.title}
                        </h4>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Subject:</span> {book.subject}
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Uploaded by: {book.uploadedBy}
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        {new Date(book.uploadedAt).toLocaleDateString()}
                      </p>

                      <a
                        href={book.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full text-center block"
                      >
                        Open Resource
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextbookLibrary;
