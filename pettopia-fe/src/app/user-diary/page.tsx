"use client";

import React, { useState, useRef } from 'react';

interface ColumnFormatting {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    color: string;
    fontSize: string;
    fontFamily: string;
    align: 'left' | 'center' | 'right';
}

interface Column {
    id: number;
    content: string;
    images: string[];
    videos: string[];
    formatting: ColumnFormatting;
}

export default function UserDiaryPage() {
    const [showSearch, setShowSearch] = useState<boolean>(false);
    const [showChat, setShowChat] = useState<boolean>(false);
    const [columnCount, setColumnCount] = useState<number>(1);
    const [columns, setColumns] = useState<Column[]>([{ 
        id: 1, 
        content: '', 
        images: [], 
        videos: [],
        formatting: {
            bold: false,
            italic: false,
            underline: false,
            color: '#000000',
            fontSize: '16px',
            fontFamily: 'Arial',
            align: 'left'
        }
    }]);
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

    const handleColumnChange = (newCount: number) => {
        setColumnCount(newCount);
        if (newCount > columns.length) {
            const newColumns = [...columns];
            for (let i = columns.length; i < newCount; i++) {
                newColumns.push({ 
                    id: i + 1, 
                    content: '', 
                    images: [], 
                    videos: [],
                    formatting: {
                        bold: false,
                        italic: false,
                        underline: false,
                        color: '#000000',
                        fontSize: '16px',
                        fontFamily: 'Arial',
                        align: 'left'
                    }
                });
            }
            setColumns(newColumns);
        } else {
            setColumns(columns.slice(0, newCount));
        }
    };

    const handleContentChange = (index: number, value: string) => {
        const newColumns = [...columns];
        newColumns[index].content = value;
        setColumns(newColumns);
    };

    const handleFormatting = (index: number, formatType: keyof ColumnFormatting, value?: string) => {
        const newColumns = [...columns];
        if (formatType === 'bold' || formatType === 'italic' || formatType === 'underline') {
            newColumns[index].formatting[formatType] = !newColumns[index].formatting[formatType];
        } else if (value !== undefined) {
            (newColumns[index].formatting as any)[formatType] = value;
        }
        setColumns(newColumns);
    };

    const handleFileUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const files = Array.from(event.target.files || []);
        const newColumns = [...columns];
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (result && typeof result === 'string') {
                    if (type === 'image') {
                        newColumns[index].images.push(result);
                    } else {
                        newColumns[index].videos.push(result);
                    }
                    setColumns([...newColumns]);
                }
            };
            reader.readAsDataURL(file as Blob);
        });
    };

    const removeMedia = (columnIndex: number, mediaIndex: number, type: 'image' | 'video') => {
        const newColumns = [...columns];
        if (type === 'image') {
            newColumns[columnIndex].images.splice(mediaIndex, 1);
        } else {
            newColumns[columnIndex].videos.splice(mediaIndex, 1);
        }
        setColumns(newColumns);
    };

    const getTextStyle = (formatting: ColumnFormatting) => {
        return {
            fontWeight: formatting.bold ? 'bold' : 'normal',
            fontStyle: formatting.italic ? 'italic' : 'normal',
            textDecoration: formatting.underline ? 'underline' : 'none',
            color: formatting.color,
            fontSize: formatting.fontSize,
            fontFamily: formatting.fontFamily,
            textAlign: formatting.align
        };
    };

    return (
        <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 text-gray-900">Nhật ký Pet</h1>
                        <p className="text-gray-600">Ghi lại những khoảnh khắc đáng nhớ của bạn và thú cưng</p>
                    </div>

                    {/* Toolbar */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-teal-100">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-700">Số cột:</span>
                                <div className="flex gap-2">
                                    {[1, 2, 3].map((count) => (
                                        <button
                                            key={count}
                                            onClick={() => handleColumnChange(count)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                                columnCount === count
                                                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {count} cột
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                    Lưu nháp
                                </button>
                                <button className="px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg font-medium">
                                    Xuất bản
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Editor Area */}
                    <div className={`grid gap-6 ${columnCount === 1 ? 'grid-cols-1' : columnCount === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {columns.map((column, index) => (
                            <div key={column.id} className="bg-white rounded-xl shadow-lg p-6 border border-teal-100">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900">Cột {index + 1}</h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            ref={(el) => { fileInputRefs.current[index * 2] = el; }}
                                            onChange={(e) => handleFileUpload(index, e, 'image')}
                                        />
                                        <button
                                            onClick={() => fileInputRefs.current[index * 2]?.click()}
                                            className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                            title="Thêm ảnh"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            multiple
                                            className="hidden"
                                            ref={(el) => { fileInputRefs.current[index * 2 + 1] = el; }}
                                            onChange={(e) => handleFileUpload(index, e, 'video')}
                                        />
                                        <button
                                            onClick={() => fileInputRefs.current[index * 2 + 1]?.click()}
                                            className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                            title="Thêm video"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Text Formatting Toolbar */}
                                <div className="mb-3 border border-gray-200 rounded-lg p-2 bg-gray-50">
                                    <div className="flex flex-wrap items-center gap-1">
                                        {/* Font Family */}
                                        <select
                                            value={column.formatting.fontFamily}
                                            onChange={(e) => handleFormatting(index, 'fontFamily', e.target.value)}
                                            className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                                        >
                                            <option value="Arial">Arial</option>
                                            <option value="Times New Roman">Times New Roman</option>
                                            <option value="Courier New">Courier New</option>
                                            <option value="Georgia">Georgia</option>
                                            <option value="Verdana">Verdana</option>
                                        </select>

                                        {/* Font Size */}
                                        <select
                                            value={column.formatting.fontSize}
                                            onChange={(e) => handleFormatting(index, 'fontSize', e.target.value)}
                                            className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                                        >
                                            <option value="12px">12</option>
                                            <option value="14px">14</option>
                                            <option value="16px">16</option>
                                            <option value="18px">18</option>
                                            <option value="20px">20</option>
                                            <option value="24px">24</option>
                                            <option value="28px">28</option>
                                            <option value="32px">32</option>
                                        </select>

                                        <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                        {/* Bold */}
                                        <button
                                            onClick={() => handleFormatting(index, 'bold')}
                                            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                                                column.formatting.bold ? 'bg-teal-100 text-teal-700' : 'text-gray-700'
                                            }`}
                                            title="Đậm"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M11 6a3 3 0 00-3-3H5a1 1 0 000 2h3a1 1 0 010 2H5a1 1 0 000 2h3a1 1 0 010 2H5a1 1 0 100 2h3a3 3 0 003-3 3 3 0 000-6z"/>
                                            </svg>
                                        </button>

                                        {/* Italic */}
                                        <button
                                            onClick={() => handleFormatting(index, 'italic')}
                                            className={`p-2 rounded hover:bg-gray-200 transition-colors italic font-serif text-lg leading-none ${
                                                column.formatting.italic ? 'bg-teal-100 text-teal-700' : 'text-gray-700'
                                            }`}
                                            title="Nghiêng"
                                        >
                                            I
                                        </button>

                                        {/* Underline */}
                                        <button
                                            onClick={() => handleFormatting(index, 'underline')}
                                            className={`p-2 rounded hover:bg-gray-200 transition-colors underline font-semibold ${
                                                column.formatting.underline ? 'bg-teal-100 text-teal-700' : 'text-gray-700'
                                            }`}
                                            title="Gạch chân"
                                        >
                                            U
                                        </button>

                                        <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                        {/* Text Align */}
                                        <button
                                            onClick={() => handleFormatting(index, 'align', 'left')}
                                            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                                                column.formatting.align === 'left' ? 'bg-teal-100 text-teal-700' : 'text-gray-700'
                                            }`}
                                            title="Căn trái"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => handleFormatting(index, 'align', 'center')}
                                            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                                                column.formatting.align === 'center' ? 'bg-teal-100 text-teal-700' : 'text-gray-700'
                                            }`}
                                            title="Căn giữa"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm-2 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd"/>
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => handleFormatting(index, 'align', 'right')}
                                            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                                                column.formatting.align === 'right' ? 'bg-teal-100 text-teal-700' : 'text-gray-700'
                                            }`}
                                            title="Căn phải"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm4 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm-4 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm4 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd"/>
                                            </svg>
                                        </button>

                                        <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                        {/* Color Picker */}
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-gray-600">Màu:</span>
                                            <input
                                                type="color"
                                                value={column.formatting.color}
                                                onChange={(e) => handleFormatting(index, 'color', e.target.value)}
                                                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                                                title="Chọn màu chữ"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Text Editor */}
                                <textarea
                                    ref={(el) => { textareaRefs.current[index] = el; }}
                                    value={column.content}
                                    onChange={(e) => handleContentChange(index, e.target.value)}
                                    placeholder="Viết nhật ký của bạn ở đây..."
                                    style={getTextStyle(column.formatting)}
                                    className="w-full min-h-[300px] p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-y"
                                />

                                {/* Images */}
                                {column.images.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <h4 className="text-sm font-medium text-gray-700">Hình ảnh:</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {column.images.map((img, imgIndex) => (
                                                <div key={imgIndex} className="relative group">
                                                    <img src={img} alt={`Upload ${imgIndex + 1}`} className="w-full h-32 object-cover rounded-lg" />
                                                    <button
                                                        onClick={() => removeMedia(index, imgIndex, 'image')}
                                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Videos */}
                                {column.videos.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <h4 className="text-sm font-medium text-gray-700">Video:</h4>
                                        <div className="space-y-2">
                                            {column.videos.map((video, videoIndex) => (
                                                <div key={videoIndex} className="relative group">
                                                    <video src={video} controls className="w-full rounded-lg" />
                                                    <button
                                                        onClick={() => removeMedia(index, videoIndex, 'video')}
                                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search Modal */}
            {showSearch && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50" onClick={() => setShowSearch(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-teal-100" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-teal-100">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    className="flex-1 bg-transparent outline-none text-gray-900"
                                    autoFocus
                                />
                                <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Button */}
            {!showChat && (
                <button
                    onClick={() => setShowChat(true)}
                    className="fixed bottom-4 right-4 w-14 h-14 sm:w-16 sm:h-16 sm:bottom-6 sm:right-6 bg-gradient-to-br from-teal-600 to-cyan-400 rounded-full shadow-lg flex items-center justify-center text-xl sm:text-2xl hover:scale-110 transition-transform z-40 hover:shadow-xl"
                >
                    💬
                </button>
            )}
        </div>
    );
}