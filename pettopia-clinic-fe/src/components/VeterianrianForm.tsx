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
                  placeholder='Ex: Internal Medicine'
                  className="block w-full  bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
                  value={formData.specialty}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="subSpecialties" className="block text-sm/6 font-medium text-black">
                Sub Specialties
              </label>
              <div className="mt-2">
                <input
                  id="subSpecialties"
                  name="subSpecialties"
                  type="text"
                  placeholder='Ex: Veterinary Surgery'
                  className="block w-full bg-white/10 px-3 py-1.5 text-base text-black border-b border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
                  value={formData.subSpecialties}
                  onChange={handleChange}
                />
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
                  className="block w-full rounded-md bg-white/10 px-3 py-1.5 text-base text-black border border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
                  value={formData.facebook}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="otherSocial" className="block text-sm/6 font-medium text-black">
                Other Social Link
              </label>
              <div className="mt-2">
                <input
                  id="otherSocial"
                  name="otherSocial"
                  type="url"
                  className="block w-full rounded-md bg-white/10 px-3 py-1.5 text-base text-black border border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
                  value={formData.otherSocial}
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
                  placeholder='Write a few sentences about yourself.'
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="certification" className="block text-sm/6 font-medium text-black">
                Certification
              </label>
              <div className="mt-2">
                <input
                  id="certification"
                  name="certification"
                  placeholder='Place your certificate here'
                  className="block w-full rounded-md bg-white/10 px-3 py-1.5 text-base text-black border border-teal-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
                  value={formData.certification}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="clinicId" className="block text-sm/6 font-medium text-black">
                Clinic
              </label>
              <div className="mt-2 grid grid-cols-1">
                <select
                  id="clinicId"
                  name="clinicId"
                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/10 py-1.5 pr-8 pl-3 text-base text-black border border-teal-700 *:bg-white-700 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-700 sm:text-sm/6"
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
                  className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-black sm:size-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Separator line & actions, canh lề đúng với form --- */}
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