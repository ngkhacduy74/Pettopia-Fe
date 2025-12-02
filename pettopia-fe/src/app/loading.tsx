export default function Loading() { 
    return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center"> 
        <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
    </main>); }
