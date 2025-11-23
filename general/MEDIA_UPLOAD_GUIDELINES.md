# Media Upload Guidelines

## Версия документа: 1.0
**Дата создания:** 23.11.2025

---

## 📋 О документе

Руководство по загрузке и управлению медиа-файлами с использованием Supabase Storage.

**Обязательные требования:**
- Следовать [`SERVER_ACTIONS_GUIDELINES.md`](./SERVER_ACTIONS_GUIDELINES.md)
- Следовать [`docs/guidelines/react/ai_component_guidelines.md`](../react/ai_component_guidelines.md)

---

## I. SUPABASE STORAGE SETUP

```typescript
// lib/storage/supabase.ts

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_REGION!,
  endpoint: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL!,
  credentials: {
    accessKeyId: process.env.SUPABASE_STORAGE_ACCESS_KEY!,
    secretAccessKey: process.env.SUPABASE_STORAGE_SECRET_KEY!,
  },
  forcePathStyle: true,
});

export async function uploadFile(
  file: File,
  bucket: string = 'media'
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );
    
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}/${bucket}/${fileName}`;
    return { success: true, url };
  } catch (error) {
    return { success: false, error: 'Upload failed' };
  }
}
```

---

## II. MEDIA LIBRARY

```typescript
// components/admin/MediaLibrary.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { uploadMediaFile, deleteMediaFile } from '@/actions/media';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const MediaLibrary = ({ initialFiles }) => {
  const [files, setFiles] = useState(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    const result = await uploadMediaFile(formData);
    
    if (result.success) {
      setFiles([result.data, ...files]);
      toast.success('Файл загружен');
    } else {
      toast.error(result.error);
    }
    
    setIsUploading(false);
  };
  
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={isUploading}
      />
      <div className="grid grid-cols-4 gap-4 mt-4">
        {files.map((file) => (
          <div key={file.id} className="relative aspect-square">
            <Image src={file.url} alt={file.alt || ''} fill />
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## III. SERVER ACTION

```typescript
// actions/media.ts
'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { uploadFile } from '@/lib/storage/supabase';

export async function uploadMediaFile(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }
    
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }
    
    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File too large (max 5MB)' };
    }
    
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Only images allowed' };
    }
    
    // Upload to Supabase
    const uploadResult = await uploadFile(file);
    
    if (!uploadResult.success) {
      return uploadResult;
    }
    
    // Save to database
    const mediaFile = await prisma.mediaFile.create({
      data: {
        url: uploadResult.url,
        fileName: file.name,
        fileType: 'IMAGE',
        mimeType: file.type,
        fileSize: file.size,
        uploadedBy: session.user.id,
      },
    });
    
    return { success: true, data: mediaFile };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Upload failed' };
  }
}
```

---

## IV. CHECKLIST

- [ ] **Supabase Storage**
  - [ ] S3 Client настроен
  - [ ] Environment variables установлены
  - [ ] Bucket создан в Supabase

- [ ] **Upload**
  - [ ] Валидация размера файла
  - [ ] Валидация типа файла
  - [ ] Progress indicator
  - [ ] Error handling

- [ ] **Database**
  - [ ] MediaFile модель в Prisma
  - [ ] Метаданные сохраняются
  - [ ] Связь с User

---

**Версия:** 1.0 | **Статус:** ✅ Актуально

