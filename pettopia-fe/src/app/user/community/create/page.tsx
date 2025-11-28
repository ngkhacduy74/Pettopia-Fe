'use client'
import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { communicationService } from '@/services/communication/communicationService';
import { parseJwt } from '@/utils/jwt';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface ValidationErrors {
  category?: string;
  title?: string;
  content?: string;
  images?: string;
}

export default function CreatePostPage() {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const router = useRouter();

  const categories: Category[] = [
    { id: 'thongbao', name: 'Thông báo', color: 'bg-blue-100 text-blue-600' },
    { id: 'gopy', name: 'Góp ý', color: 'bg-orange-100 text-orange-600' },
    { id: 'tintuc', name: 'Tin tức iNet', color: 'bg-cyan-100 text-cyan-600' },
    { id: 'review', name: 'Review sản phẩm', color: 'bg-purple-100 text-purple-600' },
    { id: 'chiase', name: 'Chia sẻ kiến thức', color: 'bg-green-100 text-green-600' },
    { id: 'tuvan', name: 'Tư vấn cấu hình', color: 'bg-pink-100 text-pink-600' }
  ];

  const MAX_IMAGES = 3;
  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
  const VALID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    const uploadErrors: string[] = [];

    if (imageFiles.length + files.length > MAX_IMAGES) {
      uploadErrors.push(`Chỉ được tải lên tối đa ${MAX_IMAGES} ảnh`);
    }

    Array.from(files).forEach(file => {
      if (!VALID_TYPES.includes(file.type)) {
        uploadErrors.push(`"${file.name}" không phải là ảnh (JPG, PNG, GIF, WebP)`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        uploadErrors.push(`"${file.name}" quá lớn (${(file.size / 1024 / 1024).toFixed(2)}MB) - Tối đa 1MB`);
        return;
      }

      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    if (uploadErrors.length > 0) {
      alert('Lỗi tải ảnh:\n\n' + uploadErrors.join('\n'));
    }

    if (newFiles.length + newFiles.length > MAX_IMAGES) {
      const canAdd = MAX_IMAGES - imageFiles.length;
      newFiles.length = canAdd;
      newPreviews.length = canAdd;
    }

    if (newFiles.length > 0) {
      setImageFiles(prev => [...prev, ...newFiles]);
      setImagePreviews(prev => [...prev, ...newPreviews]);
      setErrors(prev => ({ ...prev, images: undefined }));
    }

    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null), []);
  const currentUserId = useMemo(() => {
    if (!token) return null;
    const decoded = parseJwt(token);
    return decoded?.id ?? null;
  }, [token]);

  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    if (!selectedCategory) newErrors.category = 'Vui lòng chọn danh mục';

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Vui lòng nhập tiêu đề';
    } else if (trimmedTitle.length < 10) {
      newErrors.title = 'Tiêu đề ít nhất 10 ký tự';
    } else if (trimmedTitle.length > 200) {
      newErrors.title = 'Tiêu đề không quá 200 ký tự';
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      newErrors.content = 'Vui lòng nhập nội dung';
    } else if (trimmedContent.length < 15) {
      newErrors.content = 'Nội dung ít nhất 20 ký tự';
    } else if (trimmedContent.length > 5000) {
      newErrors.content = 'Nội dung không quá 5.000 ký tự';
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setSubmitting(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (token) communicationService.setToken(token);

      await communicationService.createPost({
        user_id: currentUserId || undefined,
        title: title.trim(),
        content: content.trim(),
        tags: [selectedCategory],
        imageFiles,
      });

      alert('Đăng bài thành công!');
      router.push('/user/community');
    } catch (e: any) {
      alert(e?.message || 'Đăng bài thất bại, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-50 to-white border-b border-teal-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => window.history.back()} className="p-2 hover:bg-teal-100 rounded-full transition">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-4xl font-extrabold text-teal-800">
              Tạo bài viết mới
            </h1>
          </div>
          <p className="text-gray-600 ml-14">
            Chia sẻ suy nghĩ, góp ý hoặc kiến thức với cộng đồng iNet
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="space-y-8">

          {/* Danh mục */}
          <div className={`bg-white rounded-xl shadow-sm border p-6 ${errors.category ? 'border-red-300 ring-2 ring-red-200' : 'border-teal-100'}`}>
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Danh mục <span className="text-red-500">*</span>
            </label>
            {errors.category && <p className="text-red-600 text-sm mb-3">{errors.category}</p>}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setErrors(prev => ({...prev, category: undefined}));
                  }}
                  className={`p-4 rounded-lg font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-teal-600 text-white ring-2 ring-teal-300 shadow-lg'
                      : `${cat.color} hover:shadow-md`
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tiêu đề */}
          <div className={`bg-white rounded-xl shadow-sm border p-6 ${errors.title ? 'border-red-300 ring-2 ring-red-200' : 'border-teal-100'}`}>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            {errors.title && <p className="text-red-600 text-sm mb-3">{errors.title}</p>}
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors(prev => ({...prev, title: undefined}));
              }}
              placeholder="Nhập tiêu đề hấp dẫn..."
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <div className="mt-2 text-sm text-gray-500 text-right">{title.length}/200</div>
          </div>

          {/* Nội dung */}
          <div className={`bg-white rounded-xl shadow-sm border p-6 ${errors.content ? 'border-red-300 ring-2 ring-red-200' : 'border-teal-100'}`}>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Nội dung bài viết <span className="text-red-500">*</span>
            </label>
            {errors.content && <p className="text-red-600 text-sm mb-3">{errors.content}</p>}
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors(prev => ({...prev, content: undefined}));
              }}
              placeholder="Viết nội dung chi tiết tại đây..."
              rows={12}
              className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.content ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <div className="mt-2 text-sm text-gray-500 text-right">{content.length}/5,000</div>
          </div>

          {/* Ảnh - Tối đa 3 ảnh, mỗi ảnh 1MB */}
          <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-gray-900">
                Hình ảnh <span className="font-normal text-gray-500">(Tối đa 3 ảnh, mỗi ảnh ≤ 1MB)</span>
              </label>
              <span className="text-sm text-gray-600">{imageFiles.length}/3</span>
            </div>

            <div className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
              imageFiles.length >= 3 ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-teal-400'
            }`}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={imageFiles.length >= 3}
                className="hidden"
                id="image-upload"
              />
              <label 
                htmlFor="image-upload"
                className={`block cursor-pointer ${imageFiles.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600">
                  {imageFiles.length >= 3 ? 'Đã đủ 3 ảnh' : 'Click để chọn ảnh'}
                </p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF, WebP - Tối đa 1MB/ảnh</p>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-6">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative group">
                    <img src={src} alt="" className="w-full h-40 object-cover rounded-lg shadow" />
                    <button
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nút bấm */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold shadow hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition`}
            >
              {submitting ? 'Đang đăng...' : 'Đăng bài'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}