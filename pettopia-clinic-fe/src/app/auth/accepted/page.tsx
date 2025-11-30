import React from 'react';

export default function AcceptedPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white p-6">
			<div className="max-w-xl w-full bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">Đã xác nhận</h1>
				<p className="text-gray-600 mb-4">Tài khoản của bạn đã được kích hoạt thành công.</p>
				<p className="text-sm text-gray-500">Bạn có thể quay lại trang đăng nhập để tiếp tục.</p>
			</div>
		</div>
	);
}
