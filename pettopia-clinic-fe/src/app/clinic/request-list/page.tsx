import React from 'react'
import RequestTable from '@/components/RequestTable'

const clinicMembers = [
  {
    name: 'Dr. Alice Brown',
    email: 'alice.brown@clinic.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'Physician',
    department: 'Medical',
    status: 'Active'
  },
  {
    name: 'Dr. James Lee',
    email: 'james.lee@clinic.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'Surgeon',
    department: 'Surgical',
    status: 'On Leave'
  },
  {
    name: 'Emma Davis',
    email: 'emma.davis@clinic.com',
    avatar: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'Nurse',
    department: 'Nursing',
    status: 'Active'
  }
];

const clinicDepartments = ['Medical', 'Surgical', 'Nursing', 'Administration'];

export default function ClinicPage() {
  return (
    <RequestTable
      data={clinicMembers}
      title="Request List"
      departments={clinicDepartments}
    />
  )
}