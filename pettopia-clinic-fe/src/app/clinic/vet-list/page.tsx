'use client'
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import ClinicInviteVet from '@/components/Clinic-InviteVet';

export default function VetListPage() {
    const [showSearch, setShowSearch] = useState(false);
    return (
        <div className="flex h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
            <Navbar setShowSearch={setShowSearch} showSearch={showSearch} />
            <div className="flex-1 overflow-y-auto">
                <ClinicInviteVet />
            </div>
        </div>
    );
}
