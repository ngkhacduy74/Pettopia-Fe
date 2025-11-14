# Work Breakdown Structure (WBS) - Pettopia Clinic Management System

**Project**: Pettopia - Nền tảng quản lý dịch vụ thú cưng trực tuyến  
**Ngôn ngữ**: TypeScript/React (Next.js 15)  
**Cơ sở dữ liệu**: MongoDB  
**Thời gian**: Capstone Project 2024-2025

---

## 1. QUẢN LÝ DỰ ÁN VÀ LẬP KẾ HOẠCH

### 1.1 Xác định Yêu Cầu & Phạm Vi
- Phân tích yêu cầu từ stakeholders (Chủ phòng khám, Bác sĩ, Khách hàng)
- Xác định tính năng chính & phụ
- Lập tài liệu yêu cầu chức năng (FRD)

### 1.2 Thiết kế Kiến Trúc Hệ Thống
- Kiến trúc tổng thể (Frontend + Backend + Database)
- Data model & Entity Relationship Diagram (ERD)
- API specification & endpoints
- Authentication & Authorization flow

### 1.3 Lập Kế Hoạch & Quản Lý Rủi Ro
- Tạo timeline & milestones
- Phân bổ tài nguyên & công việc
- Xác định rủi ro & chiến lược giảm thiểu

---

## 2. FRONTEND - USER APPLICATION (pettopia-fe)

### 2.1 Infrastructure & Setup
- Cài đặt Next.js 15 + TypeScript
- Cấu hình Tailwind CSS & PostCSS
- Cấu hình đăng nhập (Auth via Clerk/JWT)
- Middleware xác thực & phân quyền
- Cấu hình axios interceptor & API base URL

### 2.2 Authentication Module
- **Trang đăng nhập** (`/auth/login`)
  - Login form với email/password
  - Xác thực JWT token
  - Lưu token vào localStorage
  - Error handling & loading states
- **Trang đăng ký** (`/auth/register`)
  - Form đăng ký khách hàng
  - Validation form
  - API call tạo tài khoản
- **JWT Token Management** (`utils/jwt.ts`)
  - Decode/encode token
  - Token expiry check
  - Refresh token logic

### 2.3 User Dashboard
- **User Dashboard** (`/user/dashboard`)
  - Overview thông tin cá nhân
  - Danh sách thú cưng & trang thái
  - Lịch sử đặt lịch & dịch vụ
- **Profile Management**
  - Xem/chỉnh sửa thông tin cá nhân
  - Đổi mật khẩu
  - Xóa tài khoản

### 2.4 Pet Management
- **Số lượng thú cưng** (`NumberofPet.tsx`)
  - Hiển thị danh sách thú cưng
  - Thêm/xoá thú cưng
- **Biểu mẫu chỉnh sửa thú cưng** (`EditPetForm.tsx`)
  - Cập nhật thông tin thú cưng
  - Upload ảnh thú cưng
  - Validation form

### 2.5 Booking Module
- **Booking Page** (`/user/user-booking`)
  - Bước 1: Chọn phòng khám (clinic)
  - Bước 2: Chọn ngày & ca (shift/date)
  - Bước 3: Chọn dịch vụ
  - Bước 4: Chọn thú cưng cho từng dịch vụ
  - Xem tổng tiền & confirm đặt lịch
  - Upload certificate nếu cần
- **Service Calculation**
  - Tính toán tổng tiền dựa trên dịch vụ & thú cưng
  - Hiển thị chi tiết dịch vụ & giá
- **Form Submission**
  - Gửi request đặt lịch
  - Xử lý response & chuyển hướng

### 2.6 Certificate Management
- **Submit Clinic Certificate** (`/user/submit-clinic-certificate`)
  - Upload chứng chỉ phòng khám
  - Xác minh tài liệu
- **Submit Vet Certificate** (`/user/submit-vet-certificate`)
  - Upload chứng chỉ bác sĩ thú y
  - Xác minh tài liệu
- **Waiting Page** (`/user/waitting`)
  - Hiển thị trạng thái xét duyệt

### 2.7 Communication Module
- **Chat Component** (`Chat.tsx`)
  - Giao diện chat thời gian thực
  - Lịch sử tin nhắn
  - Notification badge
