import axios from 'axios';

// ================ AUTH HELPER ================
function getAuthToken(): string | null {
    return localStorage.getItem('authToken');
}

function authHeaders() {
    const token = getAuthToken();
    // return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      if (!token) return {};
    return { headers: { token } };
}

// ================ PET APIs ================
const PET_API_URL = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/pet`; // ĐÃ SỬA: DÙNG .env

export interface CreatePetPayload {
    name: string;
    species: string;
    breed?: string;
    gender?: string;
    color?: string;
    weight?: number;
    dateOfBirth?: string;
    avatar_url?: string;
    /**
     * File ảnh avatar – nếu có, sẽ được gửi dạng multipart/form-data
     * giống cách community/create gửi imageFiles.
     */
    avatarFile?: File;
    owner?: string | Record<string, unknown>;
}

export async function createPet(payload: CreatePetPayload) {
    // Nếu có avatarFile thì gửi dạng multipart/form-data giống community
    if (typeof window !== 'undefined' && payload.avatarFile instanceof File) {
        const formData = new FormData();
        formData.append('name', payload.name);
        formData.append('species', payload.species);
        if (payload.breed) formData.append('breed', payload.breed);
        if (payload.gender) formData.append('gender', payload.gender);
        if (payload.color) formData.append('color', payload.color);
        if (typeof payload.weight === 'number') formData.append('weight', String(payload.weight));
        if (payload.dateOfBirth) formData.append('dateOfBirth', payload.dateOfBirth);
        if (payload.avatar_url) formData.append('avatar_url', payload.avatar_url);
        if (payload.owner) formData.append('owner', JSON.stringify(payload.owner));

        // File ảnh – tên field có thể cần chỉnh theo spec backend (ví dụ: 'avatar' hoặc 'avatarFile')
        formData.append('avatar', payload.avatarFile);

        const base = authHeaders();
        const response = await axios.post(PET_API_URL + '/create', formData, base);
        return response.data;
    }

    // Không có file, gửi JSON như cũ
    const { avatarFile, ...rest } = payload as any;
    const response = await axios.post(PET_API_URL + '/create', rest, authHeaders());
    return response.data;
}

export interface Medication {
    _id: string;
    medical_record_id: string;
    medication_name: string;
    dosage: string;
    instructions: string;
    id: string;
    __v: number;
    createdAt: string;
    updatedAt: string;
}

export interface MedicalRecordDetail {
    _id: string;
    appointment_id: string;
    pet_id: string;
    symptoms: string;
    diagnosis: string;
    notes: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface PetMedicalRecord {
    medicalRecord: MedicalRecordDetail;
    medications: Medication[];
}

export interface PetDetailResponse {
    id: string;
    name: string;
    species: string;
    gender?: string;
    breed?: string;
    color?: string;
    weight?: number;
    dateOfBirth?: string;
    avatar_url?: string;
    owner?: any;
    createdAt?: string;
    updatedAt?: string;
    medical_records?: PetMedicalRecord[];
}

export async function getPetById(petId: string): Promise<PetDetailResponse> {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/pet/${encodeURIComponent(petId)}`; // ĐÃ SỬA
    const res = await axios.get(url, authHeaders());
    return res.data?.data || res.data;
}

export interface UpdatePetPayload {
    name?: string;
    species?: string;
    breed?: string;
    gender?: string;
    color?: string;
    weight?: number;
    dateOfBirth?: string;
    avatar_url?: string;
}

export async function updatePet(petId: string, payload: UpdatePetPayload) {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/pet/${encodeURIComponent(petId)}`; // ĐÃ SỬA
    const response = await axios.patch(url, payload, authHeaders());
    return response.data;
}

export async function deletePet(petId: string) {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/pet/${encodeURIComponent(petId)}`; // ĐÃ SỬA
    const response = await axios.delete(url, authHeaders());
    return response.data;
}

