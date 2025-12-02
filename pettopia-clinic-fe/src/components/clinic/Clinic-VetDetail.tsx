'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	ArrowLeftIcon,
	CheckCircleIcon,
	XCircleIcon,
	AcademicCapIcon,
	DocumentTextIcon,
	GlobeAltIcon,
	BriefcaseIcon,
	TrashIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline';
import { VetDetail, deleteClinicVet } from '@/services/partner/veterianrianService';
import { useToast } from '@/contexts/ToastContext';

interface Props {
	vet: VetDetail;
	memberId?: string; // member_id để xóa, nếu không có thì dùng vet.id
}

export default function ClinicVetDetail({ vet, memberId }: Props) {
	const router = useRouter();
	const { showSuccess, showError } = useToast();
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			const idToDelete = memberId || vet.id;
			await deleteClinicVet(idToDelete);
			showSuccess('Đã xóa bác sĩ khỏi phòng khám thành công');
			setTimeout(() => {
				router.push('/clinic/vet');
			}, 1000);
		} catch (err: any) {
			console.error('Error deleting vet:', err);
			const message = err?.response?.data?.message || 'Không thể xóa bác sĩ. Vui lòng thử lại sau.';
			showError(message);
			setIsDeleting(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header với nút quay lại */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-4">
					<button
						onClick={() => router.back()}
						className="p-2 hover:bg-teal-100 rounded-lg transition-colors"
					>
						<ArrowLeftIcon className="w-6 h-6 text-gray-600" />
					</button>
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Chi tiết Bác sĩ</h1>
						<p className="text-gray-500 text-sm mt-1">Thông tin chi tiết về bác sĩ thú y</p>
					</div>
				</div>
				<button
					onClick={() => setShowDeleteModal(true)}
					className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
				>
					<TrashIcon className="w-5 h-5" />
					Xóa bác sĩ
				</button>
			</div>

			{/* Card chính */}
			<div className="bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden">



				{/* Nội dung chi tiết */}
				<div className="p-6 space-y-6">
					{/* Thông tin cơ bản */}
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<BriefcaseIcon className="w-5 h-5 text-teal-600" />
							Thông tin cơ bản
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{vet.specialty && (
								<div className="bg-gray-50 rounded-lg p-4">
									<p className="text-sm text-gray-500 mb-1">Chuyên khoa</p>
									<p className="font-medium text-gray-900">{vet.specialty}</p>
								</div>
							)}
							{vet.exp !== undefined && (
								<div className="bg-gray-50 rounded-lg p-4">
									<p className="text-sm text-gray-500 mb-1">Kinh nghiệm</p>
									<p className="font-medium text-gray-900">{vet.exp} năm</p>
								</div>
							)}
							{vet.license_number && (
								<div className="bg-gray-50 rounded-lg p-4">
									<p className="text-sm text-gray-500 mb-1">Số giấy phép hành nghề</p>
									<p className="font-medium text-gray-900">{vet.license_number}</p>
								</div>
							)}
							{vet.subSpecialties && vet.subSpecialties.length > 0 && (
								<div className="bg-gray-50 rounded-lg p-4">
									<p className="text-sm text-gray-500 mb-1">Chuyên khoa phụ</p>
									<div className="flex flex-wrap gap-2 mt-1">
										{vet.subSpecialties.map((sub, index) => (
											<span
												key={index}
												className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-medium"
											>
												{sub}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Giới thiệu */}
					{vet.bio && (
						<div>
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<DocumentTextIcon className="w-5 h-5 text-teal-600" />
								Giới thiệu
							</h3>
							<div className="bg-gray-50 rounded-lg p-4">
								<p className="text-gray-700 leading-relaxed">{vet.bio}</p>
							</div>
						</div>
					)}

					{/* Chứng chỉ */}
					{vet.certifications && vet.certifications.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<AcademicCapIcon className="w-5 h-5 text-teal-600" />
								Chứng chỉ & Bằng cấp
							</h3>
							<div className="space-y-3">
								{vet.certifications.map((cert, index) => (
									<div
										key={index}
										className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
									>
										<div>
											<p className="font-medium text-gray-900">{cert.name}</p>
											{cert.link && (
												<a
													href={cert.link}
													target="_blank"
													rel="noopener noreferrer"
													className="text-sm text-teal-600 hover:text-teal-700 mt-1 inline-flex items-center gap-1"
												>
													<GlobeAltIcon className="w-4 h-4" />
													Xem chứng chỉ
												</a>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Mạng xã hội */}
					{vet.social_link && (vet.social_link.facebook || vet.social_link.linkedin) && (
						<div>
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<GlobeAltIcon className="w-5 h-5 text-teal-600" />
								Mạng xã hội
							</h3>
							<div className="flex flex-wrap gap-3">
								{vet.social_link.facebook && (
									<a
										href={vet.social_link.facebook}
										target="_blank"
										rel="noopener noreferrer"
										className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
									>
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
										</svg>
										Facebook
									</a>
								)}
								{vet.social_link.linkedin && (
									<a
										href={vet.social_link.linkedin}
										target="_blank"
										rel="noopener noreferrer"
										className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors inline-flex items-center gap-2"
									>
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
										</svg>
										LinkedIn
									</a>
								)}
							</div>
						</div>
					)}

					{/* Giấy phép hành nghề */}
					{vet.license_image_url && (
						<div>
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<DocumentTextIcon className="w-5 h-5 text-teal-600" />
								Giấy phép hành nghề
							</h3>
							<div className="bg-gray-50 rounded-lg p-4">
								<img
									src={vet.license_image_url}
									alt="Giấy phép hành nghề"
									className="max-w-full h-auto rounded-lg border border-gray-200"
									onError={(e) => {
										(e.target as HTMLImageElement).style.display = 'none';
									}}
								/>
							</div>
						</div>
					)}

					{/* Thông tin khác */}
					<div className="pt-4 border-t border-gray-200">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
							{vet.createdAt && (
								<div>
									<p className="text-gray-500">Ngày tạo</p>
									<p className="font-medium text-gray-900">
										{new Date(vet.createdAt).toLocaleDateString('vi-VN')}
									</p>
								</div>
							)}
							{vet.updatedAt && (
								<div>
									<p className="text-gray-500">Cập nhật lần cuối</p>
									<p className="font-medium text-gray-900">
										{new Date(vet.updatedAt).toLocaleDateString('vi-VN')}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Modal xác nhận xóa */}
			{showDeleteModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
						<div className="p-6">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-xl font-bold text-gray-900">Xác nhận xóa bác sĩ</h3>
								<button
									onClick={() => setShowDeleteModal(false)}
									className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
									disabled={isDeleting}
								>
									<XMarkIcon className="w-6 h-6 text-gray-500" />
								</button>
							</div>
							<p className="text-gray-600 mb-6">
								Bạn có chắc chắn muốn xóa bác sĩ này khỏi phòng khám không? Hành động này không thể hoàn tác.
							</p>
							<div className="flex gap-3">
								<button
									onClick={() => setShowDeleteModal(false)}
									disabled={isDeleting}
									className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Hủy
								</button>
								<button
									onClick={handleDelete}
									disabled={isDeleting}
									className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
								>
									{isDeleting ? (
										<>
											<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
											Đang xóa...
										</>
									) : (
										<>
											<TrashIcon className="w-5 h-5" />
											Xóa
										</>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
