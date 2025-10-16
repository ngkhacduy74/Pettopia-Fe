import React from 'react'
import RequestTable from '@/components/RequestTable'

const staffMembers = [
  {
    name: 'Tom Cook',
    email: 'tom.cook@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'Senior Developer',
    department: 'Engineering',
    status: 'Active'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'Product Designer',
    department: 'Design',
    status: 'Active'
  },
  {
    name: 'Michael Roberts',
    email: 'michael.roberts@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'Marketing Manager',
    department: 'Marketing',
    status: 'On Leave'
  },
  {
    name: 'Lisa Wang',
    email: 'lisa.wang@example.com',
    avatar: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'Sales Director',
    department: 'Sales',
    status: 'Active'
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'Frontend Developer',
    department: 'Engineering',
    status: 'Inactive'
  }
];

const staffDepartments = ['Engineering', 'Design', 'Marketing', 'Sales'];

export default function StaffPage() {
  return (
    <RequestTable
      data={staffMembers}
      title="Staff Members"
      departments={staffDepartments}
    />
  )
}