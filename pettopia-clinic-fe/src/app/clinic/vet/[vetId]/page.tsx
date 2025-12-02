'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import ClinicVetDetail from '@/components/clinic/Clinic-VetDetail';
import { getVetDetail, VetDetail } from '@/services/partner/veterianrianService';
import { use } from 'react';

interface Props {
	params: Promise<{
		vetId: string;
	}>;
}

export default function Page({ params }: Props) {
	const { vetId } = use(params);
	const [showSearch, setShowSearch] = useState(false);
	const [vetDetail, setVetDetail] = useState<VetDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchVetDetail = async () => {
			try {
				setLoading(true);
				setError(null);
				const response = await getVetDetail(vetId);
				if (response.data) {
					setVetDetail(response.data);
				}
			} catch (err: any) {
				console.error('Error fetching vet detail:', err);
				setError(err.message || 'Không thể tải thông tin chi tiết bác sĩ');
			} finally {
				setLoading(false);
			}
		};

		if (vetId) {
			fetchVetDetail();
		}
	}, [vetId]);

	return (
		<div>
			<Sidebar setShowSearch={setShowSearch} showSearch={showSearch} />
			<div className="max-w-7xl mx-auto p-6">
				{loading && (
					<div className="flex items-center justify-center p-12">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
						<p className="text-gray-500 ml-4">Đang tải thông tin chi tiết...</p>
					</div>
				)}

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-xl p-6">
						<p className="text-red-800 font-medium">Lỗi: {error}</p>
					</div>
				)}

				{!loading && !error && vetDetail && (
					<ClinicVetDetail vet={vetDetail} memberId={vetId} />
				)}
			</div>
		</div>
	);
}

