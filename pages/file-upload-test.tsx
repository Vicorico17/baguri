import { useState } from 'react';
import FileUploader from '../src/components/ui/FileUploader';
import Image from "next/image";

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
          <Image src={logoUrl} alt="Uploaded Logo" width={200} height={80} style={{ marginTop: 8, objectFit: 'contain' }} />
        </div>
      )}
    </div>
  );
} 