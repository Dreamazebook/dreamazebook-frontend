import ProfileSidebar from './components/ProfileSidebar';

export default async function ProfileLayout({
  children,  
}: {
  children: React.ReactNode;
}) {
  
  return (
    <ProfileSidebar>{children}</ProfileSidebar>
  );
}
