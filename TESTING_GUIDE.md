# Testing Guide for AI SDK Features

This guide helps you test all the new AI features we've added to the showcase website.

## Prerequisites

1. Start the development server:

```bash
pnpm dev
```

2. Open your browser to `http://localhost:3000`

## Feature Testing Checklist

### 1. Transient Data Notifications (in Thinking Indicator)

**What to test:** Real-time status indicators that show what the AI is doing, displayed in the thinking bubble.

**How to test:**

- Ask: "Tell me about MiDika"
- **Expected:** In the AI's message bubble, you'll see a spinner with status text:
  - First: "Thinking" (default)
  - Then: "Processing your request..."
  - Then: "Fetching company information..." (when tool is called)
- The status iterates through each step in real-time

**Test cases:**

- ✅ "What services do you offer?" → Should show "Retrieving services..." in thinking indicator
- ✅ "What time is it?" → Should show "Getting current time..." in thinking indicator
- ✅ Status updates happen inside the chat bubble, not above the input

---

### 2. Rich Generative UI - Company Info Card

**What to test:** Beautiful animated card showing company information.

**How to test:**

- Ask: "Who is MiDika?" or "Tell me about the company"
- **Expected:**
  - Animated card slides in with company logo/icon
  - Shows contact info (email, phone, address) with icons
  - Displays team members in styled cards
  - Shows core values (KISS, DRY, YAGNI, TDD) in a grid
  - Hover effects on interactive elements

**Visual checks:**

- ✅ Card has smooth fade-in animation
- ✅ Icons are properly colored (primary orange)
- ✅ Team member cards have hover effects
- ✅ Values are displayed in a 2-column grid

---

### 3. Rich Generative UI - Services Grid

**What to test:** Animated service cards with tech badges.

**How to test:**

- Ask: "What services does MiDika offer?" or "What can you build?"
- **Expected:**
  - Grid of service cards with icons
  - Each service shows description
  - Technology badges displayed as pills
  - Hover effects that scale and glow

**Visual checks:**

- ✅ Cards animate in sequentially (staggered)
- ✅ Icons match service types (Code, Globe, Sparkles, Wrench)
- ✅ Tech badges have hover effects
- ✅ Cards scale slightly on hover with shadow glow

---

### 4. Rich Generative UI - Time Display

**What to test:** Live clock widget showing Milan time.

**How to test:**

- Ask: "What time is it?" or "What's the current time in Milan?"
- **Expected:**
  - Large clock display with current time
  - Date information below
  - "Live" indicator with pulsing dot
  - Time updates every second (live clock)

**Visual checks:**

- ✅ Large, readable time display
- ✅ Pulsing "Live" indicator
- ✅ Time updates in real-time (watch the seconds tick)

---

### 5. Toast Notifications (Error Handling)

**What to test:** Error notifications that appear when something goes wrong.

**How to test:**

- **Option 1:** Simulate an error (you may need to temporarily break the API)
- **Option 2:** Check that error handling is in place (network errors will trigger it)
- **Expected:**
  - Toast slides in from top center
  - Shows error message
  - Has progress bar that counts down
  - Auto-dismisses after 5 seconds
  - Can be manually closed with X button

**Visual checks:**

- ✅ Toast has smooth slide-in animation
- ✅ Progress bar animates
- ✅ Close button works
- ✅ Multiple toasts stack properly

---

### 6. Performance Optimizations

**What to test:** Throttling and smooth streaming.

**How to test:**

- Ask a question that generates a long response
- **Expected:**
  - Streaming should feel smooth (no janky updates)
  - UI updates are throttled to 50ms intervals
  - No excessive re-renders

**How to verify:**

- Open browser DevTools → Performance tab
- Record while asking a question
- Check that updates are throttled (not every frame)

---

### 7. Completion Animation

**What to test:** Subtle glow effect when AI finishes responding.

**How to test:**

- Ask any question and wait for response to complete
- **Expected:**
  - Input field gets a subtle orange ring glow when response finishes
  - Animation lasts ~1 second
  - Smooth fade in/out

**Visual checks:**

- ✅ Ring appears around input field
- ✅ Orange/primary color glow
- ✅ Smooth animation

---

### 8. Reasoning Display (Future-Ready)

**What to test:** Collapsible thinking process display.

**How to test:**

- **Note:** This requires a model that supports reasoning (DeepSeek-R1, Claude with extended thinking)
- Currently your model (`deepseek/deepseek-v3.2-speciale`) may not emit reasoning tokens
- **If you switch models:** Ask a complex question and look for "View AI thinking process" button

**Visual checks (when available):**

- ✅ Collapsible section appears
- ✅ Shows reasoning text in monospace font
- ✅ Expand/collapse works smoothly

---

### 9. Enhanced Markdown Rendering

**What to test:** Proper heading formatting (no ugly "##").

**How to test:**

- Ask questions that generate markdown responses
- **Expected:**
  - Headings render properly (not as "## Heading")
  - Proper spacing around markdown elements
  - Links are clickable and styled
  - Code blocks have syntax highlighting

**Test cases:**

- ✅ "Tell me about your services" → Should have proper headings
- ✅ "What technologies do you use?" → Should format lists nicely
- ✅ No raw markdown syntax visible

---

## Quick Test Script

Run through these questions in order to test everything:

1. **"Who is MiDika?"** → Tests CompanyInfoCard + transient notifications
2. **"What services do you offer?"** → Tests ServicesGrid + transient notifications
3. **"What time is it?"** → Tests TimeDisplay + live clock
4. **"Tell me about your team"** → Tests CompanyInfoCard team section
5. **"What are your core values?"** → Tests CompanyInfoCard values section

---

## Browser DevTools Tips

### Check Transient Notifications

```javascript
// In browser console, you can monitor the onData callback
// The status should appear in the UI above the input
```

### Check Performance

1. Open DevTools → Performance tab
2. Click Record
3. Ask a question
4. Stop recording
5. Look for smooth frame rates (60fps ideally)

### Check Network

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Ask a question
4. Check that streaming is working (chunked responses)

---

## Troubleshooting

### Transient notifications not showing?

- Check browser console for errors
- Verify `onData` callback is being called
- Check that API route is sending transient data

### Tool cards not rendering?

- Check browser console for JSON parsing errors
- Verify tool outputs are valid JSON
- Check that tool names match exactly

### Toast not appearing?

- Check that `onError` callback is set up
- Verify toast state management
- Check z-index (should be z-50)

### Markdown still showing "##"?

- Check that preprocessing regex is working
- Verify markdown component is receiving cleaned content
- Check browser console for errors

---

## Expected Behavior Summary

| Feature          | Trigger            | Visual Result                            |
| ---------------- | ------------------ | ---------------------------------------- |
| Transient Status | Tool execution     | Status text above input with spinner     |
| Company Card     | "Who is MiDika?"   | Animated card with team, contact, values |
| Services Grid    | "What services?"   | Grid of service cards with tech badges   |
| Time Display     | "What time is it?" | Large live clock with pulsing indicator  |
| Toast            | Error occurs       | Slide-in notification with progress bar  |
| Completion Glow  | Response finishes  | Orange ring around input field           |
| Reasoning        | (Model-dependent)  | Collapsible thinking section             |

---

Happy testing! 🚀
