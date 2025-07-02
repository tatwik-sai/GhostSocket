import { SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import Image from "next/image";
import { FaGithub } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import RotatingText from "@/components/RotatingText";
import { FaWindows } from "react-icons/fa";
import DownloadButton from "@/components/DownloadAppButton";


function Navbar() {
  async function launchConsoleAction() {
    "use server";
    const { userId } = await auth();
    if (userId) {
      redirect("/console");
    } else {
      redirect("/sign-in?redirect_url=/console");
    }
  }
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-sm border-b border-white/10 text-white p-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-[1px] ml-0 sm:ml-10">
          <Image src="/logo.svg" alt="GhostSocket" width={50} height={50} />
          <h1 className="text-2xl font-bold text-white">GhostSocket</h1>
        </div>
        <div className="flex items-center gap-2 mr-0 sm:mr-10">
          <Button asChild
            className="grey-secondary-button flex md:hidden"
          >
            <Link href="/login">
              <FaGithub className="w-4 h-4" />
            </Link>
            
          </Button>
          <Button asChild
            className="grey-secondary-button hidden md:flex"
          >
            <Link href="/login">
              <FaRegStar className="w-4 h-4" />
              Star on GitHub
            </Link>
          </Button>
          <form action={launchConsoleAction}>
            <Button  type="submit"
              className="red-primary-button">
                Launch Console
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}

export default function Home() {
  return (
    <>
    <div className="flex flex-col">
      <Navbar />
      
      <div className="relative overflow-hidden mt-16 flex flex-col items-center min-h-screen">
        <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-10 mt-30 md:gap-20 h-full w-full px-4 py-12 md:py-20">
          
          <div className="flex flex-col text-center md:text-left justify-center items-center md:items-start gap-4 max-w-xl">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Remote Control.<br /> Reimagined.
            </h2>
            <h3 className="text-base sm:text-lg md:text-xl text-gray-400">
              Securely access your computer, control apps, and manage files
              <br className="hidden sm:block" />
              in real-time — all through your browser.
            </h3>
            <DownloadButton />
          </div>

          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Control</h2>
            <RotatingText
              texts={["Apps", "Files", "Tasks", "Devices", "Everything!"]}
              mainClassName="px-2 sm:px-3 bg-red-500 text-white text-2xl sm:text-3xl md:text-4xl font-bold overflow-hidden py-1 sm:py-1.5 md:py-2 justify-center rounded-lg"
              staggerFrom={"last"}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
          </div>
        </div>

        <div className="absolute top-[-200px] left-[-200px] w-[400px] h-[400px] bg-red-500/20 blur-3xl rounded-full z-0 hidden sm:block"></div>
        <div className="absolute bottom-[-200px] right-[-200px] w-[400px] h-[400px] bg-pink-500/20 blur-3xl rounded-full z-0 hidden sm:block"></div>
      </div>


    </div>
    </>
  );
}
