'use client'
import React, { useState, useEffect } from 'react'
import { useToast } from '@/contexts/ToastContext';
import { getVeterinarianForms, VeterinarianForm, updateVeterinarianFormStatus } from '@/services/partner/veterianrianService';
import { getCustomerById } from '@/services/customer/customerService';

interface VetFormData extends VeterinarianForm {
  user?: {
    fullname: string;
    email: { email_address: string; verified: boolean };
    phone: { phone_number: string; verified: boolean };
  };
}

interface RequestTableProps {
  title: string;
}

export default function VetFormDetail({ title }: RequestTableProps) {
  const { showSuccess, showError } = useToast();
  const [selectedForm, setSelectedForm] = useState<VetFormData | null>(null);
  const [forms, setForms] = useState<VetFormData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [limit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchForms();
  }, [currentPage]);

  const fetchForms = async () => {
    try {
      setIsLoading(true);
      const response = await getVeterinarianForms(currentPage, limit);
      const vetForms = response.data.items;

      const formsWithUser = await Promise.all(
        vetForms.map(async (form: VeterinarianForm) => {
          try {
            const user = await getCustomerById(form.user_id);
            return { ...form, user };
          } catch (error) {
            console.error(`Failed to fetch user ${form.user_id}`, error);
            return { ...form, user: null };
          }
        })
      );

      setForms(formsWithUser);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching vet forms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredForms = forms.filter(form => {
    const userName = form.user?.fullname || '';
    const userEmail = form.user?.email.email_address || '';
    const userPhone = form.user?.phone.phone_number || '';
    const license = form.license_number || '';

    const matchesSearch =
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userPhone.includes(searchQuery) ||
      license.includes(searchQuery);

    const matchesFilter = filterStatus === 'all' || form.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const openDetailPage = (form: VetFormData) => {
    setSelectedForm(form);
  };

  const closeDetailPage = () => {
    setSelectedForm(null);
  };

  const updateStatus = async (newStatus: 'approved' | 'rejected' | 'pending') => {
    if (!selectedForm) return;

    const notes: Record<string, string> = {
      approved: 'Đơn đăng ký bác sĩ thú y đã được duyệt',
      rejected: 'Đơn đăng ký bị từ chối',
      pending: 'Đơn đang được xử lý lại',
    };

    try {
      await updateVeterinarianFormStatus(selectedForm.id, newStatus, notes[newStatus]);
      setSelectedForm({ ...selectedForm, status: newStatus });
      showSuccess(`Đã ${newStatus === 'approved' ? 'duyệt' : newStatus === 'rejected' ? 'từ chối' : 'chuyển trạng thái'} thành công!`, 5000);
      fetchForms();
    } catch (error: any) {
      console.error('Error updating status:', error);
      showError(error.message || 'Cập nhật thất bại', 5000);
    }
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

  // === CHI TIẾT HỒ SƠ ===
  if (selectedForm) {
    const user = selectedForm.user;
    return (
      <div >
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

          {/* Application Form */}
          <div className="bg-white shadow-lg rounded-sm relative overflow-hidden" style={{ minHeight: '297mm' }}>
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200&h=800&fit=crop"
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
                      <span className="text-white font-bold text-3xl">
                        {user?.fullname.charAt(0).toUpperCase() || 'V'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 uppercase tracking-wider font-medium">Đơn đăng ký</p>
                      <h1 className="text-3xl font-bold text-gray-900">Bác sĩ Thú y</h1>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-4 py-2 rounded-lg text-sm font-bold inline-block ${getStatusStyles(selectedForm.status)}`}>
                      {selectedForm.status === 'pending' ? 'ĐANG XỬ LÝ' : selectedForm.status === 'approved' ? 'ĐÃ DUYỆT' : 'TỪ CHỐI'}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">
                      Ngày nộp: {new Date(selectedForm.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="px-12 py-8 space-y-8">
                {/* Thông tin bác sĩ */}
                <div>
                  <div className="flex items-center mb-4 pb-2 border-b-2 border-gray-200">
                    <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                      1
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">THÔNG TIN BÁC SĨ</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pl-11">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên</label>
                      <p className="text-base text-gray-900 border-b border-gray-300 pb-2">{user?.fullname || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Số giấy phép hành nghề</label>
                      <p className="text-base text-gray-900 border-b border-gray-300 pb-2">{selectedForm.license_number}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Chuyên môn</label>
                      <p className="text-base text-gray-900 border-b border-gray-300 pb-2">{selectedForm.specialty}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Kinh nghiệm</label>
                      <p className="text-base text-gray-900 border-b border-gray-300 pb-2">{selectedForm.exp} năm</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                      <p className="text-base text-gray-900 border-b border-gray-300 pb-2 flex items-center">
                        {user?.email.email_address || 'N/A'}
                        {user?.email.verified && (
                          <svg className="w-5 h-5 text-green-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                      <p className="text-base text-gray-900 border-b border-gray-300 pb-2 flex items-center">
                        {user?.phone.phone_number || 'N/A'}
                        {user?.phone.verified && (
                          <svg className="w-5 h-5 text-green-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </p>
                    </div>

                    {selectedForm.subSpecialties.length > 0 && (
                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Chuyên sâu</label>
                        <p className="text-base text-gray-900 border-b border-gray-300 pb-2">
                          {selectedForm.subSpecialties.join(', ')}
                        </p>
                      </div>
                    )}

                    {selectedForm.bio && (
                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Giới thiệu</label>
                        <p className="text-base text-gray-900 border-b border-gray-300 pb-2 whitespace-pre-wrap">{selectedForm.bio}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chứng chỉ */}
                {selectedForm.certifications.length > 0 && (
                  <div>
                    <div className="flex items-center mb-4 pb-2 border-b-2 border-gray-200">
                      <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                        2
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">CHỨNG CHỈ</h2>
                    </div>
                    <div className="pl-11 space-y-3">
                      {selectedForm.certifications.map((cert, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <span className="font-medium">{cert.name}</span>
                          {cert.link && (
                            <a href={cert.link} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline text-sm">
                              Xem chứng chỉ
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hình ảnh giấy phép */}
                {selectedForm.license_image_url && (
                  <div>
                    <div className="flex items-center mb-4 pb-2 border-b-2 border-gray-200">
                      <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                        3
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">HÌNH ẢNH GIẤY PHÉP</h2>
                    </div>
                    <div className="pl-11">
                      <img
                        src={selectedForm.license_image_url}
                        alt="License"
                        className="max-w-md rounded border border-gray-300 shadow-sm"
                      />
                    </div>
                  </div>
                )}

          
             
              </div>

              <div className="border-t border-gray-200 px-12 py-4 bg-gray-50 text-center text-xs text-gray-500">
                <p>Đơn này có giá trị kể từ ngày được phê duyệt • ID: {selectedForm.id}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-3 print:hidden">
            <button
              onClick={() => updateStatus('pending')}
              className="flex-1 min-w-[140px] bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Đang xử lý</span>
            </button>

            <button
              onClick={() => updateStatus('approved')}
              className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Phê duyệt</span>
            </button>

            <button
              onClick={() => updateStatus('rejected')}
              className="flex-1 min-w-[140px] bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Từ chối</span>
            </button>

    
          </div>
        </div>

        <style jsx>{`
          @media print {
            body { background: white; }
            .print\\:hidden { display: none !important; }
          }
        `}</style>
      </div>
    );
  }

  // === DANH SÁCH HỒ SƠ ===
  return (
    <div >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent">{title}</h1>
                <p className="text-gray-600 mt-2">Quản lý hồ sơ đăng ký bác sĩ thú y</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Tìm kiếm tên, email, SĐT, giấy phép..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Đang xử lý</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredForms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <p className="text-lg font-medium">Không tìm thấy kết quả</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bác sĩ</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Liên hệ</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Chuyên môn</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredForms.map((form) => (
                    <tr
                      key={form.id}
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer group"
                      onClick={() => openDetailPage(form)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">
                              {form.user?.fullname.charAt(0).toUpperCase() || 'V'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{form.user?.fullname || 'N/A'}</div>
                            <div className="text-xs text-gray-500 flex items-center mt-0.5">
                              {form.license_number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center">
                          {form.user?.email.email_address || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-900 flex items-center mt-1">
                          {form.user?.phone.phone_number || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{form.specialty}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{form.exp} năm kinh nghiệm</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles(form.status)}`}>
                          {form.status === 'pending' ? 'Đang xử lý' : form.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
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
                      className={`relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                      let pageNumber;
                      if (totalPages <= 5) pageNumber = index + 1;
                      else if (currentPage <= 3) pageNumber = index + 1;
                      else if (currentPage >= totalPages - 2) pageNumber = totalPages - 4 + index;
                      else pageNumber = currentPage - 2 + index;

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all ${
                            currentPage === pageNumber
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
                      className={`relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium transition-colors ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
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