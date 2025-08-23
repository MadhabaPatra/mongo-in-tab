export default async function handler(req, res) {
  try {
    const response = await fetch(
      `https://peerlist.io/api/v1/users/projects/upvotes/list?projectId=${process.env.PEERLIST_PROJECT_ID}`,
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch Peerlist API" });
    }

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
}
