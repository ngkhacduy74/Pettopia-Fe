import React from 'react';

const Topbar = ({ breadcrumbs = [] }) => {
  const handleBack = () => {
    window.history.back();
  };

  const handleBreadcrumbClick = (path) => {
    console.log('Navigate to:', path);
    // Thêm logic điều hướng ở đây
    // Ví dụ: window.location.href = path;
    // Hoặc dùng router của framework bạn đang dùng
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <button
                  onClick={() => handleBreadcrumbClick(crumb.path)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  {crumb.icon && (
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                      />
                    </svg>
                  )}
                  <span className={index === breadcrumbs.length - 1 ? 'font-semibold text-gray-900' : ''}>
                    {crumb.label}
                  </span>
                </button>
                
                {index < breadcrumbs.length - 1 && (
                  <svg 
                    className="w-4 h-4 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Nút Quay lại */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <span className="text-lg">←</span>
            <span>Quay lại</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;