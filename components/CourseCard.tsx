import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  teacherName: string;
}

export function CourseCard({
  id,
  title,
  description,
  image,
  price,
  teacherName
}: CourseCardProps) {
  return (
    <Link href={`/courses/${id}`} className="block">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer">
        <CardHeader className="p-0">
          <div className="relative aspect-video">
            <Image
              src={`https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/${image}`}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {description}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            By {teacherName}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <span className="text-lg font-bold">
            ${price}
          </span>
          <span
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Learn More
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}