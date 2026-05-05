import Image from "next/image";

interface Ad {
  id: number;
  title: string;
  image_url: string;
  target_url: string;
}

async function getFooterAds() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
  try {
    const res = await fetch(`${baseUrl}/ads?placement=footerads`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data as Ad[];
  } catch (error) {
    console.error("Failed to fetch footer ads:", error);
    return [];
  }
}

// This is a Server Component, but we need to wrap it to handle path visibility
// We'll create a Client Wrapper for visibility in the next step.
export async function FooterAdsServer() {
  const ads = await getFooterAds();

  if (!ads || ads.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-zinc-50 dark:bg-zinc-950 border-t py-12">
      <div className="container mx-auto px-4 flex flex-col items-center gap-6">
        {/* <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2">
          Promotional Partners
        </span> */}

        {/* <div className="flex flex-col gap-6 w-full max-w-[728px]">
          {ads.map((ad) => (
            <div 
              key={ad.id} 
              className="w-full overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center group"
            >
              <a 
                href={ad.target_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full h-auto aspect-[728/90] relative"
                aria-label={ad.title}
              >
                <Image 
                  src={ad.image_url} 
                  alt={ad.title} 
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                  sizes="(max-width: 768px) 100vw, 728px"
                  loading="lazy"
                  unoptimized={ad.image_url.endsWith('.svg')}
                />
              </a>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}
