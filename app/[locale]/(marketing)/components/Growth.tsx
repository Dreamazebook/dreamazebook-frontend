import { JSX } from "react";
import Image from "next/image";
import { Container } from "./Container";
import { ContainerTitle } from "./ContainerTitle";
import { MAGIC_WAND } from "@/constants/cdn";

interface IconProps {
  cssClass: string;
  icon: string;
}

interface IconsRecord {
  [key: string]: JSX.Element;
}

const ICONS: IconsRecord = {
  done: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 23 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 7.625L9 14.625L21 2.625"
        stroke="#999999"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  ongoing: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="7.5" stroke="#012CCE" />
    </svg>
  ),
  pending: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 17.5 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="8" fill="#012CCE" />
    </svg>
  ),
  kickstarter: (
    <svg
      width="26"
      height="26"
      viewBox="0 1 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.1299 4.25172C12.9729 2.38487 15.9804 2.36558 17.8473 4.20864C19.7141 6.0517 19.7334 9.05917 17.8903 10.926L15.8431 12.9997L17.8903 15.0734C19.7334 16.9403 19.7141 19.9477 17.8473 21.7908C15.9804 23.6338 12.9729 23.6145 11.1299 21.7477L10.1313 20.7362C9.28131 22.022 7.82271 22.8701 6.16602 22.8701C3.54266 22.8701 1.41602 20.7435 1.41602 18.1201V7.62012C1.41602 4.99676 3.54266 2.87012 6.16602 2.87012C7.88962 2.87012 9.39881 3.78815 10.2313 5.16192L11.1299 4.25172Z"
        fill="#05CE78"
      />
    </svg>
  ),
};

function Icon({ cssClass, icon }: IconProps) {
  return <span className={cssClass}>{ICONS[icon]}</span>;
}

export default function Growth() {
  return (
    <Container cssClass="bg-[#F8F8F8]">
      <ContainerTitle>
        Dreamaze Book&apos;s <span className="text-[#022CCE]">Growth</span>
      </ContainerTitle>

      <div className="flex justify-center my-16">
        <Image
          src={MAGIC_WAND}
          alt="Magic Wand"
          width={64}
          height={64}
        />
      </div>

      <div className="max-w-3xl mx-auto">
        {[
          { icon: "done", tl: "Initial Idea Sparked", date: "May 2024" },
          { icon: "done", tl: "Product Research", date: "June 2024" },
          { icon: "done", tl: "AI Workflow Development", date: "July 2024-Ongoing" },
          {
            icon: "done",
            tl: "Illustration & Content Development",
            date: "August 2024-Ongoing",
          },
          { icon: "done", tl: "Prototype Creation", date: "October 2024" },
          { icon: "done", tl: "Factory Visits", date: "December 2024" },
          { icon: "done", tl: "Early Tester Feedback", date: "February 2025" },
          {
            icon: "ongoing",
            isCur: true,
            tl: "Kickstarter Prelaunch",
            date: "April-June 2025",
          },
          {
            icon: "pending",
            isCur: true,
            tl: "Finalize Website",
            date: "May-June 2025",
          },
          {
            icon: "kickstarter",
            isCur: true,
            tl: "Kickstart Launching",
            date: "July 2025",
          },
          {
            icon: "pending",
            isCur: true,
            tl: "Ship to Customers",
            date: "August-Spetember 2025",
          },
        ].map(({ tl, date, isCur, icon }, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={idx}
              className={`mb-3 ${isEven ? "" : "flex-row-reverse"} flex`}
            >
              <div
                className={`flex w-1/2 gap-6 ${
                  idx === 10
                    ? "flex-row-reverse"
                    : isEven
                    ? isCur
                      ? "border-r-1 border-r-blue-500 flex-row-reverse"
                      : "border-r-1  border-dotted border-r-[#22222] flex-row-reverse"
                    : isCur
                    ? "border-l-1 border-l-blue-500 "
                    : "border-l-1 border-dotted border-l-[#22222]"
                }`}
              >
                {
                  <Icon
                    icon={icon}
                    cssClass={`${
                      isEven ? "-mr-2.5" : "-ml-2"
                    } bg-[#F8F8F8] w-[16px] h-[16px]`}
                  />
                }

                <div
                  className={`${
                    isEven ? "text-right" : "text-left"
                  } transform -translate-y-1`}
                >
                  <h3
                    className={`font-bold break-words xl:text-xl ${
                      isCur ? "text-blue-700" : ""
                    }`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {tl}
                  </h3>
                  <p
                    className={`${isCur ? "text-black" : "text-gray-400"} mt-1`}
                  >
                    {date}
                  </p>
                </div>
              </div>
              <div className="w-1/2"></div>
            </div>
          );
        })}
      </div>
    </Container>
  );
}
