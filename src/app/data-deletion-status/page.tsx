import React from 'react';

export default function DataDeletionStatus() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Data Deletion Request</h1>
          <p className="text-zinc-400">Instagram Data Deletion Status</p>
        </div>

        <div className="bg-zinc-900 p-8 rounded-lg">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Request Received</h2>
            <p className="text-zinc-300 mb-4">
              Your Instagram data deletion request has been received and processed.
            </p>
            <p className="text-zinc-400 text-sm">
              Any Instagram-related data associated with your account has been removed from our systems 
              in compliance with data protection regulations.
            </p>
          </div>

          <div className="border-t border-zinc-700 pt-6">
            <p className="text-zinc-400 text-sm">
              If you have any questions about data deletion, please contact us at{' '}
              <a href="mailto:privacy@baguri.ro" className="text-white underline">
                privacy@baguri.ro
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 