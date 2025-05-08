import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div className='flex w-full h-screen justify-center items-center'>
      <Button>
        <Link href="/dashboard/create-course" className='flex gap-2 flex-row items-center justify-center'>
          <Plus />
          Create Course
        </Link>
      </Button>
    </div>
  )
}

export default page
