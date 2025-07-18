import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Shield, Zap, Globe, Lock, Play, Check, Link, Cable, MousePointerClick } from "lucide-react";
import heroImage from "../../public/hero.png";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FaGithub, FaRegStar } from "react-icons/fa";
import DownloadButton from "@/components/DownloadAppButton";

export default function HeroPage()   {
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
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#0a0a0b]/80 backdrop-blur-md border-b border-[#2a2a2b]/40 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[2px] ml-0">
                <Image src="/logo.svg" className="" alt="GhostSocket" width={45} height={45} />
                <h1 className="text-2xl font-bold text-white">GhostSocket</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center space-x-6">
                <a href="#features" className="text-sm text-gray-400 hover:text-foreground transition-colors">
                    Features
                </a>
                <a href="#how-it-works" className="text-sm text-gray-400 hover:text-foreground transition-colors">
                    How It Works
                </a>
                </div>

                <div className="flex items-center gap-2">

                    <Button asChild
                        className="flex md:hidden border border-[#ffffff1a] hover:border-purple-1/50 hover:bg-purple-1/10"
                    >
                        <a 
                            href="https://github.com/your-username/ghost-socket" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                        >
                            <FaGithub className="w-4 h-4" />
                        </a>
                    </Button>

                    <Button asChild
                        className="hidden md:flex border border-[#ffffff1a] hover:border-purple-1/50 hover:bg-purple-1/10"
                    >
                        <a 
                            href="https://github.com/your-username/ghost-socket" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                        >
                            <FaRegStar className="w-4 h-4" />
                            Star on GitHub
                        </a>
                    </Button>
                    <form action={launchConsoleAction}>
                        <Button  type="submit"
                        className="purple-primary-button">
                            Launch Console
                        </Button>
                    </form>
                </div>
            </div>
            

          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_hsl(263_70%_50.4%_/_0.1),_hsl(280_70%_60%_/_0.1))] opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                  Control Your Remote Computer
                  <span className="text-purple-1"> Anywhere</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-lg">
                  Access your desktop, files, and applications from any device through your browser. 
                  No software installation required.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <DownloadButton />
                <Button asChild
                    className="hidden py-5 md:flex border border-[#ffffff1a] hover:border-purple-1/50 hover:bg-purple-1/10"
                >
                    <a 
                        href="https://github.com/your-username/ghost-socket" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                    >
                        Watch Demo
                    </a>
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                  No installation needed
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                  End to end security
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                  Works on any device
                </div>
              </div>
            </div>
            <div className="lg:order-2">
              <div className="relative">
                <Image
                width={800}
                height={600}
                  src={heroImage}
                  alt="Ghost Socket Remote Desktop"
                  className="w-full h-auto rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#27272a33]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-white font-bold mb-4">
              Why Choose Ghost Socket?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Experience seamless remote access with cutting-edge technology and uncompromising security.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-dark-2 border-purple-1/20 hover:border-purple-1/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20">
                <CardHeader>
                <div className="h-12 w-12 bg-purple-1/10 rounded-lg flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-purple-1" />
                </div>
                <CardTitle className="text-xl">Browser-Based Access</CardTitle>
                <CardDescription className={"text-gray-400"}>
                    Access your computer from any device with a web browser. No downloads, no installations.
                </CardDescription>
                </CardHeader>
            </Card>
            
            <Card className="bg-dark-2 border-purple-1/20 hover:border-purple-1/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20">
                <CardHeader>
                <div className="h-12 w-12 bg-purple-1/10 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-purple-1" />
                </div>
                <CardTitle className="text-xl">Lightning Fast</CardTitle>
                <CardDescription className={"text-gray-400"}>
                    Optimized for speed with minimal latency. Experience realtime performance like you're sitting right there.
                </CardDescription>
                </CardHeader>
            </Card>
            
            <Card className="bg-dark-2 border-purple-1/20 hover:border-purple-1/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20">
                <CardHeader>
                <div className="h-12 w-12 bg-purple-1/10 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-purple-1" />
                </div>
                <CardTitle className="text-xl">Exceptional Security</CardTitle>
                <CardDescription className={"text-gray-400"}>
                    End-to-end security and multifactor authentication keep your data safe and private.
                </CardDescription>
                </CardHeader>
            </Card>
            
            <Card className="bg-dark-2 border-purple-1/20 hover:border-purple-1/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20">
                <CardHeader>
                <div className="h-12 w-12 bg-purple-1/10 rounded-lg flex items-center justify-center mb-4">
                    <MousePointerClick className="h-6 w-6 text-purple-1" />
                </div>
                <CardTitle className="text-xl">Easy to use</CardTitle>
                <CardDescription className={"text-gray-400"}>
                    Intuitive interface designed for everyone. No technical skills required to get started.
                </CardDescription>
                </CardHeader>
            </Card>
            
            <Card className="bg-dark-2 border-purple-1/20 hover:border-purple-1/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20">
                <CardHeader>
                <div className="h-12 w-12 bg-purple-1/10 rounded-lg flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-purple-1" />
                </div>
                <CardTitle className="text-xl">Private & Secure</CardTitle>
                <CardDescription className={"text-gray-400"}>
                    Your data never touches our servers. Direct peer-to-peer connections ensure maximum privacy.
                </CardDescription>
                </CardHeader>
            </Card>
            
            <Card className="bg-dark-2 border-purple-1/20 hover:border-purple-1/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20">
                <CardHeader>
                <div className="h-12 w-12 bg-purple-1/10 rounded-lg flex items-center justify-center mb-4">
                    <Play className="h-6 w-6 text-purple-1" />
                </div>
                <CardTitle className="text-xl">Instant Setup</CardTitle>
                <CardDescription className={"text-gray-400"}>
                    Get up and running in seconds. Share a key and grant permissions to others to use your computer.
                </CardDescription>
                </CardHeader>
            </Card>
            </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl etxt-white font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Get started with Ghost Socket in three simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-purple-1/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-1">1</span>
              </div>
              <h3 className="text-xl font-semibold">Create Account</h3>
              <p className="text-gray-400">
                Create an account on the website and download the Ghost Socket app on your computer.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-purple-1/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-1">2</span>
              </div>
              <h3 className="text-xl font-semibold">Run Application</h3>
              <p className="text-gray-400">
                Run the Ghost Socket application on your computer and Sign In with your credentials.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-purple-1/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-1">3</span>
              </div>
              <h3 className="text-xl font-semibold">Start Remote Access</h3>
              <p className="text-gray-400">
                The devices shows up in the console. Click on the device to start remote access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Last Section */}
      <section className="py-20 bg-purple-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/90"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Experience Seamless Remote Access?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Get started with Ghost Socket by downloading the Application.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <DownloadButton theme="dark"/>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#27272a33]">
        <div className="container mx-auto px-4">
            <div className="border-t border-[#ffffff1a] m pt-8">
              <div className="flex items-center gap-[2px] ml-0">
                <Image src="/logo.svg" className="" alt="GhostSocket" width={45} height={45} />
                <h1 className="text-2xl font-bold text-white">GhostSocket</h1>
              </div>
              <p className="text-sm text-gray-400 pl-12">&copy; 2025 Ghost Socket.</p>
            </div>
        </div>
      </footer>
    </div>
  );
};