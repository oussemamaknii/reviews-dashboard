# Yelp Fusion API Integration Guide

## Overview

We've successfully migrated from Foursquare to **Yelp Fusion API** for external business reviews. Yelp provides richer review data with actual user ratings, detailed review text, and comprehensive business information.

## Why Yelp Over Foursquare?

### ✅ **Yelp Advantages:**
- **Real User Reviews**: Actual detailed reviews with star ratings
- **Rich Business Data**: Comprehensive business information  
- **Better API Limits**: More generous free tier and pricing
- **No Credits System**: Straightforward API key authentication
- **Higher Review Volume**: More reviews per business
- **Better Search**: More accurate business search results

### ❌ **Foursquare Issues:**
- **Limited Free Tier**: Tips/reviews require paid credits
- **Sparse Review Data**: Many places have no tips
- **Complex Pricing**: Credit-based system with multiple endpoints

## API Setup

### 1. Get Yelp API Key

1. **Create Yelp Developer Account**: [developer.yelp.com](https://developer.yelp.com)
2. **Create New App**: Fill in basic app information
3. **Get API Key**: Copy your API key from the dashboard
4. **Add to Environment**:
   ```bash
   YELP_API_KEY=your_yelp_api_key_here
   ```

### 2. API Endpoints Used

- **Business Search**: `/businesses/search`
- **Business Reviews**: `/businesses/{id}/reviews`

## Integration Features

### 🔍 **Smart Search & Review Fetching**
```typescript
// Search businesses by query and location
const businesses = await yelpService.searchBusinesses('Starbucks', 'London, UK')

// Get reviews for each business
const reviews = await yelpService.getBusinessReviews(businessId)
```

### 📊 **Hybrid Data Strategy**
1. **Primary**: Fetch real user reviews when available
2. **Fallback**: Use business info if no reviews found
3. **Error Handling**: Graceful degradation with meaningful error messages

### 🎯 **Rich Review Data**
```json
{
  "id": "yelp_review_123",
  "property_name": "Starbucks Coffee",
  "guest_name": "Sarah M.",
  "rating": 4,
  "review_text": "Great coffee and friendly staff. The atmosphere is perfect for working.",
  "channel": "yelp",
  "submitted_at": "2024-01-15T10:30:00Z"
}
```

## Usage

### 1. API Endpoint
```bash
GET /api/reviews/yelp/search?query=Starbucks&location=London,UK
```

### 2. React Component
```typescript
import { YelpReviewsIntegration } from '@/components/dashboard/YelpReviewsIntegration'

// Use in your page
<YelpReviewsIntegration />
```

### 3. Direct Service Usage
```typescript
import { yelpService } from '@/services/yelp'

const reviews = await yelpService.getReviewsByQuery('Pizza Hut', 'New York, NY')
```

## Testing

### 1. **Test API Endpoint**
```bash
curl "http://localhost:3002/api/reviews/yelp/search?query=Starbucks&location=London,UK"
```

### 2. **Test UI Component**
- Navigate to: `http://localhost:3002/yelp-reviews`
- Search for: "Starbucks", "McDonald's", "Pizza Hut"
- Try different locations: "London, UK", "New York, NY", "Paris, France"

### 3. **Expected Results**
- **With API Key**: Real business reviews + business info
- **Without API Key**: Error message with setup instructions
- **No Reviews Found**: Business information as fallback

## Error Handling

### Common Issues & Solutions

#### 1. **401 Unauthorized**
```json
{"error": "Yelp API error: 401 - Unauthorized"}
```
**Solution**: Check your `YELP_API_KEY` in `.env`

#### 2. **Rate Limiting**
```json
{"error": "Yelp API error: 429 - Too Many Requests"}
```
**Solution**: Implement request throttling or upgrade Yelp plan

#### 3. **No Businesses Found**
```json
{"success": true, "data": []}
```
**Solution**: Try different search terms or locations

## Production Considerations

### 1. **Rate Limits**
- **Free Tier**: 5,000 API calls/month
- **Paid Plans**: Higher limits available
- **Best Practice**: Cache results and implement request throttling

### 2. **Location Handling**
- Default location: "London, UK"
- Support for city, state, country format
- Geocoding for better accuracy

### 3. **Review Filtering**
- Filter by rating threshold
- Date range filtering
- Language filtering (if needed)

## Migration Benefits

### Before (Foursquare):
- ❌ Required paid credits for reviews
- ❌ Limited review data
- ❌ Complex pricing model
- ❌ Sparse review coverage

### After (Yelp):
- ✅ Rich review data with ratings
- ✅ Comprehensive business information
- ✅ Straightforward API pricing
- ✅ Better search accuracy
- ✅ Higher review volume per business

## Next Steps

1. **Get Yelp API Key**: Sign up at [developer.yelp.com](https://developer.yelp.com)
2. **Update Environment**: Add `YELP_API_KEY` to your `.env` file
3. **Test Integration**: Use `/yelp-reviews` page to test search
4. **Monitor Usage**: Track API usage in Yelp developer dashboard

**Your review system is now powered by Yelp's comprehensive business and review data!** 🚀
