
export const ContainerTitle = ({ children, cssClass = "" }: { children: React.ReactNode, cssClass?: string }) => {
  return (
    <h2 className={`text-3xl md:text-6xl font-bold text-[#222222] text-center ${cssClass}`}>
      {children}
    </h2>
  );
};