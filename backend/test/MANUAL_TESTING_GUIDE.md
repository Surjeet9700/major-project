# 🧪 Manual Testing Guide - Complete End-to-End Flow

## 📋 Test Overview
This guide will help you test the complete AI voice agent flow including email collection, booking process, and multilingual support.

## 🎯 Test Email
- **Email for testing:** `surjeethkumar4@gmail.com`
- **Expected:** Email confirmation should be logged in backend console (FREE MODE)

---

## 🚀 Step-by-Step Testing Process

### **Phase 1: Frontend Setup**
1. **Start Frontend:**
   ```bash
   cd voxzix
   npm run dev
   ```
2. **Open Demo Page:**
   - Go to: `http://localhost:3000/demo`
   - Verify the page loads with both simulation and real call options

### **Phase 2: Email Collection Test**
1. **Click "Start Voice Call"** in the Interactive Simulation section
2. **Email Popup should appear** asking for email
3. **Test Cases:**
   - ✅ **Valid Email:** Enter `surjeethkumar4@gmail.com`
   - ✅ **Skip Option:** Click "Skip" to test without email
   - ❌ **Invalid Email:** Enter `invalid-email` (should show validation error)

### **Phase 3: English Conversation Flow**
1. **Service Information:**
   - Say: *"What photography services do you offer?"*
   - **Expected:** AI should list wedding, portrait, event photography with prices

2. **Pricing Inquiry:**
   - Say: *"What are your wedding photography prices?"*
   - **Expected:** AI should provide detailed pricing (35k-125k range)

3. **Booking Start:**
   - Say: *"I want to book a wedding shoot for next Sunday."*
   - **Expected:** AI should ask for name and phone number

4. **Provide Details:**
   - Say: *"My name is Surjeet."*
   - Say: *"My phone number is 9876543210."*
   - **Expected:** AI should acknowledge and ask for missing information

### **Phase 4: Multilingual Test**
1. **Language Switch:**
   - Say: *"अब हिंदी में बात करें।"* (Now speak in Hindi)
   - **Expected:** AI should switch to Hindi responses

2. **Hindi Service Inquiry:**
   - Say: *"आप कौन-कौन सी फोटोग्राफी सेवाएं देते हैं?"*
   - **Expected:** AI should respond in Hindi with service details

3. **Hindi Booking:**
   - Say: *"मैं अगले रविवार के लिए शादी की बुकिंग करना चाहता हूँ।"*
   - Say: *"मेरा नाम सुरजीत है।"*
   - Say: *"मेरा नंबर 9876543210 है।"*
   - **Expected:** AI should handle booking in Hindi

### **Phase 5: Booking Completion**
1. **Complete Booking:**
   - Say: *"हाँ, मैं बुकिंग कन्फर्म करना चाहता हूँ।"* (Yes, I want to confirm the booking)
   - **Expected:** 
     - AI should confirm booking with booking ID
     - Backend should log email confirmation (if email provided)

### **Phase 6: Sales Techniques Test**
1. **Upsell Test:**
   - After booking, AI should suggest add-ons like pre-wedding shoots
   - **Expected:** AI mentions additional services

2. **Social Proof:**
   - AI should mention 500+ happy customers and 4.9/5 rating
   - **Expected:** Social proof in responses

3. **Calendar/Payment Offer:**
   - AI should offer calendar invite or payment link
   - **Expected:** Post-booking offers

---

## 🔍 What to Check

### **Backend Console Logs**
Look for these logs in your backend terminal:
```
📧 [FREE MODE] Email would be sent to: surjeethkumar4@gmail.com
📧 [FREE MODE] Subject: Yuva Digital Studio - Booking Confirmation (APT123456)
📧 [FREE MODE] Email content generated successfully
📅 Booking completed: {appointment details}
```

### **AI Response Quality**
- ✅ **Natural conversation flow**
- ✅ **No repeated questions**
- ✅ **Proper language switching**
- ✅ **Sales techniques used**
- ✅ **Complete sentences**
- ✅ **Context awareness**

### **Email Functionality**
- ✅ **Email popup appears**
- ✅ **Email validation works**
- ✅ **Skip option works**
- ✅ **Email stored in session**
- ✅ **Confirmation email triggered**

---

## 🐛 Common Issues & Solutions

### **Issue: AI not responding**
- **Solution:** Check microphone permissions
- **Solution:** Verify backend is running on port 3001

### **Issue: Email popup not appearing**
- **Solution:** Check browser console for errors
- **Solution:** Verify email-popup.tsx is properly imported

### **Issue: Language not switching**
- **Solution:** Check if language selector is working
- **Solution:** Verify Hindi language support in backend

### **Issue: No email logs in backend**
- **Solution:** Check if booking was completed
- **Solution:** Verify email was provided in popup

---

## 📊 Success Criteria

### **✅ All Tests Pass When:**
1. **Email Collection:** Popup appears, validation works, skip option works
2. **Conversation Flow:** AI responds naturally in both languages
3. **Booking Process:** All details collected, booking confirmed with ID
4. **Email Delivery:** Backend logs show email confirmation
5. **Sales Techniques:** AI uses upsell, social proof, and offers
6. **Multilingual:** Smooth language switching and responses

### **🎯 Expected Results:**
- **Complete booking flow** from start to finish
- **Email confirmation** logged in backend
- **Natural AI responses** with sales techniques
- **Bilingual support** working seamlessly
- **Professional user experience** throughout

---

## 🚀 Next Steps After Testing

1. **Review AI responses** for improvements
2. **Test edge cases** (invalid inputs, interruptions)
3. **Performance testing** (response times, error handling)
4. **Integration testing** (payment, calendar, CRM)
5. **User feedback** collection and iteration

---

**🎉 Ready to test! Follow this guide step-by-step for a complete end-to-end validation of your AI voice agent system.** 