export async function getPetsByOwner(userId: string): Promise<PetDetailResponse[]> {
  try {
    const url = `${PET_API_URL}/owner/${userId}`;
    const response = await axios.get(url, authHeaders());
    const petsData = response.data?.data || response.data || [];
    return Array.isArray(petsData) ? petsData : [];
  } catch (error) {
    logAxiosError('getPetsByOwner', error);
    throw error;
  }
}

// ================ HEALTHCARE - APPOINTMENTS ================
export interface Appointment {
    _id: string;
    user_id: string;
    pet_ids: string[];
    clinic_id: string;
    service_ids: string[];
    date: string;
    shift: 'Morning' | 'Afternoon' | 'Evening';
    status: 'Pending_Confirmation' | 'Confirmed' | 'Cancelled' | 'Completed';
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface AppointmentsResponse {
    status: string;
    message: string;
    data: Appointment[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface GetAppointmentsParams {
    page?: number;
    limit?: number;
}

export async function getAppointments(params?: GetAppointmentsParams): Promise<AppointmentsResponse> {
    const { page = 1, limit = 10 } = params || {};
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare/appointments`; // ĐÃ SỬA
    const response = await axios.get(url, {
        params: { page, limit },
        ...authHeaders(),
    });
    return response.data;
}

// -- Replace old AppointmentDetailResponse & getAppointmentDetail with these updated types / fn --

export interface AppointmentClinicInfo {
  _id?: string;
  id?: string;
  clinic_name?: string;
  email?: { email_address?: string; verified?: boolean } | any;
  phone?: { phone_number?: string; verified?: boolean } | any;
  license_number?: string;
  address?: {
    city?: string;
    district?: string;
    ward?: string;
    detail?: string;
  };
  representative?: any;
  is_active?: boolean;
  member_ids?: string[];
  createdAt?: string;
  updatedAt?: string;
  user_account_id?: string;
  [key: string]: any;
}

export interface AppointmentServiceInfo {
  _id?: string;
  clinic_id?: string;
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  is_active?: boolean;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface AppointmentPetInfo {
  id?: string;
  name?: string;
  species?: string;
  gender?: string;
  breed?: string;
  color?: string;
  weight?: number;
  dateOfBirth?: string;
  avatar_url?: string;
  owner?: any;
  [key: string]: any;
}

export interface AppointmentUserInfo {
  fullname?: string;
  phone_number?: string;
  email?: string;
  [key: string]: any;
}

export interface AppointmentDetail {
  id: string;
  date?: string;
  shift?: string;
  status?: 'Pending_Confirmation' | 'Confirmed' | 'Cancelled' | 'Completed' | string;
  user_info?: AppointmentUserInfo;
  clinic_info?: AppointmentClinicInfo;
  service_infos?: AppointmentServiceInfo[];
  pet_infos?: AppointmentPetInfo[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface AppointmentDetailResponse {
  status: string;
  message?: string;
  data: AppointmentDetail;
}

export async function getAppointmentDetail(appointmentId: string): Promise<AppointmentDetail> {
    const token = getAuthToken();
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare/appointments/${encodeURIComponent(appointmentId)}`;
    const response = await axios.get(url, {
        headers: {
            ...(token && { 'token': token }),
        },
    });
    // API trả về { status, message, data: { ... } } theo ví dụ, nên trả về phần data
    return response.data?.data || response.data;
}

// ================ MỚI: SERVICE DETAIL ================
export interface ServiceDetail {
    id: string;
    name: string;
    description?: string;
    price?: number;
    duration?: number; // phút
    clinic_id?: string;
    category?: string;
    createdAt?: string;
    updatedAt?: string;
}

export async function getServiceDetail(serviceId: string): Promise<ServiceDetail> {
    try {
        const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare/services/${encodeURIComponent(serviceId)}`; // ĐÃ SỬA
        const response = await axios.get(url, authHeaders());
        // Một số API trả về { data: {...} }, nên lấy linh hoạt
        return response.data?.data || response.data;
    } catch (error) {
        logAxiosError('getServiceDetail', error);
        throw error;
    }
}

// (Tương lai) Nếu cần lấy chi tiết phòng khám
export interface ClinicDetail {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    open_hours?: string;
    avatar_url?: string;
}

export async function getClinicDetail(clinicId: string): Promise<ClinicDetail> {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare/clinics/${encodeURIComponent(clinicId)}`; // ĐÃ SỬA
    const response = await axios.get(url, authHeaders());
    return response.data?.data || response.data;
}

// ================ CLINIC APIs ================
export interface Clinic {
  _id: string;
  id: string;
  clinic_name: string;
  address: {
    city: string;
    district: string;
    ward: string;
    detail: string;
  };
  phone: { phone_number: string; verified: boolean };
  email: { email_address: string; verified: boolean };
  license_number: string;
  is_active: boolean;
}

export interface ClinicsResponse {
  status: string;
  data: {
    items: Clinic[];
  };
}

export async function getClinics(page = 1, limit = 10): Promise<Clinic[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/partner/clinic?page=${page}&limit=${limit}`;
    const response = await axios.get(url, authHeaders());
    const clinics = response.data?.data?.items || response.data?.data || [];
    return clinics.filter((clinic: Clinic) => clinic.is_active);
  } catch (error) {
    logAxiosError('getClinics', error);
    throw error;
  }
}

// ================ SERVICE APIs ================
export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  is_active?: boolean;
}

export interface ServicesResponse {
  status: string;
  data: {
    items: Service[];
  };
}

export async function getServicesByClinic(clinicId: string): Promise<Service[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/partner/service/${encodeURIComponent(clinicId)}`;
    const response = await axios.get(url, authHeaders());
    const services = response.data?.data?.items || response.data?.data || [];
    return services.filter((s: any) => s.is_active).map((s: any) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      duration: s.duration,
      description: s.description,
    }));
  } catch (error) {
    logAxiosError('getServicesByClinic', error);
    throw error;
  }
}

// ================ SHIFT APIs ================
export interface Shift {
  id: string;
  shift: string;
  start_time: string;
  end_time: string;
  max_slot: number;
  is_active: boolean;
}

export async function getShiftsByClinic(clinicId: string): Promise<Shift[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/partner/clinic/shift/${encodeURIComponent(clinicId)}`;
    const response = await axios.get(url, authHeaders());
    const shifts = response.data?.data || [];
    return shifts.filter((s: any) => s.is_active).map((s: any) => ({
      id: s.id,
      shift: s.shift,
      start_time: s.start_time,
      end_time: s.end_time,
      max_slot: s.max_slot,
      is_active: s.is_active,
    }));
  } catch (error) {
    logAxiosError('getShiftsByClinic', error);
    throw error;
  }
}

// ================ APPOINTMENT BOOKING ================
export interface BookingPayload {
  clinic_id: string;
  pet_ids: string[];
  service_ids: string[];
  date: string;
  shift_id: string;
}

export async function bookAppointment(payload: BookingPayload) {
  try {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare/appointment`;
    const response = await axios.post(url, payload, authHeaders());
    return response.data;
  } catch (error) {
    logAxiosError('bookAppointment', error);
    throw error;
  }
}

