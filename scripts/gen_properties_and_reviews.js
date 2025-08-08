const fs = require('fs');
const path = require('path');

const NUM_PROPERTIES = 50;
const REVIEWS_PER_PROPERTY = 20;

const neighborhoods = [
  'Shoreditch','Canary Wharf','Paddington','Victoria','Soho','Camden','Notting Hill','Kensington','Chelsea','Greenwich',
  'Wimbledon','Islington','Southwark','Marylebone','Mayfair','Hammersmith','Brixton','Clapham','Hampstead','Richmond'
];
const streetSuffix = ['Heights','Gardens','Residences','Apartments','Lofts','Mews','Court','House','Place','Tower','Point','Crescent'];
const images = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
];

const reviewSnippets = [
  'Great stay and very convenient location.',
  'Clean and modern apartment, would return.',
  'Good value for money. Communication was smooth.',
  'Lovely neighborhood and easy check-in.',
  'Spacious and well-equipped. Minor noise from street.',
  'Excellent host and fast WiFi.'
];

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function rb(min, max) { return Math.round((Math.random() * (max - min) + min) * 10) / 10; }
function jitter(min, max) { return (Math.random() * (max - min) + min); }

function generate() {
  const properties = [];
  const reviews = [];
  const now = Date.now();
  let reviewIdBase = 20000;

  for (let i = 0; i < NUM_PROPERTIES; i++) {
    const n = neighborhoods[i % neighborhoods.length];
    const s = streetSuffix[i % streetSuffix.length];
    const code = `${(i % 3) + 1}B ${String.fromCharCode(65 + (i % 6))}${(i % 10)} ${(i % 2) ? 'A' : 'B'}`;
    const name = `${code} - ${n} ${s}`; // property name and review listingName must match
    const id = `prop-${slugify(name)}`;

    // Rough London center with small jitter per property
    const baseLat = 51.5074;
    const baseLng = -0.1278;
    const latitude = baseLat + jitter(-0.06, 0.06);
    const longitude = baseLng + jitter(-0.12, 0.12);

    properties.push({
      id,
      name,
      location: `${n}, London`,
      imageUrl: images[i % images.length],
      pricePerNight: 70 + (i % 50),
      maxGuests: ((i % 3) + 2),
      latitude,
      longitude
    });

    for (let r = 0; r < REVIEWS_PER_PROPERTY; r++) {
      const dt = new Date(now - ((i * REVIEWS_PER_PROPERTY + r) % 365) * 86400000);
      const cleanliness = rb(6, 10);
      const communication = rb(6, 10);
      const locationScore = rb(6, 10);
      const value = rb(5, 10);
      const respect = rb(6, 10);
      const checkIn = rb(6, 10);
      const avg = Math.round(((cleanliness + communication + locationScore + value + respect + checkIn) / 6) * 10) / 10;

      reviews.push({
        id: reviewIdBase++,
        type: 'guest-to-host',
        status: 'published',
        rating: avg,
        publicReview: reviewSnippets[(i + r) % reviewSnippets.length],
        reviewCategory: [
          { category: 'cleanliness', rating: cleanliness },
          { category: 'communication', rating: communication },
          { category: 'location', rating: locationScore },
          { category: 'value', rating: value },
          { category: 'respect_house_rules', rating: respect },
          { category: 'check_in', rating: checkIn },
        ],
        submittedAt: dt.toISOString().replace('T',' ').slice(0,19),
        guestName: `Guest ${i + 1}-${r + 1}`,
        listingName: name
      });
    }
  }

  fs.mkdirSync(path.join('src','data'), { recursive: true });
  fs.writeFileSync(path.join('src','data','properties.json'), JSON.stringify(properties, null, 2));
  fs.writeFileSync(path.join('src','data','hostaway_mock_reviews.json'), JSON.stringify(reviews, null, 2));
  console.log(`Generated ${properties.length} properties and ${reviews.length} reviews.`);
}

generate();
