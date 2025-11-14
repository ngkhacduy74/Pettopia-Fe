export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="inline-block w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    </div>
  );
}

