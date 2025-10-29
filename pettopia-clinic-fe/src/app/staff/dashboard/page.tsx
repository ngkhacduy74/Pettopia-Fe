import ClinicFormDetail from '@/components/ClinicFormDetail';


export default function ClinicFormDetailPage({ params }: { params: { id?: string | string[] } }) {
  let id: string | undefined = undefined;
  if (params && params.id !== undefined) {
    if (Array.isArray(params.id)) {
      id = params.id[0];
    } else {
      id = params.id;
    }
  }
  return <h1>Staff Dashboard</h1>;
}
