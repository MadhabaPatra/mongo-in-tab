import Link from "next/link";

export function PeerlistLaunchBadge() {
  return (
    <Link
      href="https://peerlist.io/madhabapatra/project/mongointab"
      target="_blank"
      rel="noreferrer"
    >
      <img
        src="https://peerlist.io/api/v1/projects/embed/PRJH8OEJA9EJMLN9BF9L6ANA9JOJ9M?showUpvote=true&theme=light"
        alt="MongoInTab"
        className="mx-auto py-2"
      />
    </Link>
  );
}
