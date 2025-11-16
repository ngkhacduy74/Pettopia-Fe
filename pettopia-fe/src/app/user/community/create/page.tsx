'use client'
import React, { useMemo, useState } from 'react';
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

  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    // Validate category
    if (!selectedCategory) {
      newErrors.category = 'Vui lòng chọn một danh mục';
    }
    
    // Validate title
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Vui lòng nhập tiêu đề bài viết';
    } else if (trimmedTitle.length < 10) {
      newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự';
    } else if (trimmedTitle.length > 200) {
      newErrors.title = 'Tiêu đề không được vượt quá 200 ký tự';
    }
    
    // Validate content
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      newErrors.content = 'Vui lòng nhập nội dung bài viết';
    } else if (trimmedContent.length < 20) {
      newErrors.content = 'Nội dung phải có ít nhất 20 ký tự';
    } else if (trimmedContent.length > 10000) {
      newErrors.content = 'Nội dung không được vượt quá 10,000 ký tự';
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
      setErrors({});
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (token) communicationService.setToken(token);

      const finalTags = [selectedCategory];

      const post = await communicationService.createPost({
        user_id: currentUserId || undefined,
        title: title.trim(),
        content: content.trim(),
        tags: finalTags,
        imageFiles,
      });

      alert('Đăng bài thành công');
      router.push('/user/community');
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
         {/* Error Summary */}
         {/* {Object.keys(errors).length > 0 && (
           <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
             <div className="flex items-start">
               <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
               </svg>
               <div>
                 <h3 className="text-red-800 font-semibold mb-1">Vui lòng kiểm tra lại thông tin</h3>
                 <ul className="text-sm text-red-700 space-y-1">
                   {errors.category && <li>• {errors.category}</li>}
                   {errors.title && <li>• {errors.title}</li>}
                   {errors.content && <li>• {errors.content}</li>}
                 </ul>
               </div>
             </div>
           </div>
         )} */}
         
         <div className="space-y-6">
           {/* Category Selection */}
           <div className={`bg-white rounded-xl shadow-sm border p-6 ${errors.category ? 'border-red-300 ring-2 ring-red-200' : 'border-teal-100'}`}>
             <label className="block text-sm font-semibold text-gray-900 mb-3">
               Chọn danh mục <span className="text-red-500">*</span>
             </label>
             {errors.category && (
               <p className="text-red-600 text-sm mb-3 flex items-center">
                 <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                 </svg>
                 {errors.category}
               </p>
             )}
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
               {categories.map((cat) => (
                 <button
                   key={cat.id}
                   type="button"
                   onClick={() => {
                     setSelectedCategory(cat.id);
                     setErrors(prev => ({...prev, category: undefined}));
                   }}
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
           <div className={`bg-white rounded-xl shadow-sm border p-6 ${errors.title ? 'border-red-300 ring-2 ring-red-200' : 'border-teal-100'}`}>
             <label className="block text-sm font-semibold text-gray-900 mb-3">
               Tiêu đề <span className="text-red-500">*</span>
             </label>
             {errors.title && (
               <p className="text-red-600 text-sm mb-3 flex items-center">
                 <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                 </svg>
                 {errors.title}
               </p>
             )}
             <input
               type="text"
               value={title}
               onChange={(e) => {
                 setTitle(e.target.value);
                 if (e.target.value.trim() && errors.title) {
                   setErrors(prev => ({...prev, title: undefined}));
                 }
               }}
               placeholder="Nhập tiêu đề bài viết..."
               className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                 errors.title 
                   ? 'border-red-300 focus:ring-red-500' 
                   : 'border-gray-200 focus:ring-teal-500'
               }`}
             />
             <div className="mt-2 text-sm text-gray-500">
               {title.length}/200 ký tự
             </div>
           </div>

           {/* Content */}
           <div className={`bg-white rounded-xl shadow-sm border p-6 ${errors.content ? 'border-red-300 ring-2 ring-red-200' : 'border-teal-100'}`}>
             <label className="block text-sm font-semibold text-gray-900 mb-3">
               Nội dung <span className="text-red-500">*</span>
             </label>
             {errors.content && (
               <p className="text-red-600 text-sm mb-3 flex items-center">
                 <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                 </svg>
                 {errors.content}
               </p>
             )}
             <textarea
               value={content}
               onChange={(e) => {
                 setContent(e.target.value);
                 if (e.target.value.trim() && errors.content) {
                   setErrors(prev => ({...prev, content: undefined}));
                 }
               }}
               placeholder="Viết nội dung bài viết của bạn..."
               rows={10}
               className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
                 errors.content
                   ? 'border-red-300 focus:ring-red-500'
                   : 'border-gray-200 focus:ring-teal-500'
               }`}
             />
             <div className="mt-2 text-sm text-gray-500">
               {content.length}/10,000 ký tự
             </div>
           </div>

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