- **Notification System** (`Notification.jsx`)
  - Hiển thị thông báo từ hệ thống
  - Toast notifications

### 2.8 Calendar & Scheduling
- **Continuous Calendar** (`ContinuousCalendar.tsx`)
  - Hiển thị lịch liên tục
  - Chọn ngày & ca
  - Hiển thị khả dụng
- **Upcoming Meetings** (`UpcomingMeetings.tsx`)
  - Danh sách cuộc hẹn sắp tới
  - Chi tiết cuộc hẹn

### 2.9 UI Components & Layouts
- **Header Component** (`Header.tsx`)
  - Navigation bar
  - User menu
  - Logo & branding
- **User Navbar** (`UserNavbar.tsx`)
  - Sidebar navigation
  - User info
  - Logout button
- **Footer Component** (`Footer.jsx`)
  - Contact info
  - Links
  - Social media
- **Custom Alert** (`CustomAlert.tsx`)
  - Modal alerts
  - Confirmation dialogs
- **Layout Structure** (`layout.tsx`)
  - Global layout cho user app
  - Metadata & SEO
  - Responsive design

### 2.10 Services Layer (API Integration)
- **Auth Service** (`services/auth/authService.ts`)
  - Login/Logout APIs
  - Register API
  - Token refresh
- **Pet Care Service** (`services/petcare/`)
  - CRUD thú cưng
  - Upload ảnh
  - Danh sách thú cưng
- **Communication Service** (`services/communication/`)
  - Gửi/nhận tin nhắn
  - Fetch notifications
- **Context API** (`contexts/UserContext.tsx`)
  - Global user state
  - Authentication state
  - Pet list state

### 2.11 Styling & Responsive Design
- Tailwind CSS configuration
- Mobile-first responsive design
- Dark/Light mode support (tùy chọn)
- CSS utilities & custom styles

---

## 3. FRONTEND - CLINIC/PARTNER APPLICATION (pettopia-clinic-fe)

### 3.1 Infrastructure & Setup
- Cài đặt Next.js 15 + TypeScript + Turbopack
- Cấu hình Tailwind CSS & Icons (lucide-react, heroicons)
- Cấu hình toastify (react-hot-toast)
- Chart libraries (recharts)
- Middleware & authentication

### 3.2 Authentication & Authorization
- **Login Module**
  - Xác thực clinic/admin
  - JWT token management
- **Role-based Access Control**
  - Admin: Quản lý toàn bộ hệ thống
  - Clinic Manager: Quản lý phòng khám
  - Staff: Xem/quản lý dịch vụ
  - Veterinarian: Xem lịch làm việc

### 3.3 Admin Dashboard
- **Manager User** (`/admin/manager-user`)
  - Danh sách người dùng
  - Phê duyệt/từ chối đăng ký
  - Xoá người dùng
  - Edit thông tin người dùng
- **Dashboard Overview** (`/admin/dashboard`)
  - Thống kê tổng quát
  - Biểu đồ doanh thu
  - Số lượng booking/dịch vụ

### 3.4 Clinic Management Module
- **Clinic Dashboard** (`/clinic/dashboard`)
  - Overview phòng khám
  - Thống kê dịch vụ
  - Thu nhập/chi phí
- **Service Management** (`/clinic/service`)
  - **Clinic-Service Component** (`Clinic-Service.tsx`)
    - Danh sách dịch vụ (pagination)
    - Thêm dịch vụ mới (modal form)
    - Chỉnh sửa dịch vụ
    - Xoá dịch vụ (với confirmation)
    - Search & filter dịch vụ
    - Định dạng tiền tệ (VND)
  - **API Calls**
    - `getClinicServices` - Fetch danh sách
    - `createClinicService` - Tạo mới
    - `updateClinicService` - Cập nhật
    - `deleteClinicService` - Xoá
- **Shift Management** (`/clinic/shift`)
  - **Clinic-Shift Component** (`Clinic-Shift.tsx`)
    - Danh sách ca làm việc
    - Thêm ca mới
    - Chỉnh sửa ca
    - Gán nhân viên vào ca
