"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiArrowUpRight, FiLock, FiUserPlus } from "react-icons/fi";
import { toast } from "react-toastify";

type ServiceItem = {
  title: string;
  desc: string;
  image: string;
  link: string;
  requiresAuth: boolean;
};

export default function ServicesInteractive() {
  const router = useRouter();
  const [active, setActive] = useState(0);

  const services: ServiceItem[] = [
    {
      title: "AI Diet Assistant",
      desc: "Generate personalized diet plans using AI.",
      image: "/ai.jpg",
      link: "/ai-assistant",
      requiresAuth: true,
    },
    {
      title: "Dietician Consultation",
      desc: "Connect with certified nutrition experts.",
      image: "/dietician.jpg",
      link: "/dietician",
      requiresAuth: true,
    },
    {
      title: "Dietary Kitchen",
      desc: "Order healthy meals.",
      image: "/kitchen.jpg",
      link: "/kitchen",
      requiresAuth: true,
    },
    {
      title: "Smart Reminders",
      desc: "Get reminders.",
      image: "/reminder.jpg",
      link: "/reminder",
      requiresAuth: true,
    },
    {
      title: "Register as Dietician",
      desc: "Create your dietician account and start consultations.",
      image: "/dietician.jpg",
      link: "/register?role=dietician",
      requiresAuth: false,
    },
  ];

  const handleServiceOpen = (service: ServiceItem) => {
    if (!service.requiresAuth) {
      router.push(service.link);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first!");
      return;
    }

    router.push(service.link);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#090204] via-[#14050a] to-[#090204] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-4xl font-extrabold tracking-tight text-transparent bg-gradient-to-r from-[#ff8fa3] to-[#8b0c2e] bg-clip-text sm:text-5xl">
          How SmartDiet Hub Helps You
        </h2>

        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(360px,520px)]">
          <div className="space-y-4">
            {services.map((service, index) => (
              <button
                key={service.title}
                type="button"
                className={`group w-full rounded-2xl border p-6 text-left shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd2dc] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14050a] sm:p-7 ${
                  active === index
                    ? "scale-[1.01] border-[#ff7894]/40 bg-gradient-to-br from-[#8b0c2e] via-[#5a061c] to-[#2b020a]"
                    : "border-[#ff7894]/20 bg-gradient-to-b from-[rgba(40,8,18,0.9)] to-[rgba(15,4,8,0.85)] hover:border-[#ff7894]/35 hover:translate-x-1"
                }`}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => handleServiceOpen(service)}
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-3xl font-bold leading-tight text-white sm:text-[2rem]">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-base text-[#ffd2dc]/75 sm:text-lg">
                      {service.desc}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#ffe4ea]">
                      {service.requiresAuth ? (
                        <>
                          <FiLock className="h-4 w-4" />
                          Login required
                        </>
                      ) : (
                        <>
                          <FiUserPlus className="h-4 w-4" />
                          Public access
                        </>
                      )}
                    </div>
                  </div>

                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition group-hover:bg-white/25">
                    <FiArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </button>
            ))}

            <p className="pt-2 text-center text-sm text-[#ffd2dc]/70 xl:hidden">
              Tip: Tap any card to open instantly.
            </p>
          </div>

          <div className="hidden xl:block xl:sticky xl:top-24">
            <div className="overflow-hidden rounded-3xl border border-[#ff7894]/25 bg-[#1a050d]/80 shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={services[active].image}
                  alt={services[active].title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white">{services[active].title}</h3>
                  <p className="mt-2 text-sm text-white/85">{services[active].desc}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#ff7894]/20 bg-[#1a050d]/70 p-5 text-[#ffdce4]">
              <p className="text-xs uppercase tracking-[0.22em] text-[#ff9ab0]/75">
                Why this service matters
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#ffe7ed]/85">
                {services[active].title} helps you stay consistent with your nutrition goals through practical guidance, actionable steps, and a smooth in-app flow built for everyday use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}