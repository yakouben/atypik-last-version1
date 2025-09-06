# GA4 Analytics Testing Checklist

## 🚀 **Before Testing**
- [ ] Add `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX` to `.env.local`
- [ ] Restart your development server: `npm run dev`
- [ ] Open GA4 Real-time reports: [analytics.google.com](https://analytics.google.com) → Reports → Realtime

## 📊 **Test 1: Page Views (Automatic)**
**What to do:**
1. Visit your website homepage
2. Navigate between pages (dashboard, blog, etc.)

**What to expect in GA4:**
- Page views should appear in Real-time → Overview
- You should see active users count increase

**Console check:**
```javascript
// Open DevTools Console and look for:
gtag('config', 'G-XXXXXXXXXX', {...})
```

---

## 📝 **Test 2: Form Submissions**
**What to do:**
1. Go to login page: `/auth/login`
2. Try to log in (even with wrong credentials)
3. Go to signup page: `/auth/register`
4. Try to create an account

**What to expect in GA4:**
- Event: `form_submit`
- Parameters: `event_category: engagement`, `event_label: login_form` or `signup_form`

**Console check:**
```javascript
// Look for in console:
gtag('event', 'form_submit', {
  event_category: 'engagement',
  event_label: 'login_form'
})
```

---

## 🔘 **Test 3: CTA Button Clicks**
**What to do:**
1. Open search widget (search button in header)
2. Search for properties
3. Click "Réserver" button on any property

**What to expect in GA4:**
- Event: `cta_click`
- Parameters: `event_category: engagement`, `event_label: reserver_search_widget`

**Console check:**
```javascript
// Look for in console:
gtag('event', 'cta_click', {
  event_category: 'engagement',
  event_label: 'reserver_search_widget'
})
```

---

## 🏠 **Test 4: Reservation Events**
**What to do:**
1. Click "Réserver" on any property
2. The AuthPromptWidget should open
3. This triggers both `cta_click` and `reservation` events

**What to expect in GA4:**
- Event: `reservation`
- Event: `purchase` (e-commerce conversion)
- Parameters: Property name, transaction ID, etc.

**Console check:**
```javascript
// Look for both events:
gtag('event', 'reservation', {
  event_category: 'conversion',
  event_label: 'Property Name'
})

gtag('event', 'purchase', {
  transaction_id: 'reservation_123456789',
  value: 1,
  currency: 'EUR'
})
```

---

## 🔧 **Troubleshooting**

### **No events showing up?**
1. Check if `NEXT_PUBLIC_GA_ID` is set correctly
2. Make sure you restarted the dev server
3. Check browser console for errors
4. Verify your GA4 property is set up correctly

### **Events showing but not as conversions?**
1. Go to GA4 → Configure → Events
2. Find your events: `form_submit`, `cta_click`, `reservation`
3. Click "Mark as conversion" for each

### **Console debugging:**
```javascript
// Check if gtag is loaded
console.log(typeof gtag); // Should be 'function'

// Check if GA ID is loaded
console.log(process.env.NEXT_PUBLIC_GA_ID); // Should show your GA ID

// Manual event test
gtag('event', 'test_event', {
  event_category: 'test',
  event_label: 'manual_test'
});
```

---

## ✅ **Expected Results Summary**

After testing, you should see in GA4 Real-time:

| **Action** | **Event Name** | **Category** | **Where to See** |
|------------|----------------|--------------|------------------|
| Page visit | `page_view` | - | Realtime → Overview |
| Login attempt | `form_submit` | `engagement` | Realtime → Events |
| Signup attempt | `form_submit` | `engagement` | Realtime → Events |
| Click "Réserver" | `cta_click` | `engagement` | Realtime → Events |
| Reservation | `reservation` + `purchase` | `conversion` | Realtime → Events + Conversions |

---

## 🎯 **Quick Test Script**

Open browser console and run:
```javascript
// Test all events manually
gtag('event', 'form_submit', { event_category: 'engagement', event_label: 'test_form' });
gtag('event', 'cta_click', { event_category: 'engagement', event_label: 'test_button' });
gtag('event', 'reservation', { event_category: 'conversion', event_label: 'test_property' });
```

These should appear in GA4 Real-time within 30 seconds.
