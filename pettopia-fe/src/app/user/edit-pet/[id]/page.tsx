'use client';
import dynamic from 'next/dynamic';

// ✅ Dynamic import: load EditPetForm chỉ khi cần
const EditPetForm = dynamic(() => import('@/components/EditPetForm'), {
  ssr: false, // vì có window, localStorage
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
});

export default function EditPetPage() {
  return <EditPetForm />;
}
