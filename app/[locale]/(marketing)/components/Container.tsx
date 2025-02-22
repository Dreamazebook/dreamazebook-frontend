
export const Container = ({ children, cssClass = "" }: { children: React.ReactNode, cssClass?: string }) => {
  return (
    <section
      className={`py-32 ${cssClass}`}
    >
      {children}
    </section>
  );
};