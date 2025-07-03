
export const ContainerTitle = ({ children, cssClass = "" }: { children: React.ReactNode, cssClass?: string }) => {
  return (
    <h2 className={`text-[32px] md:text-[40px] font-bold text-[#222222] text-center ${cssClass}`}>
      {children}
    </h2>
  );
};