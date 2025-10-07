import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return <div className='flex items-center justify-center p-10'>
    <SignUp appearance={{
      elements: {
        logoBox: {
          height: '120px', // hoặc bất kỳ kích thước nào bạn muốn
        },
        logoImage: {
          height: '100%', // đảm bảo ảnh chiếm toàn bộ box
        },
      },
    }}
    />
  </div>
}
