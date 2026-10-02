'use client'

import { signIn, signOut, useSession } from 'next-auth/react'

export function AuthButtons() {
    const {data:session, status} = useSession()

    if (status === 'loading') return <p>Loading...</p>

    if(session) {
        return (
            <div>
                <p>Signed in as {session.user?.email}</p>
                <button className='flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]' onClick={() => signOut()}>Sign out</button>
            </div>
        )
    }

    return <button className='flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]' onClick={() => signIn('google')}>Sign in with Google</button>

}