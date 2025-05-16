import { useState } from 'react';
import FileUploader from '../src/components/ui/FileUploader';

export default function FileUploadTest() {
  const [logoUrl, setLogoUrl] = useState('');
  const userId = 'test-user'; // You can use any string for testing

  return (
    <div style={{ padding: 32 }}>
      <h1>File Upload Test</h1>
      <FileUploader
        bucket="logos"
        userId={userId}
        onUpload={setLogoUrl}
        label="Upload a Logo"
      />
      {logoUrl && (
        <div>
          <p>Uploaded Logo URL:</p>
          <a href={logoUrl} target="_blank" rel="noopener noreferrer">{logoUrl}</a>
          <br />
          <img src={logoUrl} alt="Uploaded Logo" style={{ maxWidth: 200, marginTop: 8 }} />
        </div>
      )}
    </div>
  );
} 