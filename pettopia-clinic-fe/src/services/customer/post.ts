// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_PETTOPIA_API_URL || 'http://localhost:3000/api/v1';
const getToken = () => localStorage.getItem('authToken') || '';

// API Services
export const getReportedPosts = async () => {
    const response = await fetch(`${API_BASE_URL}/communication/staff/reported`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': getToken()
        }
    });
    if (!response.ok) throw new Error('Không thể tải danh sách bài viết bị báo cáo');
    return response.json();
};

export const toggleHidePost = async (postId: string, isHidden: boolean) => {
    const response = await fetch(`${API_BASE_URL}/communication/${postId}/hide`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'token': getToken()
        },
        body: JSON.stringify({ isHidden })
    });
    if (!response.ok) throw new Error(isHidden ? 'Không thể ẩn bài viết' : 'Không thể bỏ ẩn bài viết');
    return response.json();
};
