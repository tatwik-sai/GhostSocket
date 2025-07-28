"use client";
import Image from "next/image";
import { navItems } from "./nav_items";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton"
import { useClerk } from "@clerk/clerk-react";
import { IoLogOutSharp, IoMenu } from "react-icons/io5";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RiAccountCircleLine } from "react-icons/ri";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"


function UserSkeleton() {
  return (
    <div className="flex items-center gap-3 mb-10 pr-5 pl-3 cursor-pointer">
      <div className="flex items-center">
        <Skeleton className="w-[55px] h-[55px] rounded-full bg-white/10" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="w-[180px] h-[20px] bg-white/10" />
        <Skeleton className="w-[190px] h-[20px] bg-white/10" />
      </div>
    </div>
  )
}

export default function ConsoleLayout({ children }) {
  const { signOut } = useAuth();
  const pathname = usePathname();
  const { isLoaded, user } = useUser();
  const { openUserProfile } = useClerk();


  return (
    <>
      <div className="flex flex-col md:flex-row w-[100vw] h-[100vh]">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col border-r   border-white/10  w-[250px] md:w-[280px] bg-dark-2">
          {/* Logo */}
          <Link href={"/"} className="flex items-center gap-[2px] pr-10 pl-3 pt-5 mb-10 cursor-pointer">
            <Image src="/logo.svg" className="" alt="GhostSocket" width={45} height={45} />
            <h1 className="text-2xl font-bold text-white">Ghost</h1>
            <h1 className="text-2xl font-bold text-purple-1">Socket</h1>
          </Link>
          {/* User Profile */}
          {isLoaded ? (
            <div className="flex items-center gap-3 mb-10 pr-5 pl-3 cursor-pointer"
              onClick={() => openUserProfile({
                appearance: {
                  baseTheme: "dark",
                  variables: {
                    colorPrimary: "#6C28D9",
                    colorBackground: "#101010",
                    colorInputBackground: "#ffffff1a",
                    colorInputText: "#ffffff",
                    colorText: "#ffffff",
                    colorTextSecondary: "#a1a1a1",
                    colorShimmer: "#ffffff",
                    colorAlphaShade: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "5px",
                    fontFamily: "inherit",
                    colorDanger: "#ef4444",
                    colorSuccess: "#10b981",
                    colorWarning: "#f59e0b",
                  }
                },
              })}>
              <Image src={user ? user.imageUrl : "/default-profile.png"} alt="profile" width={55} height={55} className="rounded-full object-cover" />
              <div className="flex flex-col">
                <h3 className="body-bold text-lg text-white overflow-hidden text-ellipsis w-[150px] md:w-[180px] whitespace-nowrap">
                  {user && (user.fullName ? user.fullName : user.primaryEmailAddress.emailAddress)}
                </h3>
                <h3 className="opacity-50 text-light-3 overflow-hidden text-ellipsis w-[150px] md:w-[190px] whitespace-nowrap">{user && user.primaryEmailAddress.emailAddress}</h3>
              </div>
            </div>
          ) : (
            <UserSkeleton />
          )}

          {/* Navigation Items */}
          <ul className="flex flex-col gap-3 mr-2 ml-2 mt-2 flex-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex gap-3 items-center rounded-lg p-2 transition-colors ${pathname === item.href
                      ? "bg-purple-1 text-white"
                      : "hover:bg-white/10"
                    }`}
                >
                  <Image src={item.imgURL} alt={item.name} width={28} height={28} className={`${pathname === item.href ? "invert brightness-0" : ""}`} />
                  <span className="text-white text-md font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          {/* Logout Button */}
          <div className="flex flex-col gap-3 ml-2">
            <Button className="flex gap-3 items-center p-3 pb-8 w-full justify-start cursor-pointer" onClick={() => signOut()}>
              <Image src="/navbar-icons/logout.svg" alt="logout" width={28} height={28} />
              <span className="text-white text-md font-medium">Logout</span>
            </Button>
          </div>

        </div>

        {/* Top Bar */}
        <div className="bg-dark-2 w-full flex md:hidden border-b border-white/10 justify-between">
          {/* Mobile Menu and Logo */}
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <IoMenu className='text-4xl hover:bg-white/10 cursor-pointer rounded p-1' />
              </SheetTrigger>
              <SheetContent side="left" className='bg-dark-3 border-none w-70'>
                <SheetHeader>
                  <SheetTitle>Ghost Menu</SheetTitle>
                </SheetHeader>
                <ul className="flex flex-col gap-3 mr-2 ml-2 mt-2 flex-1">
                  {navItems.map((item) => (
                    <li key={item.name}>
                      <SheetClose asChild>
                        <Link
                          href={item.href}
                          className={`flex gap-3 items-center rounded-lg p-2 transition-colors ${pathname === item.href
                              ? "bg-purple-1 text-white"
                              : "hover:bg-white/10"
                            }`}
                        >
                          <Image src={item.imgURL} alt={item.name} width={28} height={28} className={`${pathname === item.href ? "invert brightness-0" : ""}`} />
                          <span className="text-white text-md font-medium">{item.name}</span>
                        </Link>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button className={"bg-dark-4 hover:bg-dark-5/50"}>Close</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            <Link href={"/"} className="flex items-center gap-[2px]  pr-10 py-2  cursor-pointer">
              <Image src="/logo.svg" className="" alt="GhostSocket" width={40} height={40} />
              <h1 className="text-2xl font-bold text-white">Ghost</h1>
              <h1 className="text-2xl font-bold text-purple-1">Socket</h1>
            </Link>
          </div>
          {/* User Profile */}
          <div className="flex items-center gap-2 pr-2">
            <Popover>
              <PopoverTrigger asChild>
                <Image src={user ? user.imageUrl : "/default-profile.png"} alt="profile" width={40} height={40} className="rounded-full cursor-pointer object-cover" />
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-dark-3 border-dark-5 shadow-lg rounded-xl flex flex-col">
                <div className="flex gap-2 border-b pb-2 border-white/10 items-center">
                  <Image src={user ? user.imageUrl : "/default-profile.png"} alt="profile" width={40} height={40} className="rounded-full object-cover" />
                  <div className="flex flex-col">
                    <h3 className="body-bold text-md text-white overflow-hidden text-ellipsis w-[200px] whitespace-nowrap">
                      {user && (user.fullName ? user.fullName : user.primaryEmailAddress.emailAddress)}
                    </h3>
                    <h3 className="opacity-50 text-light-3 overflow-hidden text-ellipsis w-[200px] whitespace-nowrap text-sm">{user && user.primaryEmailAddress.emailAddress}</h3>
                  </div>
                </div>

                <div className="flex flex-col mt-2">
                  <div className="flex gap-2 hover:bg-white/10 cursor-pointer items-center p-2 rounded-md"
                    onClick={() => openUserProfile({
                      appearance: {
                        baseTheme: "dark",
                        variables: {
                          colorPrimary: "#6C28D9",
                          colorBackground: "#101010",
                          colorInputBackground: "#ffffff1a",
                          colorInputText: "#ffffff",
                          colorText: "#ffffff",
                          colorTextSecondary: "#a1a1a1",
                          colorShimmer: "#ffffff",
                          colorAlphaShade: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "5px",
                          fontFamily: "inherit",
                          colorDanger: "#ef4444",
                          colorSuccess: "#10b981",
                          colorWarning: "#f59e0b",
                        }
                      },
                    })}
                  >
                    <RiAccountCircleLine className="text-white text-2xl" />
                    <span className="text-white text-md">My Profile</span>
                  </div>
                  <div className="flex gap-2 hover:bg-white/10 cursor-pointer items-center p-2 rounded-md" onClick={() => signOut()}>
                    <IoLogOutSharp className="text-white text-2xl" />
                    <span className="text-white text-md">Logout</span>
                  </div>
                </div>

              </PopoverContent>
            </Popover>

          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-dark-1 ">
          {children}
        </div>

      </div>

    </>
  );
}
