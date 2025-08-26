import Link from "next/link";

export function BadgesSection() {
  return (
    <section className="py-8 sm:py-12 md:py-16 bg-background">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12">
          {/* Peerlist Badge */}
          <Link
            href="https://peerlist.io/madhabapatra/project/mongointab"
            target="_blank"
            rel="noreferrer"
            className="inline-block transition-all duration-200 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
          >
            <img
              src="https://peerlist.io/api/v1/projects/embed/PRJH8OEJA9EJMLN9BF9L6ANA9JOJ9M?showUpvote=true&theme=light"
              alt="MongoInTab - Explore and manage your MongoDB directly in your browser"
              className="w-auto h-12 sm:h-14 md:h-16 object-contain transition-opacity duration-200 hover:opacity-90"
            />
          </Link>

          {/* Product Hunt Badge */}
          <a
            href="https://www.producthunt.com/products/mongointab?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-mongointab"
            target="_blank"
            rel="noreferrer"
            className="inline-block transition-all duration-200 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1009715&theme=light&t=1756229456009"
              alt="MongoInTab - Effortless mongodb browser client | Product Hunt"
              className="w-auto h-12 sm:h-14 md:h-16 object-contain transition-opacity duration-200 hover:opacity-90"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