- **Vet Management** (`/clinic/vet-list`)
  - Danh sách bác sĩ thú y
  - Phê duyệt bác sĩ
  - Gán bác sĩ vào dịch vụ
- **Invite Vet** (`/clinic/invite-vet`)
  - **Clinic-InviteVet Component** (`Clinic-InviteVet.tsx`)
    - Mời bác sĩ thú y
    - Gửi invitation link
  - **ClinicInviteVet Component** (`ClinicInviteVet.tsx`)
    - Form mời bác sĩ
- **Request List** (`/clinic/request-list`)
  - Danh sách yêu cầu booking
  - Chỉnh sửa trạng thái
  - Xem chi tiết yêu cầu

### 3.5 Staff Module
- **Staff Dashboard** (`/staff/dashboard`)
  - Overview công việc
  - Lịch làm việc
- **Request List** (`/staff/request-clinic-list` & `/staff/request-vet-list`)
  - **RequestTable Component** (`RequestTable.tsx`)
    - Hiển thị danh sách yêu cầu
    - Pagination
    - Filter by status
  - **ClinicFormDetail Component** (`ClinicFormDetail.tsx`)
    - Chi tiết yêu cầu phòng khám
    - Xem/chỉnh sửa thông tin
  - **VetFormDetail Component** (`VetFormDetail.tsx`)
    - Chi tiết yêu cầu bác sĩ

### 3.6 Veterinarian Module
- **Vet Dashboard** (`/vet/vet-dashboard`)
  - Lịch làm việc
  - Lịch hẹn
  - Danh sách bệnh nhân

### 3.7 Common Components
- **Sidebar Navigation** (`Sidebar.tsx`)
  - Menu chính
  - User info
  - Logout
- **Dashboard Layout** (`Dashboard.tsx`)
  - Layout cho trang dashboard
  - Statistics cards
- **Charts & Analytics**
  - Biểu đồ doanh thu (recharts)
  - Biểu đồ số lượng booking

### 3.8 Services Layer
- **Clinic Service** (`services/partner/clinicService.ts`)
  - CRUD clinics
  - Clinic profile
  - Clinic verification
- **Service Management** (`services/partner/clinicService.ts`)
  - CRUD services
  - Service pricing
  - Service availability
- **Shift Service** (`services/partner/shiftService.ts`)
  - CRUD shifts
  - Shift assignment
  - Shift scheduling
- **Veterinarian Service** (`services/partner/veterianrianService.ts`)
  - Vet CRUD
  - Vet verification
  - Vet scheduling

### 3.9 Form Components & Validation
- **React Hook Form** integration
- **Form Validation**
  - Email validation
  - Required field checks
  - Price/Duration validation
  - Conditional validation

### 3.10 Styling & UI
- Tailwind CSS with custom configuration
- Icon libraries (lucide-react, heroicons)
- Toast notifications (react-hot-toast)
- Responsive design for all screen sizes

---

## 4. BACKEND (Assumed - Not in Frontend Repo)

### 4.1 API Development
- Express/Node.js server setup
- RESTful API design
- JWT authentication middleware
- Error handling & logging

### 4.2 Database Design (MongoDB)
- User schema (customer, clinic, vet, staff, admin)
- Pet schema
- Service schema
- Shift schema
- Booking schema
- Certificate schema
- Message/Chat schema

### 4.3 Authentication & Security
- JWT token generation & validation
- Password hashing (bcrypt)
- Role-based access control
- CORS configuration
- Rate limiting

### 4.4 Business Logic
- Booking logic
- Service availability checking
- Revenue calculation
- Vet assignment logic
- Certificate verification

### 4.5 File Management
- Image upload & storage
- Certificate file storage
- AWS S3 integration (optional)

### 4.6 Communication
- Real-time messaging (Socket.io)
- Notification system
- Email notifications

### 4.7 Reporting & Analytics
- Revenue reports
- Booking statistics
- Vet performance metrics

---

## 5. TESTING & QUALITY ASSURANCE

### 5.1 Unit Testing
- Test individual components
- Test service functions
- Test form validation
- Jest + React Testing Library

### 5.2 Integration Testing
- API integration tests
- Form submission flows
- Authentication flows
- State management tests

