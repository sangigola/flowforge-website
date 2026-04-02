"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Service {
  id: string;
  title: { en: string; ka: string };
  description: { en: string; ka: string };
  image: string;
}

const SERVICES: Service[] = [
  {
    id: "01",
    title: {
      en: "AI-Powered CRM",
      ka: "AI-ზე დაფუძნებული CRM"
    },
    description: {
      en: "Smart customer relationship management with automated lead scoring, follow-ups, and personalized engagement.",
      ka: "ინტელექტუალური მომხმარებელთან ურთიერთობის მართვა ავტომატური ლიდების შეფასებით, შეხსენებებით და პერსონალიზებული ჩართულობით."
    },
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200",
  },
  {
    id: "02",
    title: {
      en: "Custom Chatbots",
      ka: "ჩატბოტები"
    },
    description: {
      en: "Intelligent conversational AI that handles customer support, lead capture, and 24/7 engagement.",
      ka: "ინტელექტუალური სასაუბრო AI, რომელიც უზრუნველყოფს მომხმარებელთა მხარდაჭერას, ლიდების მოზიდვას და 24/7 ჩართულობას."
    },
    image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=1200",
  },
  {
    id: "03",
    title: {
      en: "Workflow Automation",
      ka: "პროცესების ავტომატიზაცია"
    },
    description: {
      en: "Streamline repetitive tasks with AI-driven automation that saves time and reduces errors.",
      ka: "გაამარტივეთ განმეორებადი ამოცანები AI-ზე დაფუძნებული ავტომატიზაციით, რომელიც დაზოგავს დროს და ამცირებს შეცდომებს."
    },
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200",
  },
  {
    id: "04",
    title: {
      en: "Web & Mobile Apps",
      ka: "ვებ და მობილური აპები"
    },
    description: {
      en: "Full-stack development of modern, responsive applications tailored to your business needs.",
      ka: "თანამედროვე, რესპონსიული აპლიკაციების სრული დეველოპმენტი, მორგებული თქვენი ბიზნესის საჭიროებებზე."
    },
    image: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?q=80&w=1200",
  },
];

const translations = {
  en: {
    title: "What We Build",
    subtitle: "(SERVICES)"
  },
  ka: {
    title: "ჩვენი სერვისები",
    subtitle: "(სერვისები)"
  }
};

const AUTO_PLAY_DURATION = 5000;

interface VerticalTabsProps {
  language?: 'en' | 'ka';
}

export function VerticalTabs({ language = 'en' }: VerticalTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const t = translations[language];

  const handleNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % SERVICES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + SERVICES.length) % SERVICES.length);
  }, []);

  const handleTabClick = (index: number) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setIsPaused(false);
  };

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, AUTO_PLAY_DURATION);

    return () => clearInterval(interval);
  }, [activeIndex, isPaused, handleNext]);

  const variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      y: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <div className="w-full">
      <div className="w-full px-4 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Content */}
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1 pt-2">
            <div className="space-y-1 mb-6">
              <h2 className="tracking-tight text-balance text-xl font-medium md:text-2xl lg:text-3xl text-foreground">
                {t.title}
              </h2>
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-[0.3em] block ml-0.5">
                {t.subtitle}
              </span>
            </div>

            <div className="flex flex-col space-y-0">
              {SERVICES.map((service, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    key={service.id}
                    onClick={() => handleTabClick(index)}
                    className={cn(
                      "group relative flex items-start gap-3 py-4 md:py-5 text-left transition-all duration-500 border-t border-border/50 first:border-0",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground/60 hover:text-foreground"
                    )}
                  >
                    <div className="absolute left-[-12px] md:left-[-16px] top-0 bottom-0 w-[2px] bg-muted">
                      {isActive && (
                        <motion.div
                          key={`progress-${index}-${isPaused}`}
                          className="absolute top-0 left-0 w-full bg-foreground origin-top"
                          initial={{ height: "0%" }}
                          animate={
                            isPaused ? { height: "0%" } : { height: "100%" }
                          }
                          transition={{
                            duration: AUTO_PLAY_DURATION / 1000,
                            ease: "linear",
                          }}
                        />
                      )}
                    </div>

                    <span className="text-[8px] md:text-[9px] font-medium mt-1 tabular-nums opacity-50">
                      /{service.id}
                    </span>

                    <div className="flex flex-col gap-1 flex-1">
                      <span
                        className={cn(
                          "text-lg md:text-xl lg:text-2xl font-normal tracking-tight transition-colors duration-500",
                          isActive ? "text-foreground" : ""
                        )}
                      >
                        {service.title[language]}
                      </span>

                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.23, 1, 0.32, 1],
                            }}
                            className="overflow-hidden"
                          >
                            <p className="text-muted-foreground text-xs md:text-sm font-normal leading-relaxed max-w-sm pb-1">
                              {service.description[language]}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-end h-full order-1 lg:order-2">
            <div
              className="relative group/gallery"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative aspect-[4/3] md:aspect-[16/10] rounded-2xl md:rounded-3xl overflow-hidden bg-muted/30 border border-border/40">
                <AnimatePresence
                  initial={false}
                  custom={direction}
                  mode="popLayout"
                >
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      y: { type: "spring", stiffness: 260, damping: 32 },
                      opacity: { duration: 0.4 },
                    }}
                    className="absolute inset-0 w-full h-full cursor-pointer"
                    onClick={handleNext}
                  >
                    <img
                      src={SERVICES[activeIndex].image}
                      alt={SERVICES[activeIndex].title[language]}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />

                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60" />
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex gap-2 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-foreground hover:bg-background transition-all active:scale-90"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="size-4 md:size-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-foreground hover:bg-background transition-all active:scale-90"
                    aria-label="Next"
                  >
                    <ChevronRight className="size-4 md:size-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerticalTabs;
