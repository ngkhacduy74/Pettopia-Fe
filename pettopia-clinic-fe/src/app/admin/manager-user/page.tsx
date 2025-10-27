import UserList from '@/components/User-List';


export default function ClinicFormDetailPage({ params }: { params: { id?: string | string[] } }) {
  let id: string | undefined = undefined;
  if (params && params.id !== undefined) {
    if (Array.isArray(params.id)) {
      id = params.id[0];
    } else {
      id = params.id;
    }
  }
  return <UserList title="Quản lí người dùng" />;
}
