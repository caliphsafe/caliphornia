import { BuyView } from "@/components/views/buy-view"

export default function BuySlugPage({ params }: { params: { slug: string } }) {
  // Pass the slug into BuyView so it knows which song this is
  return <BuyView slug={params.slug} />
}
