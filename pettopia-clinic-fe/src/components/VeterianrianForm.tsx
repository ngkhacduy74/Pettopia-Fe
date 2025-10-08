'use client';

import { useState, useEffect } from 'react';
import { getClinics } from '../services/clinicService';
import { submitVeterinarianData } from '../services/veterianrianService';
import { ChevronDownIcon } from '@heroicons/react/16/solid';

interface Clinic {
  id: string;
  name: string;
}

export default function VeterinarianForm() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [formData, setFormData] = useState({
    specialty: '',
    subSpecialties: '',
    exp: '',
    language: '',
    facebook: '',
    otherSocial: '',
    bio: '',
    certification: '',
    clinicId: '',
  });

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const data = await getClinics();
        setClinics(data);
      } catch (error) {
        console.error('Error fetching clinics:', error);
      }
    };
    fetchClinics();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitVeterinarianData({
        specialty: formData.specialty,
        subSpecialties: formData.subSpecialties,
        exp: formData.exp,
        language: formData.language,
        social_link: {
          facebook: formData.facebook,
          other: formData.otherSocial,
        },
        bio: formData.bio,
        certification: formData.certification,
        clinic_id: formData.clinicId,
      });
      alert('Data submitted successfully!');
      // Reset form or redirect
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Failed to submit data.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-12">
        <div className="border-b border-white/10 pb-12">
          <h2 className="text-base/7 font-semibold text-white">Veterinarian Profile</h2>
          <p className="mt-1 text-sm/6 text-gray-400">
            Fill in the details below to create your veterinarian profile.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="specialty" className="block text-sm/6 font-medium text-white">
                Specialty
              </label>
              <div className="mt-2">
                <input
                  id="specialty"
                  name="specialty"
                  type="text"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  value={formData.specialty}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="subSpecialties" className="block text-sm/6 font-medium text-white">
                Sub Specialties
              </label>
              <div className="mt-2">
                <input
                  id="subSpecialties"
                  name="subSpecialties"
                  type="text"
                  placeholder="Comma separated"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  value={formData.subSpecialties}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="exp" className="block text-sm/6 font-medium text-white">
                Experience (years)
              </label>
              <div className="mt-2">
                <input
                  id="exp"
                  name="exp"
                  type="number"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  value={formData.exp}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="language" className="block text-sm/6 font-medium text-white">
                Languages
              </label>
              <div className="mt-2">
                <input
                  id="language"
                  name="language"
                  type="text"
                  placeholder="Comma separated"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  value={formData.language}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="facebook" className="block text-sm/6 font-medium text-white">
                Facebook Link
              </label>
              <div className="mt-2">
                <input
                  id="facebook"
                  name="facebook"
                  type="url"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  value={formData.facebook}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="otherSocial" className="block text-sm/6 font-medium text-white">
                Other Social Link
              </label>
              <div className="mt-2">
                <input
                  id="otherSocial"
                  name="otherSocial"
                  type="url"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  value={formData.otherSocial}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="bio" className="block text-sm/6 font-medium text-white">
                Bio
              </label>
              <div className="mt-2">
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>
              <p className="mt-3 text-sm/6 text-gray-400">Write a few sentences about yourself.</p>
            </div>

            <div className="col-span-full">
              <label htmlFor="certification" className="block text-sm/6 font-medium text-white">
                Certification
              </label>
              <div className="mt-2">
                <textarea
                  id="certification"
                  name="certification"
                  rows={3}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  value={formData.certification}
                  onChange={handleChange}
                />
              </div>
              <p className="mt-3 text-sm/6 text-gray-400">List your certifications.</p>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="clinicId" className="block text-sm/6 font-medium text-white">
                Clinic
              </label>
              <div className="mt-2 grid grid-cols-1">
                <select
                  id="clinicId"
                  name="clinicId"
                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-white outline-1 -outline-offset-1 outline-white/10 *:bg-gray-800 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  value={formData.clinicId}
                  onChange={handleChange}
                >
                  <option value="">Select a clinic</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button type="button" className="text-sm/6 font-semibold text-white">
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          Save
        </button>
      </div>
    </form>
  );
}