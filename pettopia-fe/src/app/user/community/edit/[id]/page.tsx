'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { communicationService } from '@/services/communication/communicationService';
import { parseJwt } from '@/utils/jwt';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface ValidationErrors {
  title?: string;
  content?: string;
  images?: string;
}

type UploadImage = {
  preview: string;
  file?: File;
  isExisting?: boolean;
  url?: string;
};

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 1 * 1024 * 1024;
const VALID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [images, setImages] = useState<UploadImage[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null), []);
  const currentUserId = useMemo(() => {
    if (!token) return null;
    const decoded = parseJwt(token);
    return decoded?.id ?? null;
  }, [token]);

  useEffect(() => {
    if (token) communicationService.setToken(token);
  }, [token]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        alert('Không tìm thấy bài viết');
        router.replace('/user/community/manage');
        return;
      }
      try {
        setLoading(true);
        const post = await communicationService.getPostDetail(postId as string);
        setTitle(post.title || '');
        setContent(post.content || '');
        const firstTag = Array.isArray(post.tags) && post.tags[0] ? String(post.tags[0]) : '';
        setSelectedCategory(firstTag);
        const normalizedImages = (post.images || []).slice(0, MAX_IMAGES).map((url) => ({
          preview: url,
          url,
          isExisting: true,
        }));
        setImages(normalizedImages);
      } catch (error: any) {
        console.error('Load post error:', error);
        alert(error?.message || 'Không thể tải bài viết để chỉnh sửa');
        router.replace('/user/community/manage');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId, router]);

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.preview && img.file) URL.revokeObjectURL(img.preview);
      });
    };
  }, [images]);

  const categories: Category[] = [
    { id: 'thongbao', name: 'Thông báo', color: 'bg-blue-100 text-blue-600' },
    { id: 'gopy', name: 'Góp ý', color: 'bg-orange-100 text-orange-600' },
    { id: 'tintuc', name: 'Tin tức iNet', color: 'bg-cyan-100 text-cyan-600' },
    { id: 'review', name: 'Review sản phẩm', color: 'bg-purple-100 text-purple-600' },
    { id: 'chiase', name: 'Chia sẻ kiến thức', color: 'bg-green-100 text-green-600' },
    { id: 'tuvan', name: 'Tư vấn cấu hình', color: 'bg-pink-100 text-pink-600' },
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      alert(`Chỉ được tải lên tối đa ${MAX_IMAGES} ảnh`);
      return;
    }
    const incoming = Array.from(files).slice(0, remainingSlots);
    const nextImages: UploadImage[] = [];
    for (const file of incoming) {
      if (!VALID_TYPES.includes(file.type)) {
        alert(`"${file.name}" không phải là ảnh hợp lệ`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`"${file.name}" vượt quá 1MB`);
        continue;
      }
      nextImages.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }
    setImages((prev) => [...prev, ...nextImages]);
    setErrors((prev) => ({ ...prev, images: undefined }));
    event.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed?.file && removed.preview) URL.revokeObjectURL(removed.preview);
      return next;
    });
  };

  const validateForm = () => {
    const validation: ValidationErrors = {};
    if (!title.trim()) validation.title = 'Vui lòng nhập tiêu đề';
    if (title.trim().length < 10) validation.title = 'Tiêu đề ít nhất 10 ký tự';
    if (!content.trim()) validation.content = 'Vui lòng nhập nội dung';
    if (content.trim().length < 20) validation.content = 'Nội dung ít nhất 20 ký tự';
    if (!selectedCategory) validation.content = validation.content || 'Vui lòng chọn danh mục';
    return validation;
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!postId) return;
    try {
      setSubmitting(true);
      const payloadImages: Array<string | File> = images.map((img) => (img.file ? img.file : img.url!)).slice(0, MAX_IMAGES);
      await communicationService.updatePost(postId as string, {
        title: title.trim(),
        content: content.trim(),
        tags: selectedCategory ? [selectedCategory] : undefined,
        images: payloadImages,
      });
      alert('Cập nhật bài viết thành công');
      router.push('/user/community/manage');
    } catch (error: any) {
      console.error('Update post error:', error);
      alert(error?.message || 'Không thể cập nhật bài viết');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" />
          <p className="text-teal-700 font-medium">Đang tải dữ liệu bài viết...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-teal-50 to-white border-b border-teal-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-teal-100 rounded-full transition">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-4xl font-extrabold text-teal-800 mb-2">Chỉnh sửa bài viết</h1>
            <p className="text-gray-600">Cập nhật nội dung và hình ảnh cho bài viết của bạn</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 border-teal-100">
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-4 rounded-lg font-medium transition-all ${
                  selectedCategory === cat.id ? 'bg-teal-600 text-white ring-2 ring-teal-300 shadow-lg' : `${cat.color} hover:shadow-md`
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

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
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="Nhập tiêu đề hấp dẫn..."
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
          />
          <div className="mt-2 text-sm text-gray-500 text-right">{title.length}/200</div>
        </div>

        <div className={`bg-white rounded-xl shadow-sm border p-6 ${errors.content ? 'border-red-300 ring-2 ring-red-200' : 'border-teal-100'}`}>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Nội dung bài viết <span className="text-red-500">*</span>
          </label>
          {errors.content && <p className="text-red-600 text-sm mb-3">{errors.content}</p>}
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
            }}
            rows={12}
            placeholder="Cập nhật nội dung chi tiết tại đây..."
            className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              errors.content ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <div className="mt-2 text-sm text-gray-500 text-right">{content.length}/5,000</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-semibold text-gray-900">
              Hình ảnh <span className="font-normal text-gray-500">(Tối đa 3 ảnh, mỗi ảnh ≤ 1MB)</span>
            </label>
            <span className="text-sm text-gray-600">{images.length}/{MAX_IMAGES}</span>
          </div>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
              images.length >= MAX_IMAGES ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-teal-400'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={images.length >= MAX_IMAGES}
              className="hidden"
              id="image-upload-input"
            />
            <label htmlFor="image-upload-input" className={`block cursor-pointer ${images.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600">{images.length >= MAX_IMAGES ? 'Đã đủ 3 ảnh' : 'Click để chọn ảnh mới'}</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF, WebP - Tối đa 1MB/ảnh</p>
            </label>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              {images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img.preview} alt="" className="w-full h-40 object-cover rounded-lg shadow border" />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {img.isExisting && (
                    <span className="absolute bottom-2 left-2 px-2 py-1 text-xs bg-black/60 text-white rounded">
                      Ảnh hiện có
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button onClick={() => router.back()} className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold shadow hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </>
  );
}

