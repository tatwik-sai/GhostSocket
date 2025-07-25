import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import { ClerkLoaded, ClerkLoading } from '@clerk/nextjs'




export default function AuthLayout({ children }) {
  return (
    <div className="flex h-screen w-full bg-black">
      <div className="hidden lg:block lg:w-1/2 h-full">
        <img
          src="/auth-bg.jpg"
          alt="Auth background"
          className="h-full w-full object-cover overflow-hidden"
        />
      </div>
      <div className="flex flex-col justify-center items-center h-full w-full lg:w-1/2">
        <div className="flex items-center gap-[1px] mb-10">
          <Image src="/logo.svg" alt="GhostSocket" width={50} height={50} />
          <h1 className="text-3xl font-bold text-white">Ghost</h1>
          <h1 className="text-3xl font-bold text-purple-1">Socket</h1>
        </div>
        {children}
      </div>
    </div>
  )
}