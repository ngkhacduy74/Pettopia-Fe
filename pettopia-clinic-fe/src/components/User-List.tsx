'use client'
import React, { useState, useEffect } from 'react'
import { getCustomerData } from '@/services/customerService';

interface RequestTableProps {
    title: string;
}

export default function RequestTable({ title }: RequestTableProps) {
    const [selectedForm, setSelectedForm] = useState<any | null>(null); // Thay đổi kiểu để phù hợp với dữ liệu mới
    const [dropdownRow, setDropdownRow] = useState<number | null>(null);
    const [forms, setForms] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [limit] = useState(10);
    const [filterRole, setFilterRole] = useState('all');

    useEffect(() => {
        fetchForms();
    }, [currentPage, filterRole]);

    const fetchForms = async () => {
        try {
            setIsLoading(true);
            const response = await getCustomerData(currentPage, limit);
            setForms(response.items);
            setTotalPages(Math.ceil(response.total / limit));
        } catch (error) {
            console.error('Error fetching customer data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredForms = forms.filter(form => {
        const matchesFilter = filterRole === 'all' || form.role.some((r: string) => r.toLowerCase() === filterRole.toLowerCase());
        return matchesFilter;
    });

    const openDetailPage = (form: any) => {
        setSelectedForm(form);
    };

    const closeDetailPage = () => {
        setSelectedForm(null);
    };

    const toggleDropdown = (index: number) => {
        setDropdownRow(dropdownRow === index ? null : index);
    };

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    // Detail Page View - Application Form Style
    if (selectedForm) {
        return (
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Back Button */}
                    <button
                        onClick={closeDetailPage}
                        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="font-medium">Quay lại danh sách</span>
                    </button>

                    {/* Application Form Paper */}
                    <div className="bg-white shadow-lg rounded-sm relative overflow-hidden" style={{ minHeight: '297mm' }}>
                        {/* Background Image */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none">
                            <img 
                                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=800&fit=crop" 
                                alt="background" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        <div className="relative z-10">
                            {/* Header */}
                            <div className="border-b-4 border-teal-600 px-12 py-8 bg-gradient-to-r from-teal-50 to-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-white font-bold text-3xl">{selectedForm.fullname.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 uppercase tracking-wider font-medium">Đơn đăng ký</p>
                                            <h1 className="text-3xl font-bold text-gray-900">Khách hàng</h1>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-4 py-2 rounded-lg text-sm font-bold inline-block ${getStatusStyles(selectedForm.is_active ? 'approved' : 'rejected')}`}>
                                            {selectedForm.is_active ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Ngày nộp: {new Date(selectedForm.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="px-12 py-8 space-y-8">
                                {/* Section 1: Thông tin khách hàng */}
                                <div>
                                    <div className="flex items-center mb-4 pb-2 border-b-2 border-gray-200">
                                        <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                                            1
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">THÔNG TIN KHÁCH HÀNG</h2>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pl-11">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên</label>
                                            <p className="text-base text-gray-900 border-b border-gray-300 pb-2">{selectedForm.fullname}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Tên đăng nhập</label>
                                            <p className="text-base text-gray-900 border-b border-gray-300 pb-2">{selectedForm.username}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày sinh</label>
                                            <p className="text-base text-gray-900 border-b border-gray-300 pb-2">
                                                {new Date(selectedForm.dob).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ Email</label>
                                            <p className="text-base text-gray-900 border-b border-gray-300 pb-2 flex items-center">
                                                {selectedForm.email.email_address}
                                                {selectedForm.email.verified && (
                                                    <svg className="w-5 h-5 text-green-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                                            <p className="text-base text-gray-900 border-b border-gray-300 pb-2 flex items-center">
                                                {selectedForm.phone.phone_number}
                                                {selectedForm.phone.verified && (
                                                    <svg className="w-5 h-5 text-green-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </p>
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ</label>
                                            <p className="text-base text-gray-900 border-b border-gray-300 pb-2">
                                                {selectedForm.address.description}, {selectedForm.address.ward}, {selectedForm.address.district}, {selectedForm.address.city}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Quyền và điểm uy tín */}
                                <div>
                                    <div className="flex items-center mb-4 pb-2 border-b-2 border-gray-200">
                                        <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                                            2
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">THÔNG TIN KHÁC</h2>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pl-11">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Quyền</label>
                                            <p className="text-base text-gray-900 border-b border-gray-300 pb-2">{selectedForm.role.join(', ')}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Điểm uy tín</label>
                                            <p className="text-base text-gray-900 border-b border-gray-300 pb-2">{selectedForm.reward_point}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Signature Section */}
                                <div className="pt-16 pb-8">
                                    <div className="grid grid-cols-2 gap-12">
                                        <div>
                                            <p className="text-center text-sm font-semibold text-gray-700 mb-24">
                                                Người nộp đơn
                                            </p>
                                            <div className="border-t-2 border-gray-400 pt-2">
                                                <p className="text-center font-semibold text-gray-900">{selectedForm.fullname}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-center text-sm font-semibold text-gray-700">
                                                Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                                            </p>
                                            <p className="text-center text-sm font-semibold text-gray-700 mb-20">
                                                Người xét duyệt
                                            </p>
                                            <div className="border-t-2 border-gray-400 pt-2">
                                                <p className="text-center font-semibold text-gray-900">(Ký và ghi rõ họ tên)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 px-12 py-4 bg-gray-50 text-center text-xs text-gray-500">
                                <p>Đơn này có giá trị kể từ ngày được phê duyệt • ID: {selectedForm.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Table View
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent">{title}</h1>
                                <p className="text-gray-600 mt-2">Quản lý thông tin khách hàng</p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium py-2.5 px-5 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg flex items-center space-x-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Thêm mới</span>
                                </button>
                            </div>
                        </div>

                        {/* Filter */}
                        <div className="mt-6 flex flex-col sm:flex-row gap-4">
                            <select
                                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                            >
                                <option value="all">Tất cả vai trò</option>
                                <option value="admin">Admin</option>
                                <option value="staff">Staff</option>
                                <option value="clinic">Clinic</option>
                                <option value="vet">Vet</option>
                                <option value="user">User</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : filteredForms.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="text-lg font-medium">Không tìm thấy kết quả</p>
                                <p className="text-sm mt-1">Thử điều chỉnh bộ lọc vai trò</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Khách hàng
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Liên hệ
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Địa chỉ
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Điểm uy tín
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Quyền
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredForms.map((form, index) => (
                                        <tr
                                            key={form.id}
                                            className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer group"
                                            onClick={() => openDetailPage(form)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{form.fullname}</div>
                                                        <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            {form.username}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    {form.email.email_address}
                                                </div>
                                                <div className="text-sm text-gray-900 flex items-center mt-1">
                                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    {form.phone.phone_number}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {form.address.description}, {form.address.ward}, {form.address.district}, {form.address.city}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {form.reward_point}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles(form.is_active ? 'approved' : 'rejected')}`}>
                                                    {form.role.join(', ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {!isLoading && filteredForms.length > 0 && (
                        <div className="bg-white px-4 py-4 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Hiển thị <span className="font-semibold text-indigo-600">{(currentPage - 1) * limit + 1}</span> đến{' '}
                                        <span className="font-semibold text-indigo-600">{Math.min(currentPage * limit, filteredForms.length)}</span> trong số{' '}
                                        <span className="font-semibold text-indigo-600">{filteredForms.length}</span> kết quả
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            className={`relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                                            let pageNumber;
                                            if (totalPages <= 5) {
                                                pageNumber = index + 1;
                                            } else if (currentPage <= 3) {
                                                pageNumber = index + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNumber = totalPages - 4 + index;
                                            } else {
                                                pageNumber = currentPage - 2 + index;
                                            }

                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all ${currentPage === pageNumber
                                                        ? 'z-10 bg-indigo-600 border-indigo-600 text-white shadow-md'
                                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        })}
                                        <button
                                            disabled={currentPage === totalPages}
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            className={`relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium transition-colors ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}