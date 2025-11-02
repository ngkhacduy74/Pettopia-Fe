'use client'
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { communicationService } from '@/services/communicationService';
import { parseJwt } from '@/utils/jwt';

interface Category {
  id: string;
  name: string;
  color: string;
}

export default function CreatePostPage() {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const router = useRouter();
  const categories: Category[] = [
    { id: 'thongbao', name: 'Thông báo', color: 'bg-blue-100 text-blue-600' },
    { id: 'gopy', name: 'Góp ý', color: 'bg-orange-100 text-orange-600' },
    { id: 'tintuc', name: 'Tin tức iNet', color: 'bg-cyan-100 text-cyan-600' },
    { id: 'review', name: 'Review sản phẩm', color: 'bg-purple-100 text-purple-600' },
    { id: 'chiase', name: 'Chia sẻ kiến thức', color: 'bg-green-100 text-green-600' },
    { id: 'tuvan', name: 'Tư vấn cấu hình', color: 'bg-pink-100 text-pink-600' }
  ];

  // removed free-tag inputs; categories act as the only tag

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);
      const previews = fileList.map(file => URL.createObjectURL(file));
      setImageFiles(prev => [...prev, ...fileList]);
      setImagePreviews(prev => [...prev, ...previews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null), []);
  const currentUserId = useMemo(() => {
    if (!token) return null;
    const decoded = parseJwt(token);
    return decoded?.id ?? null;
  }, [token]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !selectedCategory) {
      alert('Vui lòng nhập đầy đủ tiêu đề, nội dung và danh mục.');
      return;
    }

    try {
      setSubmitting(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (token) communicationService.setToken(token);

      // Categories act as tags: only send the selected category as the tag
      const finalTags = [selectedCategory];

      const post = await communicationService.createPost({
        user_id: currentUserId || undefined,
        title: title.trim(),
        content: content.trim(),
        tags: finalTags,
        imageFiles,
      });

      alert('Đăng bài thành công');
      router.push('/user/community/mainPage');
    } catch (e: any) {
      console.error('Create post error:', e);
      alert(e?.message || 'Không thể tạo bài viết. Vui lòng thử lại.');
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
             <button 
               onClick={() => window.history.back()}
               className="p-2 hover:bg-teal-100 rounded-full transition-colors"
             >
               <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
               </svg>
             </button>
             <h1 className="text-4xl font-extrabold text-teal-800 tracking-tight">
               Tạo bài viết mới
             </h1>
           </div>
           <p className="text-gray-600 ml-14">
             Chia sẻ suy nghĩ, câu hỏi hoặc kiến thức của bạn với cộng đồng
           </p>
         </div>
       </div>

       {/* Form */}
       <div className="max-w-4xl mx-auto px-6 py-8">
         <div className="space-y-6">
           {/* Category Selection */}
           <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-6">
             <label className="block text-sm font-semibold text-gray-900 mb-3">
               Chọn danh mục <span className="text-red-500">*</span>
             </label>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
               {categories.map((cat) => (
                 <button
                   key={cat.id}
                   type="button"
                   onClick={() => setSelectedCategory(cat.id)}
                   className={`p-3 rounded-lg transition-all ${
                     selectedCategory === cat.id
                       ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-300'
                       : `${cat.color} hover:shadow-md`
                   }`}
                 >
                   <span className="font-semibold text-sm">{cat.name}</span>
                 </button>
               ))}
             </div>
           </div>

           {/* Title */}
           <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-6">
             <label className="block text-sm font-semibold text-gray-900 mb-3">
               Tiêu đề <span className="text-red-500">*</span>
             </label>
             <input
               type="text"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               placeholder="Nhập tiêu đề bài viết..."
               className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
             />
           </div>

           {/* Content */}
           <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-6">
             <label className="block text-sm font-semibold text-gray-900 mb-3">
               Nội dung <span className="text-red-500">*</span>
             </label>
             <textarea
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="Viết nội dung bài viết của bạn..."
               rows={10}
               className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
             />
             <div className="mt-2 text-sm text-gray-500">
               {content.length} ký tự
             </div>
           </div>

          {/* Free tag input removed; category is the only tag sent */}

           {/* Image Upload */}
           <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-6">
             <label className="block text-sm font-semibold text-gray-900 mb-3">
               Hình ảnh
             </label>
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-400 transition-colors">
               <input
                 type="file"
                 accept="image/*"
                 multiple
                 onChange={handleImageUpload}
                 className="hidden"
                 id="image-upload"
               />
               <label htmlFor="image-upload" className="cursor-pointer">
                 <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
                 <p className="text-gray-600 mb-1">Click để tải lên hình ảnh</p>
                 <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
               </label>
             </div>
            {imagePreviews.length > 0 && (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {imagePreviews.map((img, index) => (
                   <div key={index} className="relative group">
                     <img
                       src={img}
                       alt={`Upload ${index + 1}`}
                       className="w-full h-32 object-cover rounded-lg"
                     />
                     <button
                       type="button"
                       onClick={() => handleRemoveImage(index)}
                       className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                     </button>
                   </div>
                 ))}
               </div>
             )}
           </div>

           {/* Action Buttons */}
           <div className="flex gap-4 justify-end">
             <button
               type="button"
               onClick={() => window.history.back()}
               className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
             >
               Hủy
             </button>
             <button
               type="button"
               className="px-6 py-3 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-semibold"
             >
               Lưu nháp
             </button>
            <button
               type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-6 py-3 bg-teal-600 text-white rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg ${submitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-teal-700'}`}
             >
              {submitting ? 'Đang đăng...' : 'Đăng bài'}
             </button>
           </div>
         </div>
       </div>
    </>
  );
}