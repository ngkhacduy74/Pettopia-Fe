// import React, { useState } from 'react';
// import { Plus, ArrowLeft, Heart, ClipboardList, Pill, FileText, Calendar, Eye, Edit2, Trash2 } from 'lucide-react';

// // Component: Danh sách báo cáo
// function ReportList({ reports, onViewDetail }) {
//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Quản Lý Báo Cáo Y Tế</h1>
//             <p className="text-gray-600 mt-1">Tổng số: {reports.length} báo cáo</p>
//           </div>
//           <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
//             <Plus size={20} />
//             Xem lịch
//           </button>
//         </div>

//         <div className="space-y-4">
//           {reports.map((report) => (
//             <div
//               key={report.id}
//               className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
//             >
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex items-center gap-4">
//                   <h2 className="text-xl font-semibold text-gray-900">
//                     Báo Cáo #{report.number}
//                   </h2>
//                   <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
//                     {report.id}
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <button 
//                     onClick={() => onViewDetail(report)}
//                     className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                   >
//                     <Eye size={20} />
//                   </button>
//                   <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
//                     <Edit2 size={20} />
//                   </button>
//                   <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
//                     <Trash2 size={20} />
//                   </button>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2 text-gray-600 mb-6">
//                 <Calendar size={18} />
//                 <span>lúc {report.time} {report.date}</span>
//               </div>

//               <div className="grid md:grid-cols-2 gap-6 mb-4">
//                 <div>
//                   <h3 className="text-sm font-semibold text-gray-700 mb-2">Triệu chứng</h3>
//                   <p className="text-gray-600">{report.symptoms}</p>
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-semibold text-gray-700 mb-2">Chẩn đoán</h3>
//                   <p className="text-gray-600">{report.diagnosis}</p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2 text-purple-600 pt-4 border-t border-gray-100">
//                 <Pill size={18} />
//                 <span className="font-medium">{report.medications.length} loại thuốc được kê đơn</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // Component: Chi tiết báo cáo
// function ReportDetail({ report, onBack }) {
//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       <div className="max-w-4xl mx-auto">
//         <button
//           onClick={onBack}
//           className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
//         >
//           <ArrowLeft size={20} />
//           Quay lại
//         </button>

//         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//           {/* Header */}
//           <div className="p-6 border-b border-gray-200">
//             <div className="flex items-start justify-between">
//               <div>
//                 <h1 className="text-2xl font-bold text-blue-600 mb-1">BÁO CÁO Y TẾ</h1>
//                 <p className="text-gray-600">Medical Report</p>
//               </div>
//               <div className="text-right">
//                 <div className="flex items-center justify-end gap-2 text-gray-600 mb-1">
//                   <Calendar size={16} />
//                   <span>{report.date}</span>
//                 </div>
//                 <p className="text-sm text-gray-500">ID: {report.id}</p>
//               </div>
//             </div>
//           </div>

//           <div className="p-6 space-y-6">
//             {/* Triệu Chứng */}
//             <div>
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
//                   <Heart className="text-red-600" size={20} />
//                 </div>
//                 <h2 className="text-lg font-semibold">Triệu Chứng</h2>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-4">
//                 <p className="text-gray-600">{report.symptoms}</p>
//               </div>
//             </div>

//             {/* Chẩn Đoán */}
//             <div>
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
//                   <ClipboardList className="text-green-600" size={20} />
//                 </div>
//                 <h2 className="text-lg font-semibold">Chẩn Đoán</h2>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-4">
//                 <p className="text-gray-600">{report.diagnosis}</p>
//               </div>
//             </div>

//             {/* Đơn Thuốc */}
//             <div>
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
//                   <Pill className="text-purple-600" size={20} />
//                 </div>
//                 <h2 className="text-lg font-semibold">Đơn Thuốc</h2>
//               </div>
//               <div className="space-y-3">
//                 {report.medications.map((med, index) => (
//                   <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <h3 className="font-medium text-gray-900 mb-2">{med.name}</h3>
//                         <p className="text-sm text-gray-600">
//                           <span className="font-medium">Hướng dẫn:</span> {med.instruction}
//                         </p>
//                       </div>
//                       <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium ml-4 whitespace-nowrap">
//                         {med.dosage}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Ghi Chú */}
//             <div>
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
//                   <FileText className="text-yellow-600" size={20} />
//                 </div>
//                 <h2 className="text-lg font-semibold">Ghi Chú</h2>
//               </div>
//               <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
//                 <p className="text-gray-600">{report.notes}</p>
//               </div>
//             </div>

//             {/* Footer */}
//             <div className="pt-6 border-t border-gray-200">
//               <div className="flex items-end justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600 mb-1">Mã Bệnh Nhân</p>
//                   <p className="text-gray-900 font-mono">{report.patientId}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm text-gray-600 mb-8">Chữ ký bác sĩ</p>
//                   <div className="border-t border-gray-300 w-48"></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Component chính
// export default function MedicalReportManager() {
//   const [selectedReport, setSelectedReport] = useState(null);
//   const [reports] = useState([
//     {
//       id: '69c7d718-196e-4b44-b0a6-085d26b48437',
//       number: 1,
//       date: '2 tháng 12, 2025',
//       time: '15:00',
//       symptoms: 'Mô tả triệu chứng...',
//       diagnosis: 'Chẩn đoán bệnh...',
//       medications: [
//         {
//           name: 'Tên thuốc A',
//           dosage: '1 viên/ngày',
//           instruction: 'Uống sau ăn'
//         },
//         {
//           name: 'Tên thuốc B',
//           dosage: '5ml/lần',
//           instruction: 'Uống sáng tối'
//         }
//       ],
//       notes: 'Ghi chú thêm (tùy chọn)',
//       patientId: '69c7d718-196e-4b44-b0a6-085d26b48437'
//     }
//   ]);

//   if (selectedReport) {
//     return (
//       <ReportDetail 
//         report={selectedReport} 
//         onBack={() => setSelectedReport(null)} 
//       />
//     );
//   }

//   return (
//     <ReportList 
//       reports={reports} 
//       onViewDetail={(report) => setSelectedReport(report)} 
//     />
//   );
// }


