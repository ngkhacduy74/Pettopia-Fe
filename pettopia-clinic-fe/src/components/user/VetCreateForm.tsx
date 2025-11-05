'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { submitVeterinarianData } from '../../services/partner/veterianrianService';

interface Certification {
  name: string;
  link?: string;
}

interface VetFormData {
  specialty: string;
  subSpecialties: string[];
  exp: string;
  facebook: string;
  linkedin: string;
  bio: string;
  license_number: string;
  license_image_url: string;
  certifications: Certification[];
}

export default function VetCreateForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm<VetFormData>({
    defaultValues: {
      specialty: '',
      subSpecialties: [], // Không có ô mặc định
      exp: '',
      facebook: '',
      linkedin: '',
      bio: '',
      license_number: '',
      license_image_url: '',
      certifications: [{ name: '', link: '' }],
    },
    mode: 'onChange',
  });

  // Sub Specialties: max 3
  const [subSpecialties, setSubSpecialties] = useState<string[]>([]);
  
  const addSubSpecialty = () => {
    if (subSpecialties.length < 3) {
      setSubSpecialties([...subSpecialties, '']);
    }
  };

  const removeSubSpecialty = (index: number) => {
    setSubSpecialties(subSpecialties.filter((_, i) => i !== index));
  };

  // Certifications: max 5
  const {
    fields: certFields,
    append: appendCert,
    remove: removeCert,
  } = useFieldArray({
    control,
    name: 'certifications',
  });

  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data: VetFormData) => {
    try {
      setServerError('');
      const formattedData = {
        specialty: data.specialty,
        subSpecialties: subSpecialties.filter(s => s.trim()),
        exp: parseInt(data.exp) || 0,
        social_link: {
          facebook: data.facebook || '',
          linkedin: data.linkedin || '',
        },
        bio: data.bio,
        certifications: data.certifications
          .filter(c => c.name.trim())
          .map(c => ({ name: c.name, link: c.link?.trim() })),
        license_number: data.license_number,
        license_image_url: data.license_image_url || '',
      };

      // Fix lỗi dòng 88
      await submitVeterinarianData(formattedData);
      alert('Thông tin bác sĩ thú y đã được gửi thành công!');
      router.push('/user/waitting');
    } catch (error: any) {
      setServerError(error.response?.data?.message || 'Gửi thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6 space-y-10 bg-white rounded-xl shadow-sm">
      <div>
        <h1 className="text-4xl font-bold text-teal-600">Veterinarian Profile</h1>
        <p className="mt-2 text-sm text-gray-600">Fill in the details to complete your veterinarian profile.</p>
      </div>

      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specialty */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên môn chính</label>
          <input
            {...register('specialty', {
              required: 'Vui lòng nhập chuyên môn chính',
              minLength: { value: 3, message: 'Tối thiểu 3 ký tự' },
            })}
            placeholder="VD: Thú y nội khoa"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
          />
          {errors.specialty && <p className="mt-1 text-xs text-red-600">{errors.specialty.message}</p>}
        </div>

        {/* Sub Specialties: KHÔNG CÓ Ô MẶC ĐỊNH, ẤN "THÊM" TỐI ĐA 3 LẦN */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chuyên môn phụ (tối đa 3)
          </label>
          <div className="space-y-2">
            {subSpecialties.map((specialty, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={specialty}
                  onChange={(e) => {
                    const newSpecialties = [...subSpecialties];
                    newSpecialties[index] = e.target.value;
                    setSubSpecialties(newSpecialties);
                  }}
                  placeholder={`VD: Chẩn đoán hình ảnh ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => removeSubSpecialty(index)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md border border-red-200 transition text-sm"
                >
                  Xóa
                </button>
              </div>
            ))}
            {/* NÚT "THÊM CHUYÊN MÔN PHỤ" GIỐNG HỆT NÚT "THÊM CHỨNG CHỈ" */}
            {subSpecialties.length < 3 && (
              <button
                type="button"
                onClick={addSubSpecialty}
                className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-1"
              >
                <span className="text-xl">+</span> Thêm chuyên môn phụ
              </button>
            )}
          </div>
        </div>

        {/* Kinh nghiệm: NẰM DƯỚI CHUYÊN MÔN PHỤ, CHIẾM 1 CỘT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm (năm)</label>
          <input
            {...register('exp', {
              required: 'Vui lòng nhập số năm kinh nghiệm',
              min: { value: 0, message: 'Tối thiểu 0' },
              max: { value: 50, message: 'Tối đa 50 năm' },
              pattern: { value: /^[0-9]+$/, message: 'Chỉ nhập số' },
            })}
            type="number"
            min="0"
            max="50"
            placeholder="5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          {errors.exp && <p className="mt-1 text-xs text-red-600">{errors.exp.message}</p>}
        </div>

        {/* Facebook + LinkedIn: DƯỚI KINH NGHIỆM, CHIẾM TOÀN BỘ 1 DÒNG, 50% MỖI Ô */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook (tùy chọn)</label>
            <input
              {...register('facebook', {
                pattern: {
                  value: /^$|https?:\/\/(www\.)?facebook\.com\/.+/i,
                  message: 'URL Facebook không hợp lệ',
                },
              })}
              type="url"
              placeholder="https://facebook.com/bacsi.thuy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            {errors.facebook && <p className="mt-1 text-xs text-red-600">{errors.facebook.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn (tùy chọn)</label>
            <input
              {...register('linkedin', {
                pattern: {
                  value: /^$|https?:\/\/(www\.)?linkedin\.com\/.+/i,
                  message: 'URL LinkedIn không hợp lệ',
                },
              })}
              type="url"
              placeholder="https://linkedin.com/in/bacsi-thuy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            {errors.linkedin && <p className="mt-1 text-xs text-red-600">{errors.linkedin.message}</p>}
          </div>
        </div>

        {/* Bio */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu bản thân</label>
          <textarea
            {...register('bio', {
              required: 'Vui lòng viết giới thiệu',
              minLength: { value: 50, message: 'Tối thiểu 50 ký tự' },
            })}
            rows={4}
            placeholder="Viết vài câu về kinh nghiệm, phong cách làm việc..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
          />
          {errors.bio && <p className="mt-1 text-xs text-red-600">{errors.bio.message}</p>}
        </div>

        {/* Certifications: max 5 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Chứng chỉ (tối đa 5)</label>
          <div className="space-y-3">
            {certFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...register(`certifications.${index}.name` as const, {
                    required: index === 0 ? 'Vui lòng nhập tên chứng chỉ' : false,
                  })}
                  placeholder="Tên chứng chỉ"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <input
                  {...register(`certifications.${index}.link` as const)}
                  placeholder="Link (tùy chọn)"
                  type="url"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                {certFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCert(index)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md border border-red-200 transition text-sm"
                  >
                    Xóa
                  </button>
                )}
              </div>
            ))}
            {certFields.length < 5 && (
              <button
                type="button"
                onClick={() => appendCert({ name: '', link: '' })}
                className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-1"
              >
                <span className="text-xl">+</span> Thêm chứng chỉ
              </button>
            )}
          </div>
          {errors.certifications?.[0]?.name && (
            <p className="mt-1 text-xs text-red-600">{errors.certifications[0].name.message}</p>
          )}
        </div>

        {/* License Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số giấy phép hành nghề</label>
          <input
            {...register('license_number', {
              required: 'Vui lòng nhập số giấy phép',
              pattern: {
                value: /^([0-9]{10}|[0-9]{3,6}\/[A-Z]{2,6}(-[A-Z]{2,10})?)$/,
                message: 'Không hợp lệ (10 số hoặc 123/HNY-SNNPTNT)',
              },
              setValueAs: v => v.toUpperCase().trim(),
            })}
            placeholder="1234567890 hoặc 123/HNY"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-sm"
          />
          {errors.license_number && <p className="mt-1 text-xs text-red-600">{errors.license_number.message}</p>}
        </div>

        {/* License Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link ảnh giấy phép (tùy chọn)</label>
          <input
            {...register('license_image_url', {
              pattern: {
                value: /^$|https?:\/\/.+/,
                message: 'URL không hợp lệ',
              },
            })}
            type="url"
            placeholder="https://example.com/license.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          {errors.license_image_url && <p className="mt-1 text-xs text-red-600">{errors.license_image_url.message}</p>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting || Object.keys(errors).length > 0}
          className="px-8 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-sm"
        >
          {isSubmitting ? 'Đang gửi...' : 'Gửi thông tin'}
        </button>
      </div>
    </form>
  );
}