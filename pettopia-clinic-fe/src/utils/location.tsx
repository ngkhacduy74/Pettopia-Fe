'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Address {
  city: string;
  district: string;
  ward: string;
  description: string;
}

interface LocationProps {
  /** Dữ liệu địa chỉ hiện tại từ modal */
  value?: Address;
  /** Callback để truyền địa chỉ đã chọn về modal */
  onChange: (address: Address) => void;
  /** Ẩn/hiện nhãn tiêu đề (tuỳ trường hợp dùng) */
  hideLabel?: boolean;
}

/**
 * 🏙️ Component chọn địa chỉ dùng API Supership (ổn định)
 */
export default function Location({ value, onChange, hideLabel = false }: LocationProps) {
  const [city, setCity] = useState(value?.city || '');
  const [district, setDistrict] = useState(value?.district || '');
  const [ward, setWard] = useState(value?.ward || '');
  const [description, setDescription] = useState(value?.description || '');

  const [cities, setCities] = useState<{ code: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ code: string; name: string }[]>([]);
  const [wards, setWards] = useState<{ code: string; name: string }[]>([]);

  // 🟢 Fetch provinces (cities)
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await axios.get('https://api.mysupership.vn/v1/partner/areas/province');
        setCities(res.data.results || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách tỉnh/thành:', error);
      }
    };
    fetchCities();
  }, []);

  // 🟢 Fetch districts theo city
  useEffect(() => {
    if (!city) {
      setDistricts([]);
      setDistrict('');
      setWard('');
      setWards([]);
      return;
    }

    const selectedCity = cities.find((c) => c.name === city);
    if (!selectedCity) return;

    const fetchDistricts = async () => {
      try {
        const res = await axios.get(
          `https://api.mysupership.vn/v1/partner/areas/district?province=${selectedCity.code}`
        );
        setDistricts(res.data.results || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách quận/huyện:', error);
      }
    };
    fetchDistricts();
  }, [city]);

  // 🟢 Fetch wards theo district
  useEffect(() => {
    if (!district) {
      setWard('');
      setWards([]);
      return;
    }

    const selectedDistrict = districts.find((d) => d.name === district);
    if (!selectedDistrict) return;

    const fetchWards = async () => {
      try {
        const res = await axios.get(
          `https://api.mysupership.vn/v1/partner/areas/commune?district=${selectedDistrict.code}`
        );
        setWards(res.data.results || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách phường/xã:', error);
      }
    };
    fetchWards();
  }, [district]);

  // 🟢 Cập nhật dữ liệu gửi ngược lên modal
  useEffect(() => {
    onChange({
      city,
      district,
      ward,
      description,
    });
  }, [city, district, ward, description]);

  return (
    <div className="space-y-3">
      {!hideLabel && (
        <label className="block text-sm font-semibold text-gray-700">Địa chỉ</label>
      )}

      {/* City */}
      <div>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
        >
          <option value="">-- Chọn tỉnh / thành phố --</option>
          {cities.map((c) => (
            <option key={c.code} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* District */}
      {city && (
        <div>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
          >
            <option value="">-- Chọn quận / huyện --</option>
            {districts.map((d) => (
              <option key={d.code} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Ward */}
      {district && (
        <div>
          <select
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
          >
            <option value="">-- Chọn phường / xã --</option>
            {wards.map((w) => (
              <option key={w.code} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Description */}
      {ward && (
        <div>
          <input
            type="text"
            placeholder="Số nhà, tên đường..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
          />
        </div>
      )}
    </div>
  );
}
