'use client';


import React, { useState } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import dynamic from 'next/dynamic';

const ClinicInviteVet = dynamic(() => import('@/components/clinic/Clinic-InviteVet'));

export default function VetListPage() {
    const [showSearch, setShowSearch] = useState(false);
    return (
      <div >
            <Sidebar setShowSearch={setShowSearch} showSearch={showSearch} />
         
                <ClinicInviteVet />
          
        </div>
    );
}
