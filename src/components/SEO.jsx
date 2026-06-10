import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function SEO({ 
  title, 
  description, 
  keywords, 
  image, 
  type = "website",
  noindex = false,
  publishedTime,
  author = "PesaPlan"
}) {
  const location = useLocation();
  const currentUrl = `https://my-money-ra6z.onrender.com${location.pathname}`;
  
  useEffect(() => {
    // Set page title
    const fullTitle = title ? `${title} | PesaPlan` : "PesaPlan - Smart Financial Management for Africa";
    document.title = fullTitle;
    
    // Update meta tags
    const metaTags = {
      'description': description || "Take control of your finances with PesaPlan. Track expenses, manage budgets, pay bills, and achieve savings goals. Free forever!",
      'keywords': keywords || "personal finance, budgeting app, expense tracker, savings goals, African finance, money management",
      'author': author,
    };
    
    for (const [name, content] of Object.entries(metaTags)) {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    }
    
    // Update Open Graph tags
    const ogTags = {
      'og:title': fullTitle,
      'og:description': description || "Take control of your finances with PesaPlan. Track expenses, manage budgets, and achieve financial freedom.",
      'og:url': currentUrl,
      'og:type': type,
      'og:image': image || "https://my-money-ra6z.onrender.com/og-image.png",
      'og:site_name': "PesaPlan",
    };
    
    for (const [property, content] of Object.entries(ogTags)) {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    }
    
    // Update Twitter Card tags
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': fullTitle,
      'twitter:description': description || "Take control of your finances with PesaPlan. Track expenses, manage budgets, and achieve financial freedom.",
      'twitter:image': image || "https://my-money-ra6z.onrender.com/twitter-image.png",
    };
    
    for (const [name, content] of Object.entries(twitterTags)) {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    }
    
    // Handle noindex for private pages
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', noindex ? 'noindex, nofollow' : 'index, follow');
    
    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);
    
    // Add published time for articles
    if (publishedTime && type === 'article') {
      let articleMeta = document.querySelector('meta[property="article:published_time"]');
      if (!articleMeta) {
        articleMeta = document.createElement('meta');
        articleMeta.setAttribute('property', 'article:published_time');
        document.head.appendChild(articleMeta);
      }
      articleMeta.setAttribute('content', publishedTime);
    }
    
  }, [title, description, keywords, image, type, noindex, currentUrl, author, publishedTime]);
  
  return null;
}
