
export const ContainerDesc = ({ children, cssClass = "" }: { children: React.ReactNode, cssClass?: string }) => {
  return (
    <p className={`text-[16px] md:text-xl font-light text-[#222222] text-center ${cssClass}`}>
      {children}
    </p>
  );
};