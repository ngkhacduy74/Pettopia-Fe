'use client';
import React, { useState, useEffect } from 'react';

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
 * 🏙️ Component chọn địa chỉ tái sử dụng
 * Dùng để chỉnh sửa dữ liệu address trong modal
 */
export default function Location({ value, onChange, hideLabel = false }: LocationProps) {
  const [city, setCity] = useState(value?.city || '');
  const [district, setDistrict] = useState(value?.district || '');
  const [ward, setWard] = useState(value?.ward || '');
  const [description, setDescription] = useState(value?.description || '');

  // Giả lập dữ liệu có sẵn (bạn có thể thay bằng API thật)
  const [cities] = useState(['Thành phố Hà Nội', 'Thành phố Hồ Chí Minh']);
  const [districts, setDistricts] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);

  // Khi chọn city → load danh sách district
  useEffect(() => {
    if (city === 'Thành phố Hà Nội') {
      setDistricts(['Quận Tây Hồ', 'Quận Ba Đình', 'Quận Hoàn Kiếm']);
    } else if (city === 'Thành phố Hồ Chí Minh') {
      setDistricts(['Quận 1', 'Quận 3', 'Quận Bình Thạnh']);
    } else {
      setDistricts([]);
    }
    setDistrict('');
    setWard('');
  }, [city]);

  // Khi chọn district → load danh sách ward
  useEffect(() => {
    if (district === 'Quận Tây Hồ') {
      setWards(['Phường Phú Thượng', 'Phường Nhật Tân', 'Phường Quảng An']);
    } else if (district === 'Quận 1') {
      setWards(['Phường Bến Nghé', 'Phường Bến Thành']);
    } else {
      setWards([]);
    }
    setWard('');
  }, [district]);

  // Gửi dữ liệu lên modal khi có thay đổi
  useEffect(() => {
    onChange({
      city,
      district,
      ward,
      description,
    });
  }, [city, district, ward, description, onChange]);

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
          {cities.map((c, i) => (
            <option key={i} value={c}>
              {c}
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
            {districts.map((d, i) => (
              <option key={i} value={d}>
                {d}
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
            {wards.map((w, i) => (
              <option key={i} value={w}>
                {w}
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
