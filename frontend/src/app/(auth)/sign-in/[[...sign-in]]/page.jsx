import { SignIn } from "@clerk/nextjs";
import { ClerkLoaded, ClerkLoading } from '@clerk/nextjs'


export default function SignInPage() {
  return (
    <>
    <ClerkLoaded>
      <SignIn 
        appearance={{
          layout: {
            socialButtonsVariant: "block",
          },
          variables: {
            colorPrimary: "#6C28D9",
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
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-purple-1 rounded-full animate-bounce-more"></div>
        <div className="w-2 h-2 bg-purple-1 rounded-full animate-bounce-more" style={{animationDelay: '0.1s'}}></div>
        <div className="w-2 h-2 bg-purple-1 rounded-full animate-bounce-more" style={{animationDelay: '0.2s'}}></div>
      </div>
    </ClerkLoading>
  </>
  )
}