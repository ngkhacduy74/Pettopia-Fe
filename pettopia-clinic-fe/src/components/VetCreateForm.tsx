'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitVeterinarianData } from '../services/veterianrianService';

interface Certification {
  name: string;
  link?: string;
}

export default function VetCreateForm() {
  const [subSpecialties, setSubSpecialties] = useState<string[]>(['']);
  const [certifications, setCertifications] = useState<Certification[]>([{ name: '', link: '' }]);
  const [formData, setFormData] = useState({
    specialty: '',
    exp: '',
    facebook: '',
    linkedin: '',
    bio: '',
    license_number: '',
    license_image_url: '',
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubSpecialtyChange = (index: number, value: string) => {
    const newSubSpecialties = [...subSpecialties];
    newSubSpecialties[index] = value;
    setSubSpecialties(newSubSpecialties);
  };

  const addSubSpecialty = () => {
    if (subSpecialties.length < 3) {
      setSubSpecialties([...subSpecialties, '']);
    }
  };

  const handleCertificationChange = (index: number, field: 'name' | 'link', value: string) => {
    const newCertifications = [...certifications];
    newCertifications[index] = { ...newCertifications[index], [field]: value };
    setCertifications(newCertifications);
  };

  const addCertification = () => {
    setCertifications([...certifications, { name: '', link: '' }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        specialty: formData.specialty,
        subSpecialties: subSpecialties.filter((sub) => sub.trim() !== ''),
        exp: parseInt(formData.exp) || 0,
        social_link: {
          facebook: formData.facebook,
          linkedin: formData.linkedin,
        },
        bio: formData.bio,
        certifications: certifications.filter((cert) => cert.name.trim() !== ''),
        license_number: formData.license_number,
        license_image_url: formData.license_image_url,
      };
      await submitVeterinarianData(dataToSubmit);
      alert('Data submitted successfully!');
      // Reset form
      setFormData({
        specialty: '',
        exp: '',
        facebook: '',
        linkedin: '',
        bio: '',
        license_number: '',
        license_image_url: '',
      });
      setSubSpecialties(['']);
      setCertifications([{ name: '', link: '' }]);
      // Chuyển hướng đến /vet/waitting sau khi gửi thành công
      router.push('/user/waitting');
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Failed to submit data.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-12">
        <div className="pb-12">
          <h1 className="text-5xl leading-tight font-semibold text-black break-words">Veterinarian Profile</h1>
          <p className="mt-1 pt-4 text-sm/6 text-black">
            Fill in the details below to create your veterinarian profile.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="specialty" className="block text-sm/6 font-medium text-black">
                Specialty
              </label>
              <div className="mt-2">
                <input
                  id="specialty"
                  name="specialty"
                  type="text"
                  placeholder="Ex: Thú y nội khoa"
                  className="block w-full bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
                  value={formData.specialty}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-sm/6 font-medium text-black">
                Sub Specialties (Tối đa 3)
              </label>
              <div className="mt-2 space-y-2">
                {subSpecialties.map((sub, index) => (
                  <div key={index} className="flex items-center gap-x-2">
                    <input
                      type="text"
                      placeholder={`Ex: Chẩn đoán hình ảnh ${index + 1}`}
                      className="block w-full bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
                      value={sub}
                      onChange={(e) => handleSubSpecialtyChange(index, e.target.value)}
                    />
                    {index === subSpecialties.length - 1 && subSpecialties.length < 3 && (
                      <button
                        type="button"
                        onClick={addSubSpecialty}
                        className="text-teal-600 hover:text-teal-700 text-xl font-bold"
                      >
                        +
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="exp" className="block text-sm/6 font-medium text-black">
                Experience (years)
              </label>
              <div className="mt-2">
                <input
                  id="exp"
                  name="exp"
                  type="number"
                  min="0"
                  className="block w-full bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
                  value={formData.exp}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="facebook" className="block text-sm/6 font-medium text-black">
                Facebook Link
              </label>
              <div className="mt-2">
                <input
                  id="facebook"
                  name="facebook"
                  type="url"
                  placeholder="Ex: https://www.facebook.com/bacsi.thuy"
                  className="block w-full rounded-md bg-white/10 px-3 py-1.5 text-base text-black border border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
                  value={formData.facebook}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="linkedin" className="block text-sm/6 font-medium text-black">
                LinkedIn Link
              </label>
              <div className="mt-2">
                <input
                  id="linkedin"
                  name="linkedin"
                  type="url"
                  placeholder="Ex: https://www.linkedin.com/in/bacsi-thuy"
                  className="block w-full rounded-md bg-white/10 px-3 py-1.5 text-base text-black border border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
                  value={formData.linkedin}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="bio" className="block text-sm/6 font-medium text-black">
                Bio
              </label>
              <div className="mt-2">
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  className="block w-full rounded-md bg-white/10 px-3 py-1.5 text-base text-black border border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Write a few sentences about yourself."
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-sm/6 font-medium text-black">
                Certifications
              </label>
              <div className="mt-2 space-y-2">
                {certifications.map((cert, index) => (
                  <div key={index} className="space-y-2">
                    <input
                      type="text"
                      placeholder={`Certification Name ${index + 1}`}
                      className="block w-full bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
                      value={cert.name}
                      onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                    />
                    <input
                      type="url"
                      placeholder={`Certification Link ${index + 1} (optional)`}
                      className="block w-full bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
                      value={cert.link}
                      onChange={(e) => handleCertificationChange(index, 'link', e.target.value)}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCertification}
                  className="text-teal-600 hover:text-teal-700 text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="license_number" className="block text-sm/6 font-medium text-black">
                License Number
              </label>
              <div className="mt-2">
                <input
                  id="license_number"
                  name="license_number"
                  type="text"
                  placeholder="Ex: VN-VET-2025-00123"
                  className="block w-full bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
                  value={formData.license_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="license_image_url" className="block text-sm/6 font-medium text-black">
                License Image URL
              </label>
              <div className="mt-2">
                <input
                  id="license_image_url"
                  name="license_image_url"
                  type="url"
                  placeholder="Ex: https://example.com/uploads/license_123.jpg"
                  className="block w-full bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
                  value={formData.license_image_url}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-start">
        <div className="w-full sm:w-2/3">
          <hr className="border-t border-teal-700 mb-6" />
          <div className="flex justify-end gap-x-6">
            <button
              type="button"
              className="text-sm font-semibold text-gray-700 hover:text-teal-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-teal-600 hover:bg-teal-700 px-4 py-2 text-sm font-semibold text-white border border-teal-700 transition focus:outline-2 focus:outline-offset-2 focus:outline-teal-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}