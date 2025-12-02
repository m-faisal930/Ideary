"use client";

import Image from "next/image";
import Link from "next/link";
import HeroBackground from "../animation/HeroBackground";

const Hero = () => {
  return (
    <>
      <section className="relative overflow-hidden py-20">
        <HeroBackground />
        <div className="relative bg-white pb-[110px] pt-[120px] lg:pt-[150px] dark:bg-dark">
          <div className="container mx-auto">
            <div className="-mx-4 flex flex-wrap items-center">
              <div className="w-full px-4 lg:w-5/12">
                <div className="hero-content">
                  <h1 className="mb-5 text-4xl font-bold leading-[1.208]! text-dark sm:text-[42px] lg:text-[40px] xl:text-5xl dark:text-white">
                    The Greatest <br />
                    Journey Of Online <br />
                    Storytelling.
                  </h1>
                  <p className="mb-8 max-w-[480px] text-base text-body-color dark:text-dark-6">
                    Explore insightful articles, tutorials, and stories from our
                    community of writers
                  </p>
                  <ul className="flex flex-wrap items-center">
                    <li>
                      <Link
                        href="/author/blogs/new"
                        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-center text-base font-medium text-white hover:bg-blue-dark lg:px-7"
                      >
                        Start Writing
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/posts"
                        className="inline-flex items-center justify-center px-5 py-3 text-center text-base font-medium text-[#464646] hover:text-primary dark:text-white"
                      >
                        <span className="mr-2">
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 5L19 12L12 19M5 12H19"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        Explore Stories
                      </Link>
                    </li>
                  </ul>
                  <div className="clients pt-16">
                    <h6 className="mb-6 flex items-center text-xs font-normal text-body-color dark:text-dark-6">
                      Top Creators on Ideary
                      <span className="ml-3 inline-block h-px w-8 bg-body-color"></span>
                    </h6>
                    <div className="flex items-center gap-2 xl:gap-[30px]">
                      <Image
                        src="/user2.jpg"
                        alt="User 1"
                        width={50}
                        height={50}
                        className="rounded-full cursor-pointer"
                      />
                      <Image
                        src="/user2.jpg"
                        alt="User 2"
                        width={50}
                        height={50}
                        className="rounded-full cursor-pointer"
                      />

                      <Image
                        src="/user2.jpg"
                        alt="User 3"
                        width={50}
                        height={50}
                        className="rounded-full cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden px-4 lg:block lg:w-1/12"></div>
              <div className="w-full px-4 lg:w-6/12">
                <div className="lg:ml-auto lg:text-right">
                  <div className="relative z-10 inline-block pt-11 lg:pt-0">
                    <Image
                      src="https://cdn.tailgrids.com/assets/images/marketing/hero/hero-image-01.png"
                      alt="hero"
                      width={600}
                      height={500}
                      className="max-w-full lg:ml-auto"
                    />
                    <span className="absolute -bottom-8 -left-8 z-[-1]">
                      <svg
                        width="93"
                        height="93"
                        viewBox="0 0 93 93"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="2.5" cy="2.5" r="2.5" fill="#3056D3" />
                        <circle cx="2.5" cy="24.5" r="2.5" fill="#3056D3" />
                        <circle cx="2.5" cy="46.5" r="2.5" fill="#3056D3" />
                        <circle cx="2.5" cy="68.5" r="2.5" fill="#3056D3" />
                        <circle cx="2.5" cy="90.5" r="2.5" fill="#3056D3" />
                        <circle cx="24.5" cy="2.5" r="2.5" fill="#3056D3" />
                        <circle cx="24.5" cy="24.5" r="2.5" fill="#3056D3" />
                        <circle cx="24.5" cy="46.5" r="2.5" fill="#3056D3" />
                        <circle cx="24.5" cy="68.5" r="2.5" fill="#3056D3" />
                        <circle cx="24.5" cy="90.5" r="2.5" fill="#3056D3" />
                        <circle cx="46.5" cy="2.5" r="2.5" fill="#3056D3" />
                        <circle cx="46.5" cy="24.5" r="2.5" fill="#3056D3" />
                        <circle cx="46.5" cy="46.5" r="2.5" fill="#3056D3" />
                        <circle cx="46.5" cy="68.5" r="2.5" fill="#3056D3" />
                        <circle cx="46.5" cy="90.5" r="2.5" fill="#3056D3" />
                        <circle cx="68.5" cy="2.5" r="2.5" fill="#3056D3" />
                        <circle cx="68.5" cy="24.5" r="2.5" fill="#3056D3" />
                        <circle cx="68.5" cy="46.5" r="2.5" fill="#3056D3" />
                        <circle cx="68.5" cy="68.5" r="2.5" fill="#3056D3" />
                        <circle cx="68.5" cy="90.5" r="2.5" fill="#3056D3" />
                        <circle cx="90.5" cy="2.5" r="2.5" fill="#3056D3" />
                        <circle cx="90.5" cy="24.5" r="2.5" fill="#3056D3" />
                        <circle cx="90.5" cy="46.5" r="2.5" fill="#3056D3" />
                        <circle cx="90.5" cy="68.5" r="2.5" fill="#3056D3" />
                        <circle cx="90.5" cy="90.5" r="2.5" fill="#3056D3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