// ================ APPOINTMENT RATING ================
export interface RatingPayload {
  star: number;
  notes: string;
  service_ids: string[];
}

export interface AppointmentRating {
  id: string;
  appointment_id: string;
  clinic_id: string;
  user_id: string;
  star: number;
  notes?: string;
  service_ids: string[];
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface AppointmentRatingResponse {
  status: string;
  message?: string;
  data: AppointmentRating;
}

export async function getAppointmentRating(appointmentId: string): Promise<AppointmentRating | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare/appointments/${encodeURIComponent(appointmentId)}/rating`;
    const response = await axios.get<AppointmentRatingResponse>(url, authHeaders());
    return response.data?.data || null;
  } catch (error: any) {
    // Nếu không tìm thấy rating (404), trả về null
    if (error?.response?.status === 404) {
      return null;
    }
    logAxiosError('getAppointmentRating', error);
    throw error;
  }
}

export async function rateAppointment(appointmentId: string, payload: RatingPayload) {
  try {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare/appointments/${encodeURIComponent(appointmentId)}/rating`;
    const response = await axios.post(url, payload, authHeaders());
    return response.data;
  } catch (error: any) {
    logAxiosError('rateAppointment', error);
    // Xử lý lỗi từ backend
    if (error?.response?.status === 400) {
      const message = error?.response?.data?.message || 'Lịch hẹn này đã được đánh giá trước đó';
      const customError = new Error(message);
      (customError as any).status = 400;
      throw customError;
    }
    throw error;
  }
}

