import ArtworkPost from '@/components/ArtworkPost'
import { publicAsset } from '@/lib/paths'

export default function PostPage() {
  return (
    <ArtworkPost
      imageUrl={publicAsset('/images/test-image.jpg')}
      title="My Artwork"
      description="This is a test description"
      artistName="testuser"
    />
  )
}