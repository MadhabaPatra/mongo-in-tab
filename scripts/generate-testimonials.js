const fs = require("fs");
const path = require("path");

// Configuration
const PEERLIST_API_URL =
  "https://peerlist.io/api/v1/activities/comments?activityId=PRJH8OEJA9EJMLN9BF9L6ANA9JOJ9M&sortBy=newest&type=Project";
const EXCLUDE_OWNER_ID = "UHR8A9Q68ARA6DRIANGBK8GEDA6L";
const OUTPUT_PATH = path.join(__dirname, "../data/testimonials.json");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function fetchPeerlistComments() {
  try {
    const response = await fetch(PEERLIST_API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.status}`);
    }
    const data = await response.json();
    return data?.data?.comments || [];
  } catch (error) {
    console.error("Error fetching Peerlist comments:", error);
    return [];
  }
}

async function getUserProfile(username) {
  try {
    const response = await fetch(
      `https://peerlist.io/api/v1/users/profile/tldr?handle=${username}`,
      {
        next: {
          revalidate: 5,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Priority 1: Current experiences
    if (
      data?.tldr?.currentExperiences &&
      data?.tldr?.currentExperiences.length > 0
    ) {
      const experience = data?.tldr?.currentExperiences[0];
      return {
        role: experience.title,
        company: experience.companyName,
      };
    }

    // Priority 2: Projects with highest upvotes
    if (
      data?.tldr?.projectsLaunched &&
      data?.tldr?.projectsLaunched.length > 0
    ) {
      const topProject = data?.tldr?.projectsLaunched.reduce((prev, current) =>
        current.upvotesCount > prev.upvotesCount ? current : prev,
      );

      return {
        role: "Founder",
        company: topProject.title,
      };
    }

    return {
      role: "Community member",
      company: "Peerlist Community",
    };
  } catch (error) {
    console.error(`Error fetching profile for ${username}:`, error);
    return null;
  }
}

async function analyzeCommentsWithOpenAI(comments) {
  if (!OPENAI_API_KEY) {
    console.warn(
      "OPENAI_API_KEY not found. Returning first 10 comments without sentiment analysis.",
    );
    return comments;
  }

  try {
    // Prepare minimal data for OpenAI
    const commentData = comments.map((c) => ({
      id: c.id,
      text: c.comment.replace(/<[^>]*>/g, "").substring(0, 500), // Strip HTML and limit length
    }));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a sentiment analyzer. Analyze the following comments about a MongoDB Browser tool and return ONLY the IDs of positive testimonial-worthy comments. Return as a JSON array of IDs. Exclude negative, neutral, or off-topic comments. It should be specific to Prpject only.",
          },
          {
            role: "user",
            content: `Analyze these comments and return IDs of positive testimonials only:\n${JSON.stringify(commentData)}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the response to get array of IDs
    try {
      const ids = JSON.parse(content);
      return Array.isArray(ids) ? ids : [];
    } catch {
      // Fallback if parsing fails
      console.warn("Failed to parse OpenAI response, using fallback");
      return comments.slice(0, 10).map((c) => c.id);
    }
  } catch (error) {
    console.error("Error with OpenAI analysis:", error);
    // Fallback to first 10 comments
    return comments.slice(0, 10).map((c) => c.id);
  }
}

async function generateTestimonials() {
  console.log("🚀 Starting testimonial generation...");

  // Fetch all comments
  console.log("📥 Fetching comments from Peerlist...");
  const allComments = await fetchPeerlistComments();
  console.log(`✅ Fetched ${allComments.length} comments`);

  // Filter comments
  console.log("🔍 Filtering comments...");
  const filteredComments = allComments.filter((comment) => {
    if (comment.owner?.id === EXCLUDE_OWNER_ID) return false;
    if (comment.replyTo) return false;
    return comment.comment;
  });
  console.log(`✅ Filtered to ${filteredComments.length} comments`);

  // Get positive comment IDs using OpenAI
  console.log("🤖 Analyzing sentiment with OpenAI...");
  const positiveIds = await analyzeCommentsWithOpenAI(filteredComments);
  console.log(`✅ Identified ${positiveIds.length} positive testimonials`);

  // Get only positive comments
  const positiveComments = filteredComments.filter((c) =>
    positiveIds.includes(c.id),
  );

  // Fetch user profiles for positive comments
  console.log("👤 Fetching user profiles...");
  const testimonials = [];

  for (const comment of positiveComments.slice(0, 10)) {
    // Limit to 10 testimonials
    const profileData = await getUserProfile(comment.owner.username);

    testimonials.push({
      id: comment.id,
      name: comment.owner.displayName,
      username: comment.owner.username,
      role: profileData?.role || "Developer",
      company: profileData?.company || "Peerlist Community",
      image:
        comment.owner.profilePicture ||
        "https://peerlist.io/images/emptyDP.png",
      quote: comment.comment,
      timestamp: new Date().toISOString(),
    });

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Ensure data directory exists
  const dataDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Save to JSON file
  console.log("💾 Saving testimonials to JSON...");
  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(
      { testimonials, generatedAt: new Date().toISOString() },
      null,
      2,
    ),
  );

  console.log(`✅ Successfully generated ${testimonials.length} testimonials!`);
  console.log(`📁 Saved to: ${OUTPUT_PATH}`);

  return testimonials;
}

// Run the script
if (require.main === module) {
  generateTestimonials()
    .then(() => {
      console.log("✨ Testimonial generation complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error generating testimonials:", error);
      process.exit(1);
    });
}

module.exports = { generateTestimonials };