// ================ GET CLINIC RATING STATS ================
export interface ClinicRatingStats {
  clinic_id: string;
  average_stars: number;
  total_ratings: number;
}

export interface ClinicRatingResponse {
  status: string;
  message?: string;
  data: ClinicRatingStats;
}

export async function getClinicRating(clinicId: string): Promise<ClinicRatingStats> {
  try {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare/clinics/${encodeURIComponent(clinicId)}/rating`;
    const response = await axios.get<ClinicRatingResponse>(url, authHeaders());
    return response.data?.data || response.data;
  } catch (error) {
    logAxiosError('getClinicRating', error);
    throw error;
  }
}

/* ================ NEW: update appointment status (cancel / confirm) ================
   Endpoint (example): PATCH /healthcare/appointments/{id}/status
   Body: { status: "Cancelled" | "Confirmed", cancel_reason?: "..." }
   Returns API response.data
*/
export async function updateAppointmentStatus(
  appointmentId: string,
  status: string,
  cancel_reason?: string
) {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  try {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare/appointments/${appointmentId}/status`;
    const payload: Record<string, any> = { status };
    if (cancel_reason) payload.cancel_reason = cancel_reason;
    
    console.log('Updating appointment status:', { url, method: 'PATCH', body: payload });

    const response = await axios.patch(url, payload, { headers: { 'token': token } });
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi cập nhật trạng thái lịch hẹn:", error);
    console.error("Error details:", {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      url: error?.config?.url,
      method: error?.config?.method,
      data: error?.response?.data
    });
    logAxiosError('updateAppointmentStatus', error);
    throw error;
  }
}

// ================ ERROR LOGGING ================
function isAxiosError(err: unknown): err is import('axios').AxiosError {
    return (axios as any).isAxiosError?.(err) === true;
}

function logAxiosError(context: string, error: unknown) {
    if (isAxiosError(error)) {
        const err = error as import('axios').AxiosError;
        console.error(`[${context}] Axios Error:`, {
            message: err.message,
            status: err.response?.status,
            statusText: err.response?.statusText,
            url: err.config?.url,
            method: err.config?.method,
            data: err.response?.data,
        });
    } else {
        console.error(`[${context}] Unknown Error:`, error);
    }
}

// Hàm gọi API AI
export async function callAIChat(userId: string, messages: { role: 'user'; content: string }[]) {
    const maxRetries = 3; // Số lần thử lại tối đa
    let attempt = 0;

    
    const AI_API_BASE = process.env.NEXT_PUBLIC_AI_API_URL || process.env.NEXT_PUBLIC_PETTOPIA_API_URL;

    while (attempt < maxRetries) {
        try {
            const response = await axios.post(`${AI_API_BASE?.replace(/\/$/, '')}/ai/gemini/chat`, {
                userId,
                messages: messages.map(m => ({ role: 'user', content: m.content })) 
            });
            return response.data;
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 429) {
                attempt++;
                const retryAfter = error.response.headers['retry-after'] || 1; 
                console.warn(`Rate limit exceeded. Retrying after ${retryAfter} seconds...`);
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000)); 
            } else {
                console.error('Error calling AI API:', error);
                throw error;
            }
        }
    }

    throw new Error('Max retries reached for calling AI API');
}

