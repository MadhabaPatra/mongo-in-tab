import Link from "next/link";

export function PeerlistLaunchBadge() {
  return (
    <Link
      href="https://peerlist.io/madhabapatra/project/mongointab"
      target="_blank"
      rel="noreferrer"
      className="inline-block transition-all duration-200 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
    >
      <img
        src="https://peerlist.io/api/v1/projects/embed/PRJH8OEJA9EJMLN9BF9L6ANA9JOJ9M?showUpvote=true&theme=light"
        alt="MongoInTab - Explore and manage your MongoDB directly in your browser"
        className="mx-auto py-3 sm:py-4 w-auto h-12 sm:h-16 md:h-20 lg:h-24 xl:h-28 max-w-full object-contain transition-opacity duration-200 hover:opacity-90"
      />
    </Link>
  );
}
