// ============================================================
// Google Custom Search - Character search & image retrieval
// With Wikipedia fallback for images
// ============================================================

const GOOGLE_SEARCH_URL = 'https://www.googleapis.com/customsearch/v1';

export async function searchCharacter(env, characterName) {
  try {
    const query = encodeURIComponent(`${characterName} wiki`);
    const url = `${GOOGLE_SEARCH_URL}?key=${env.GOOGLE_API_KEY}&cx=${env.GOOGLE_CSE_ID}&q=${query}&num=5`;

    console.log('[Search] Searching for:', characterName);
    const res = await fetch(url);
    if (!res.ok) {
      const errBody = await res.text();
      console.error('[Search] API error:', res.status, errBody);
      return { results: [], error: 'Search failed: ' + res.status };
    }

    const data = await res.json();
    console.log('[Search] Got', (data.items || []).length, 'results');
    const results = (data.items || []).map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));

    return { results };
  } catch (e) {
    console.error('[Search] Error:', e);
    return { results: [], error: e.message };
  }
}

export async function searchCharacterImages(env, characterName) {
  // Try Google Image Search first
  try {
    const query = encodeURIComponent(`${characterName}`);
    const url = `${GOOGLE_SEARCH_URL}?key=${env.GOOGLE_API_KEY}&cx=${env.GOOGLE_CSE_ID}&q=${query}&searchType=image&num=6&safe=active`;

    console.log('[ImageSearch] Searching images for:', characterName);
    const res = await fetch(url);
    
    if (res.ok) {
      const data = await res.json();
      console.log('[ImageSearch] Got', (data.items || []).length, 'images');
      
      if (data.items && data.items.length > 0) {
        const images = data.items.map(item => ({
          url: item.link,
          thumbnail: item.image?.thumbnailLink || item.link,
          title: item.title || characterName,
          width: item.image?.width,
          height: item.image?.height,
          source: item.displayLink,
        }));
        return { images };
      }
    } else {
      const errBody = await res.text();
      console.error('[ImageSearch] API error:', res.status, errBody);
    }
  } catch (e) {
    console.error('[ImageSearch] Error:', e);
  }

  // Fallback: Try Wikipedia API for image
  try {
    console.log('[ImageSearch] Trying Wikipedia fallback');
    const wikiImages = await getWikipediaImages(characterName);
    if (wikiImages.length > 0) {
      return { images: wikiImages };
    }
  } catch (e) {
    console.error('[ImageSearch] Wikipedia fallback error:', e);
  }

  return { images: [] };
}

async function getWikipediaImages(query) {
  try {
    // Search Wikipedia for the page
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=1`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return [];
    
    const searchData = await searchRes.json();
    const pages = searchData?.query?.search;
    if (!pages || pages.length === 0) return [];
    
    const pageTitle = pages[0].title;
    
    // Get images from the page
    const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages|images&pithumbsize=500&format=json`;
    const imgRes = await fetch(imgUrl);
    if (!imgRes.ok) return [];
    
    const imgData = await imgRes.json();
    const pageObj = Object.values(imgData?.query?.pages || {})[0];
    
    const images = [];
    if (pageObj?.thumbnail) {
      images.push({
        url: pageObj.thumbnail.source,
        thumbnail: pageObj.thumbnail.source,
        title: pageTitle,
        width: pageObj.thumbnail.width,
        height: pageObj.thumbnail.height,
        source: 'wikipedia.org',
      });
    }
    
    return images;
  } catch (e) {
    console.error('[Wikipedia] Image fetch error:', e);
    return [];
  }
}
