"use client"

import { AppSidebar } from '@/components/app-sidebar'
import ProfileDropdown from '@/components/ProfileDropdown'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import React from 'react'
import { useSession } from "next-auth/react";

function Community() {
    const { data: session } = useSession();

    return (
        <div className="flex h-screen w-screen bg-[#0a090f] selection:bg-white selection:text-black">
            <AppSidebar />
            <div className="flex-1 overflow-y-auto">
                <div className="flex p-4 justify-between items-center border-b-[1px] border-[#353539] sticky top-0 bg-[#0a090f] z-10">
                    <div className="relative w-1/3">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-6 w-6" />
                        <Input 
                            type="text" 
                            placeholder="Search" 
                            className="pl-10 text-lg border-[1px] border-[#353539] text-white" 
                        />
                    </div>
                    <div className="flex justify-center items-center gap-10">
                        {session?.user && <ProfileDropdown user={session.user} />}
                    </div>
                </div>
                <div className="max-w-4xl pt-10 mx-auto flex items-center justify-center">
                   <div className='text-white'>
                        <h1>This feature is only for Loopy's premium users</h1>
                   </div>
                </div>
            </div>
        </div>
    )
}

export default Community
