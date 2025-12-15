import React, { useState } from "react";
import EmailForm from "./EmailForm";

interface ReserveSectionProps {
  title?: string | TrustedHTML;
  desc: string | TrustedHTML;
  style?: React.CSSProperties;
  cssClass?: string;
  btnText?: string;
  redirectUrl?: string;
  btnId?: string;
}

export default function ReserveSection({
  title,
  desc,
  style,
  cssClass,
  btnText,
  btnId,
  redirectUrl,
}: ReserveSectionProps) {
  const [show, setShow] = useState(true);
  const handleCallBack = () => {
    setShow(false);
  };

  return (
    <section
      style={style}
      className={`py-[44px] md:py-[64px] px-[24px] text-center bg-no-repeat bg-cover ${cssClass}`}
    >
      {show && (
        <>
          {title && (
            <h2
              className="text-[24px] md:text-[40px] font-semibold md:font-bold"
              dangerouslySetInnerHTML={{ __html: title }}
            ></h2>
          )}
          <p
            className="text-[14px] md:text-[16px] font-light"
            dangerouslySetInnerHTML={{ __html: desc }}
          ></p>
        </>
      )}
      <div className="max-w-[360px] mx-auto mt-6">
        <EmailForm
          btnId={btnId}
          btnText={btnText}
          handleCallBack={handleCallBack}
          redirectUrl={redirectUrl}
        />
      </div>
    </section>
  );
}
