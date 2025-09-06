# Google Analytics 4 Setup Guide

## 🚀 **Step 1: Get Your GA4 Measurement ID**

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property or select existing one
3. Go to **Admin** → **Data Streams** → **Web**
4. Copy your **Measurement ID** (starts with G-)

## 🚀 **Step 2: Add Environment Variable**

Add this line to your `.env.local` file:
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

## 🚀 **Step 3: Track Events**

The following events are now automatically tracked:

### **form_submit** (Form Submissions)
- ✅ Login form submission
- ✅ Signup form submission
- ✅ Contact form submission

### **cta_click** (Call-to-Action Clicks)
- ✅ "Réserver" button clicks in search widget
- ✅ Navigation button clicks
- ✅ Hero section CTA buttons

### **reservation** (Reservation Confirmations)
- ✅ When user clicks "Réserver" button
- ✅ When reservation confirmation widget opens
- ✅ Tracks as both custom event and purchase event

## 🚀 **Step 4: Mark Events as Conversions in GA4**

1. Go to **GA4 Dashboard** → **Configure** → **Events**
2. Find your events: `form_submit`, `cta_click`, `reservation`
3. Click **Mark as conversion** for each event
4. Set up conversion goals in **Configure** → **Conversions**

## 🚀 **Step 5: View Your Data**

- **Real-time**: GA4 Dashboard → **Reports** → **Realtime**
- **Events**: GA4 Dashboard → **Reports** → **Engagement** → **Events**
- **Conversions**: GA4 Dashboard → **Reports** → **Monetization** → **E-commerce purchases**

## 📊 **Event Details**

### **form_submit**
- Category: `engagement`
- Labels: `login_form`, `signup_form`, `contact_form`

### **cta_click**
- Category: `engagement`
- Labels: `reserver_search_widget`, `reserver_hero`, etc.

### **reservation**
- Category: `conversion`
- Also tracked as `purchase` event with transaction details
- Includes property name and ID

## ✅ **Implementation Complete!**

Your website now tracks:
- ✅ Page views automatically
- ✅ Form submissions
- ✅ CTA button clicks
- ✅ Reservation confirmations
- ✅ All events are ready for conversion tracking