### 5.3 E2E Testing
- Booking flow end-to-end
- Admin workflows
- Clinic management workflows
- Selenium / Cypress

### 5.4 Manual Testing
- UI/UX testing
- Browser compatibility
- Responsive design testing
- Performance testing

### 5.5 Bug Fixing & Optimization
- Bug tracking & fixing
- Performance optimization
- Code review & refactoring
- Security audit

---

## 6. DEPLOYMENT & DEVOPS

### 6.1 Environment Setup
- Development environment
- Staging environment
- Production environment
- Environment variables configuration

### 6.2 Frontend Deployment
- Build optimization
- Static site generation (SSG)
- Image optimization
- Code splitting

### 6.3 Deployment Platforms
- Vercel deployment
- Docker containerization
- CI/CD pipeline setup

### 6.4 Monitoring & Logging
- Application monitoring
- Error logging (Sentry)
- Performance monitoring
- User analytics

### 6.5 Maintenance & Support
- Bug fixes & patches
- Performance tuning
- Security updates
- Feature enhancements

---

## 7. DOCUMENTATION

### 7.1 Technical Documentation
- API documentation
- Database schema documentation
- Architecture documentation
- Deployment guide

### 7.2 User Documentation
- User manual
- Admin guide
- Clinic management guide
- FAQ

### 7.3 Code Documentation
- JSDoc comments
- Inline code comments
- Component documentation
- Service documentation

### 7.4 Project Documentation
- Project README
- Setup instructions
- Development guidelines
- Contribution guidelines

---

## 8. PROJECT MANAGEMENT & COORDINATION

### 8.1 Team Communication
- Daily standups
- Weekly reviews
- Sprint planning
- Retrospectives

### 8.2 Documentation & Tracking
- JIRA/Trello task tracking
- Git version control
- Code review process
- Change log maintenance

### 8.3 Stakeholder Management
- Demo & feedback sessions
- Status reporting
- Requirements clarification
- Approval workflows

---

## 9. DELIVERABLES & MILESTONES

### Phase 1: Planning & Design (Week 1-2)
- ✅ Requirements document
- ✅ Architecture design
- ✅ Database schema
- ✅ UI/UX wireframes

### Phase 2: Frontend Development (Week 3-6)
- ✅ User application (pettopia-fe)
- ✅ Clinic application (pettopia-clinic-fe)
- ✅ Component library
- ✅ API integration

### Phase 3: Backend Development (Week 4-7)
- ✅ API endpoints
- ✅ Database setup
- ✅ Authentication system
- ✅ Business logic

### Phase 4: Integration & Testing (Week 8-9)
- ✅ End-to-end testing
- ✅ Bug fixes
- ✅ Performance optimization
- ✅ Security audit

### Phase 5: Deployment & Launch (Week 10)
- ✅ Staging deployment
- ✅ Production deployment
- ✅ Monitoring setup
- ✅ Launch announcement

---

## 10. RESOURCE ALLOCATION

| Role | Responsibility | Workload |
|------|---|---|
| Frontend Lead | Design & implement UI components | 40% |
| Backend Lead | API development & database design | 40% |
| Full Stack Dev | Integration & feature development | 30% |
| QA Engineer | Testing & bug tracking | 20% |
| DevOps Engineer | Deployment & infrastructure | 20% |
| Project Manager | Coordination & tracking | 30% |

---

## 11. RISK & MITIGATION

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Scope creep | Schedule delay | High | Clear requirements, change control |
| API delays | Integration block | Medium | Parallel development, mock APIs |
| Performance issues | Poor UX | Medium | Early optimization, load testing |
| Security vulnerabilities | Data breach | Medium | Security audit, code review |
| Team turnover | Knowledge loss | Low | Documentation, knowledge sharing |

---

## 12. SUCCESS CRITERIA

- ✅ All user stories completed
- ✅ 100% test coverage for critical paths
- ✅ Performance: < 2s page load time
- ✅ Zero critical security vulnerabilities
- ✅ User satisfaction > 4/5
- ✅ 99.9% uptime SLA
- ✅ All documentation complete
- ✅ On-time & on-budget delivery

---

**Document Version**: 1.0  
**Last Updated**: November 13, 2025  
**Owner**: Capstone Project Team
