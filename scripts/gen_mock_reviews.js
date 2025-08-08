const fs = require('fs');

const neighborhoods = [
  'Shoreditch', 'Canary Wharf', 'Paddington', 'Victoria', 'Soho', 'Camden',
  'Notting Hill', 'Kensington', 'Chelsea', 'Greenwich', 'Wimbledon', 'Islington',
  'Southwark', 'Marylebone', 'Mayfair', 'Hammersmith', 'Brixton', 'Clapham',
  'Hampstead', 'Richmond'
];

const streets = [
  'Heights', 'Gardens', 'Residences', 'Apartments', 'Lofts', 'Mews',
  'Court', 'House', 'Place', 'Tower', 'Point', 'Crescent'
];

const snippets = [
  'Great stay and very convenient location.',
  'Clean and modern apartment, would return.',
  'Good value for money. Communication was smooth.',
  'Lovely neighborhood and easy check-in.',
  'Spacious and well-equipped. Minor noise from street.',
  'Excellent host and fast WiFi.'
];

const rb = (min, max) => Math.round((Math.random() * (max - min) + min) * 10) / 10;

const main = () => {
  const arr = [];
  const now = Date.now();
  let id = 10000;

  for (let i = 1; i <= 200; i++) {
    const neighborhood = neighborhoods[i % neighborhoods.length];
    const street = streets[i % streets.length];
    const unit = `${(i % 3) + 1}B ${String.fromCharCode(65 + (i % 6))}${i % 10} ${(i % 2) ? 'A' : 'B'}`;
    const listingName = `${unit} - Flex ${neighborhood} ${street}`;

    const reviewCount = (i % 3) + 1;

    for (let r = 0; r < reviewCount; r++) {
      const daysAgo = (i + r) % 365;
      const dt = new Date(now - daysAgo * 86400000);
      const cleanliness = rb(6, 10), communication = rb(6, 10), location = rb(6, 10), value = rb(5, 10), respect = rb(6, 10), checkIn = rb(6, 10);
      const avg = Math.round(((cleanliness + communication + location + value + respect + checkIn) / 6) * 10) / 10;
      const guestName = `Guest ${i}-${r}`;
      const publicReview = snippets[(i + r) % snippets.length];

      arr.push({
        id: id++,
        type: 'guest-to-host',
        status: 'published',
        rating: avg,
        publicReview,
        reviewCategory: [
          { category: 'cleanliness', rating: cleanliness },
          { category: 'communication', rating: communication },
          { category: 'location', rating: location },
          { category: 'value', rating: value },
          { category: 'respect_house_rules', rating: respect },
          { category: 'check_in', rating: checkIn }
        ],
        submittedAt: dt.toISOString().replace('T', ' ').slice(0, 19),
        guestName,
        listingName
      });
    }
  }

  fs.mkdirSync('src/data', { recursive: true });
  fs.writeFileSync('src/data/hostaway_mock_reviews.json', JSON.stringify(arr, null, 2));
  console.log(`Wrote ${arr.length} mock reviews to src/data/hostaway_mock_reviews.json`);
};

main();
