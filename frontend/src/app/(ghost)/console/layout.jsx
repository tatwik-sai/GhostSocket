"use client";
import { SocketProvider } from "@/context/SocketContext";
import Image from "next/image";
import { navItems } from "./nav_items";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton"

function UserSkeleton() {
  return (
    <div className="flex items-center gap-3 mb-10 pr-5 pl-3 cursor-pointer">
      <div className="flex items-center">
        <Skeleton className="w-[55px] h-[55px] rounded-full bg-white/10" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="w-[200px] h-[20px] bg-white/10" />
        <Skeleton className="w-[210px] h-[20px] bg-white/10" />
      </div>
    </div>
  )
}

export default function ConsoleLayout({ children }) {
  const {signOut} = useAuth();
  const pathname = usePathname();
  const {isLoaded, user} = useUser();
  return (
    <SocketProvider>
        <div className="flex w-[100vw] h-[100vh]">
            <div className="flex flex-col w-[250px] md:w-[300px] bg-dark-3">
                <div className="flex items-center gap-[1px] pr-10 pl-3 pt-5 mb-10">
                  <Image src="/logo.svg" alt="GhostSocket" width={50} height={50} />
                  <h1 className="text-2xl font-bold text-white">GhostSocket</h1>                
                </div>
                {isLoaded ? (
                <div className="flex items-center gap-3 mb-10 pr-5 pl-3 cursor-pointer">
                  <Image src={user ? user.imageUrl : "/default-profile.png"} alt="profile" width={55} height={55} className="rounded-full object-cover"/>
                  <div className="flex flex-col">
                    <h3 className="body-bold text-lg text-white overflow-hidden text-ellipsis w-[150px] md:w-[200px] whitespace-nowrap">
                      {user && (user.fullName ? user.fullName : user.primaryEmailAddress.emailAddress)}
                      </h3>
                    <h3 className="opacity-50 text-light-3 overflow-hidden text-ellipsis w-[150px] md:w-[210px] whitespace-nowrap">{user && user.primaryEmailAddress.emailAddress}</h3>
                  </div>
                </div>
                ) : (
                  <UserSkeleton />
                )}
                <ul className="flex flex-col gap-3 mr-2 ml-2 flex-1">
                  {navItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex gap-3 items-center rounded-lg p-3 transition-colors ${
                          pathname === item.href
                            ? "bg-primary-red"
                            : "hover:bg-white/10"
                        }`}
                      >
                        <Image src={item.imgURL} alt={item.name} width={28} height={28} className={`${pathname === item.href ? "invert brightness-0" : ""}`}/>
                        <span className="text-white text-md font-medium">{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-3 ml-2">
                  <Button className="flex gap-3 items-center p-3 w-full justify-start cursor-pointer" onClick={() => signOut()}>
                    <Image src="/navbar-icons/logout.svg" alt="logout" width={28} height={28} />
                    <span className="text-white text-md font-medium">Logout</span>
                  </Button>
                  <Link href="/sign-in" className="flex gap-3 items-center p-3">
                    <Image src="/navbar-icons/settings.svg" alt="settings" width={28} height={28} />
                    <span className="text-white text-md font-medium">Settings</span>
                  </Link>
                </div>
              
            </div>
            <div className="w-[1px] h-full bg-white/10"></div>
            <div className="flex-1 bg-dark-1 overflow-x-hidden">
                  {children}
            </div>
        </div>
    </SocketProvider>
  );
}
