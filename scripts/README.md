# Testimonials Generation Script

This script automatically generates testimonials from Peerlist comments using OpenAI for sentiment analysis.

## How it works

1. **Fetches comments** from Peerlist API for your project
2. **Filters out**:
   - Comments from excluded owner (your own ID)
   - Reply comments (only uses top-level comments)
   - Very short or empty comments
3. **Uses OpenAI** to identify positive, testimonial-worthy comments
4. **Enriches data** by fetching user profiles to get:
   - Current job title and company
   - Or their top project (if no job info)
   - Or their bio (as fallback)
5. **Saves to JSON** at `/data/testimonials.json`

## Setup

1. Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=your-api-key-here
   ```

2. The script will automatically run before build:
   ```bash
   npm run build
   ```

3. Or run manually:
   ```bash
   npm run generate-testimonials
   ```

## Configuration

Edit `scripts/generate-testimonials.js` to customize:
- `EXCLUDE_OWNER_ID`: Your Peerlist user ID to exclude
- `PEERLIST_API_URL`: The project comments endpoint
- OpenAI model and prompt settings

## Cost Optimization

- Only sends comment ID and text to OpenAI (not full objects)
- Limits text to 500 characters per comment
- Uses GPT-3.5-turbo for cost efficiency
- Caches results in JSON file (regenerated only on build)
- Falls back gracefully if OpenAI API fails

## Fallback Behavior

If OpenAI API is not available or fails:
- Returns first 10 filtered comments
- API route has hardcoded fallback testimonials
- Ensures the site always has testimonials to display