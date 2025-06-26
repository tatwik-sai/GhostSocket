import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import { Suspense } from "react";
import { ClerkLoaded, ClerkLoading } from '@clerk/nextjs'




export default function SignInPage() {
  return (
    <div className="flex h-screen w-full">
      <div className="hidden md:block md:w-1/2 h-full">
        <img
          src="/auth-bg.jpg"
          alt="Auth background"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col  items-center justify-center w-1/2">
        <div className="flex items-center gap-[1px] mb-10">
          <Image src="/logo.svg" alt="GhostSocket" width={50} height={50} />
          <h1 className="text-3xl font-bold text-gray-500">Ghost</h1>
          <h1 className="text-3xl font-bold text-red-500">Socket</h1>
        </div>
        <ClerkLoaded>
          <SignIn 
          appearance={{
            layout: {
              socialButtonsVariant: "block", // MUST be block for full width
            },
            variables: {
              colorPrimary: "#EF4444", // Tailwind red-500
              colorBackground: "#19191C",
              colorText: "#FFFFFF",
              colorTextSecondary: "#6B7280",
              colorTextOnPrimaryBackground: "#FFFFFF",
              fontFamily: "Inter, sans-serif",
            },
            elements: {
              formButtonPrimary:
                "bg-red-600 hover:bg-red-700 transition-all text-white font-semibold active:scale-95",
            },
          }}
          />
        </ClerkLoaded>
        <ClerkLoading>
          <div className="text-white">Loading...</div>
        </ClerkLoading>
      </div>
    </div>
  )
}