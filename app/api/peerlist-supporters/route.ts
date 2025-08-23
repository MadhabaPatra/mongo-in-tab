import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `https://peerlist.io/api/v1/users/projects/upvotes/list?projectId=${process.env.PEERLIST_PROJECT_ID}`,
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Peerlist API" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
