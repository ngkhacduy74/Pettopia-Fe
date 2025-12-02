'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation';
import { getCustomerData } from '@/services/customer/customerService';
import Register from '@/components/auth/RegisterForm';

interface RequestTableProps {
  title: string;
}

export default function RequestTable({ title }: RequestTableProps) {
  const router = useRouter();
  const [forms, setForms] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [limit] = useState(10);
  
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Filter states
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterContact, setFilterContact] = useState('');
  const [filterRewardPoint, setFilterRewardPoint] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');
  
  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset page to 1 when filters change
    setCurrentPage(1);
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer to fetch after 500ms of inactivity
    debounceTimer.current = setTimeout(() => {
      fetchForms();
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [filterCustomer, filterContact, filterRewardPoint, filterStatus, filterRole]);

  useEffect(() => {
    fetchForms();
  }, [currentPage]);

  const fetchForms = async () => {
    try {
      setIsLoading(true);
      
      // Build filters object
      const filters: any = {};
      
      if (filterCustomer.trim()) {
        filters.fullname = filterCustomer;
      }
      
      if (filterContact.trim()) {
        filters.email_address = filterContact;
      }
      
      if (filterRewardPoint.trim()) {
        filters.reward_point = parseInt(filterRewardPoint);
      }
      
      if (filterStatus) {
        filters.is_active = filterStatus === 'active' ? true : false;
      }
      
      if (filterRole) {
        filters.role = filterRole;
      }

      const response = await getCustomerData(currentPage, limit, filters);
      setForms(response.items);
      setTotalPages(Math.ceil(response.total / limit));
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openDetailPage = (form: any) => {
    router.push(`/admin/user/${form.id}`);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                <p className="text-gray-600 mt-2">Quản lý thông tin khách hàng</p>
              </div>
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium py-2.5 px-5 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Thêm mới</span>
                </button>
              </div>
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
            ) : (
              <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Liên hệ
                    </th>
                    <th scope="col" className="px-3 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                      Điểm uy tín
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quyền
                    </th>
                  </tr>
                  <tr className="bg-white border-b border-gray-200">
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={filterCustomer}
                        onChange={(e) => setFilterCustomer(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={filterContact}
                        onChange={(e) => setFilterContact(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={filterRewardPoint}
                        onChange={(e) => setFilterRewardPoint(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Tất cả</option>
                        <option value="active">Đã kích hoạt</option>
                        <option value="inactive">Đã bị đình chỉ</option>
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      <select 
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Tất cả</option>
                        <option value="Admin">Admin</option>
                        <option value="Staff">Staff</option>
                        <option value="Clinic">Clinic</option>
                        <option value="Vet">Vet</option>
                        <option value="User">User</option>
                      </select>
                    </td>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {forms.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-lg font-medium">Không tìm thấy kết quả</p>
                          <p className="text-sm mt-1">Thử điều chỉnh bộ lọc của bạn</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    forms.map((form: any, index: any) => (
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 012 2z" />
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
                      <td className="px-3 py-4 text-sm font-medium text-gray-900 text-center">
                        {form.reward_point}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${form.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {form.is_active ? 'Đã kích hoạt' : 'Đã bị đình chỉ'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(form.role) && form.role.length > 0 ? (
                            form.role.map((r: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 inline-flex text-xs font-semibold rounded bg-blue-100 text-blue-800">
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-xs italic">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
              </>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && forms.length > 0 && (
            <div className="bg-white px-4 py-4 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-semibold text-indigo-600">{(currentPage - 1) * limit + 1}</span> đến{' '}
                    <span className="font-semibold text-indigo-600">{Math.min(currentPage * limit, forms.length)}</span> trong số{' '}
                    <span className="font-semibold text-indigo-600">{forms.length}</span> kết quả
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

      {/* Register Modal */}
      {showRegisterModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRegisterModal(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Thêm người dùng mới</h2>
              <Register />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}