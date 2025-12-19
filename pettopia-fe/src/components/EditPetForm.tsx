'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { getPetById, updatePet, UpdatePetPayload } from '@/services/petcare/petService';

/**
 * Component: EditPetForm
 * - Dùng cho trang /user/pet/[id]
 * - Tách riêng để load bằng next/dynamic
 */
export default function EditPetForm() {
  const router = useRouter();
  const { id } = useParams();
  const petId = id as string;

  // STATE
  const [petForm, setPetForm] = useState({
    name: '',
    species: '',
    breed: '',
    gender: '',
    color: '',
    weight: '',
    dateOfBirth: '',
    avatar_url: '',
  });
  const [avatarUploadMethod, setAvatarUploadMethod] = useState<'file' | 'url'>('url');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // FUNCTIONS
  const handleInputChange = (field: string, value: string) => {
    setPetForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh hợp lệ');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    setPetForm(prev => ({ ...prev, avatar_url: url }));
    setAvatarPreview(url);
  };

  const getAvatarSrc = () => {
    if (avatarUploadMethod === 'file' && avatarPreview) return avatarPreview;
    if (avatarUploadMethod === 'url' && petForm.avatar_url) return petForm.avatar_url;
    return '';
  };

  const handleSubmitPet = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!petForm.name || !petForm.species) {
      setServerError('Vui lòng nhập tên và loại thú cưng');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: UpdatePetPayload = {
        name: petForm.name,
        species: petForm.species,
        breed: petForm.breed || undefined,
        gender: petForm.gender === 'male' ? 'Male' : petForm.gender === 'female' ? 'Female' : undefined,
        color: petForm.color || undefined,
        weight: petForm.weight ? Number(petForm.weight) : undefined,
        dateOfBirth: petForm.dateOfBirth ? new Date(petForm.dateOfBirth).toISOString() : undefined,
        avatar_url: avatarUploadMethod === 'file' ? avatarPreview : petForm.avatar_url,
      };

      const res = await updatePet(petId, payload);
      alert(res?.message || 'Cập nhật thú cưng thành công');
      router.push('/user/pet/list');
    } catch (err: any) {
      console.error(err);
      setServerError(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thú cưng');
    } finally {
      setIsSubmitting(false);
    }
  };

  // FETCH DATA
  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        const data = await getPetById(petId);
        setPetForm({
          name: data.name || '',
          species: data.species || '',
          breed: data.breed || '',
          gender: data.gender?.toLowerCase() || '',
          color: data.color || '',
          weight: data.weight?.toString() || '',
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
          avatar_url: data.avatar_url || '',
        });
        setAvatarPreview(data.avatar_url || '');
      } catch (err) {
        console.error(err);
        setServerError('Không thể tải dữ liệu thú cưng');
      } finally {
        setLoading(false);
      }
    };
    if (petId) fetchPet();
  }, [petId]);

  // LOADING
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Đang tải dữ liệu thú cưng...</p>
        </div>
      </div>
    );
  }

  // MAIN RENDER
  return (
    <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
  
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto bg-white shadow-lg border border-gray-100 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-teal-700 mb-6">Chỉnh sửa thông tin thú cưng</h2>

          <form onSubmit={handleSubmitPet} className="space-y-6">
            <div className="grid grid-cols-2 gap-6 ">
              <div>
                <label htmlFor="pet-name" className="block text-sm font-medium mb-1">Tên thú cưng</label>
                <input
                  id="pet-name"
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  value={petForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="pet-species" className="block text-sm font-medium mb-1">Loại thú cưng</label>
                <select
                  id="pet-species"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  value={petForm.species}
                  onChange={(e) => handleInputChange('species', e.target.value)}
                  required
                >
                  <option value="">Chọn loại</option>
                  <option value="Dog">Chó</option>
                  <option value="Cat">Mèo</option>
                  <option value="Rabbit">Thỏ</option>
                  <option value="Bird">Chim</option>
                  <option value="Other">Khác</option>
                </select>
              </div>

              <div>
                <label htmlFor="pet-breed" className="block text-sm font-medium mb-1">Giống</label>
                <input
                  id="pet-breed"
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  value={petForm.breed}
                  onChange={(e) => handleInputChange('breed', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="pet-color" className="block text-sm font-medium mb-1">Màu sắc</label>
                <input
                  id="pet-color"
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  value={petForm.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="pet-weight" className="block text-sm font-medium mb-1">Cân nặng (kg)</label>
                <input
                  id="pet-weight"
                  type="number"
                  step="0.1"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  value={petForm.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="pet-dob" className="block text-sm font-medium mb-1">Ngày sinh</label>
                <input
                  id="pet-dob"
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  value={petForm.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ảnh đại diện</label>
              <div className="flex gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => setAvatarUploadMethod('file')}
                  className={`px-3 py-1.5 text-sm rounded-lg border ${
                    avatarUploadMethod === 'file'
                      ? 'bg-teal-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  📁 Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarUploadMethod('url')}
                  className={`px-3 py-1.5 text-sm rounded-lg border ${
                    avatarUploadMethod === 'url'
                      ? 'bg-teal-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🔗 Nhập URL
                </button>
              </div>

              {avatarUploadMethod === 'file' ? (
                <input type="file" accept="image/*" onChange={handleFileUpload} />
              ) : (
                <input
                  type="url"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  placeholder="https://example.com/image.jpg"
                  value={petForm.avatar_url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                />
              )}

              {getAvatarSrc() && (
                <img src={getAvatarSrc()} alt="Preview" className="w-24 h-24 mt-3 rounded-lg object-cover border" />
              )}
            </div>

            {serverError && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg p-2">{serverError}</p>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Link href="/user/pet/list" className="flex-1">
                <button
                  type="button"
                  className="w-full border-2 border-gray-300 text-gray-700 rounded-lg py-2 hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-2 rounded-lg text-white font-semibold ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700'
                }`}
              >
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật thú cưng'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
