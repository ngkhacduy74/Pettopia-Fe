'use client'
import React, { useState } from 'react';

interface Category {
  id: string;
  name: string;
  color: string;
}

export default function CreatePostPage() {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const categories: Category[] = [
    { id: 'thongbao', name: 'Thông báo', color: 'bg-blue-100 text-blue-600' },
    { id: 'gopy', name: 'Góp ý', color: 'bg-orange-100 text-orange-600' },
    { id: 'tintuc', name: 'Tin tức iNet', color: 'bg-cyan-100 text-cyan-600' },
    { id: 'review', name: 'Review sản phẩm', color: 'bg-purple-100 text-purple-600' },
    { id: 'chiase', name: 'Chia sẻ kiến thức', color: 'bg-green-100 text-green-600' },
    { id: 'tuvan', name: 'Tư vấn cấu hình', color: 'bg-pink-100 text-pink-600' }
  ];

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    console.log({
      title,
      content,
      category: selectedCategory,
      tags,
      images
    });
    // Handle submission
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

           {/* Tags */}
           <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-6">
             <label className="block text-sm font-semibold text-gray-900 mb-3">
               Thẻ tag
             </label>
             <div className="flex gap-2 mb-3">
               <input
                 type="text"
                 value={tagInput}
                 onChange={(e) => setTagInput(e.target.value)}
                 onKeyPress={(e) => {
                   if (e.key === 'Enter') {
                     e.preventDefault();
                     handleAddTag();
                   }
                 }}
                 placeholder="Thêm thẻ tag..."
                 className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
               />
               <button
                 type="button"
                 onClick={handleAddTag}
                 className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
               >
                 Thêm
               </button>
             </div>
             {tags.length > 0 && (
               <div className="flex flex-wrap gap-2">
                 {tags.map((tag, index) => (
                   <span
                     key={index}
                     className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
                   >
                     {tag}
                     <button
                       type="button"
                       onClick={() => handleRemoveTag(tag)}
                       className="hover:text-teal-900"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                     </button>
                   </span>
                 ))}
               </div>
             )}
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
             {images.length > 0 && (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                 {images.map((img, index) => (
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
               className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold shadow-md hover:shadow-lg"
             >
               Đăng bài
             </button>
           </div>
         </div>
       </div>
    </>
  );
}