// ================ MEDICAL RECORD ================
export interface MedicalRecord {
  symptoms?: string;
  diagnosis?: string;
  notes?: string;
  prescription?: string;
  [key: string]: any;
}

export interface MedicalRecordResponse {
  status: string;
  message?: string;
  data: MedicalRecord;
}

export async function getAppointmentMedicalRecord(
  appointmentId: string
): Promise<MedicalRecord> {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  try {
    const url = `${process.env.NEXT_PUBLIC_PETTOPIA_API_URL}/healthcare/appointments/${encodeURIComponent(
      appointmentId
    )}/medical-record`;

    const response = await axios.get(url, {
      headers: { 'token': token }
    });

    // API trả về { status, message, data: { ... } }, nên trả về phần data
    return response.data?.data || response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 404) {
      console.warn('Medical record not found for appointment:', appointmentId);
      return {};
    }
    if (status === 401 || status === 403) {
      console.warn('Unauthorized to access medical record');
      throw new Error('Bạn không có quyền xem hồ sơ bệnh án');
    }
    logAxiosError('getAppointmentMedicalRecord', error);
    throw error;
  }
}

// ================ GET MEDICAL RECORDS BY PET ID ================
/**
 * Lấy tất cả medical records của một pet thông qua appointments
 * Flow: Lấy appointments -> Filter theo pet_id -> Lấy medical record từ mỗi appointment
 */
export interface PetMedicalRecord {
  appointmentId: string;
  appointmentDate: string;
  appointmentStatus: 'Pending_Confirmation' | 'Confirmed' | 'Cancelled' | 'Completed' | string;
  record: MedicalRecord;
}

export async function getMedicalRecordsByPetId(
  petId: string,
  options?: {
    page?: number;
    limit?: number;
    statusFilter?: string[]; // Filter appointments by status (e.g., ['Completed', 'Checked_In'])
  }
): Promise<PetMedicalRecord[]> {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found');

  try {
    // Bước 1: Lấy danh sách appointments
    const { page = 1, limit = 100, statusFilter } = options || {};
    const appointmentsData = await getAppointments({ page, limit });
    const appointments = appointmentsData.data || [];

    // Bước 2: Filter appointments có chứa pet_id này
    const petAppointments = appointments.filter((apt: Appointment) => 
      apt.pet_ids?.includes(petId)
    );

    // Bước 3: Filter theo status nếu có (mặc định lấy tất cả)
    const filteredAppointments = statusFilter && statusFilter.length > 0
      ? petAppointments.filter((apt: Appointment) => statusFilter.includes(apt.status))
      : petAppointments;

    // Bước 4: Lấy medical records từ các appointments
    const medicalRecordsPromises = filteredAppointments.map(async (apt: Appointment): Promise<PetMedicalRecord | null> => {
      try {
        const record = await getAppointmentMedicalRecord(apt.id);
        // Chỉ trả về nếu có medical record (không rỗng)
        if (record && Object.keys(record).length > 0) {
          return {
            appointmentId: apt.id,
            appointmentDate: apt.date,
            appointmentStatus: apt.status as string,
            record
          } as PetMedicalRecord;
        }
        return null;
      } catch (error) {
        // Bỏ qua lỗi 404 (không có medical record)
        if ((error as any)?.response?.status === 404) {
          return null;
        }
        console.warn(`Error fetching medical record for appointment ${apt.id}:`, error);
        return null;
      }
    });

    const allRecords = await Promise.all(medicalRecordsPromises);
    const medicalRecords = allRecords
      .filter((item): item is PetMedicalRecord => item !== null)
      .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()); // Sắp xếp theo ngày mới nhất

    return medicalRecords;
  } catch (error) {
    logAxiosError('getMedicalRecordsByPetId', error);
    throw error;
  }
}