"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PenSquare, LogOut } from "lucide-react";
import { toast, Bounce } from "react-toastify";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully!", {
      position: "top-right",
      autoClose: 4000,
      theme: "light",
      transition: Bounce,
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm dark:bg-gray-900/80"
          : "bg-transparent"
      }`}
    >
      <div className="mx-10">
        <div className="relative -mx-4 flex items-center justify-between">
          {/* Logo */}
          <div className="w-60 max-w-full px-4">
            <Link href="/" className="block w-full py-5">
              <Image
                src="/logo.png"
                alt="logo"
                width={120}
                height={40}
                className="block w-full dark:hidden"
              />
              <Image
                src="/logo.png"
                alt="logo"
                width={120}
                height={40}
                className="hidden w-full dark:block"
              />
            </Link>
          </div>

          <div className="flex w-full items-center justify-between px-4">
            <div>
              <button
                onClick={() => setNavbarOpen(!navbarOpen)}
                className={`absolute right-4 top-1/2 block -translate-y-1/2 rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden ${
                  navbarOpen ? "navbarTogglerActive" : ""
                }`}
                id="navbarToggler"
              >
                <span className="block h-[2px] w-[30px] my-[6px] bg-body-color dark:bg-white"></span>
                <span className="block h-[2px] w-[30px] my-[6px] bg-body-color dark:bg-white"></span>
                <span className="block h-[2px] w-[30px] my-[6px] bg-body-color dark:bg-white"></span>
              </button>

              <nav
                id="navbarCollapse"
                className={`absolute right-4 top-full w-full max-w-[250px] rounded-lg bg-white px-6 py-5 shadow transition-all lg:static lg:block lg:w-full lg:max-w-full lg:bg-transparent lg:shadow-none xl:ml-11 dark:bg-dark-2 ${
                  !navbarOpen ? "hidden" : ""
                }`}
              >
                <ul className="block lg:flex">
                  <li>
                    <Link
                      href="/"
                      className={`flex py-2 text-base font-medium text-dark hover:text-primary hover:underline lg:ml-10 lg:inline-flex dark:text-white ${
                        pathname === "/" ? "underline" : ""
                      }`}
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/posts"
                      className={`flex py-2 text-base font-medium text-dark hover:text-primary hover:underline lg:ml-10 lg:inline-flex dark:text-white ${
                        pathname === "/posts" ? "underline" : ""
                      }`}
                    >
                      Posts
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className={`flex py-2 text-base font-medium text-dark hover:text-primary hover:underline lg:ml-10 lg:inline-flex dark:text-white ${
                        pathname === "/about" ? "underline" : ""
                      }`}
                    >
                      Our Story
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            <div className="hidden justify-end pr-16 sm:flex lg:pr-0">
              {user ? (
                <>
                  <Button asChild>
                    <Link href="/author/blogs/new">
                      <PenSquare className="h-4 w-4 mr-2" />
                      Write
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="ml-3" size="lg">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
