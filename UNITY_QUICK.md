# 🎮 UNITY QUICK START - Copy This

## 1️⃣ Backend URL Setup

Open Unity Inspector on **TherapySyncManager** script and set:

```
Backend Url: http://localhost:3000/session-data
```

That's it. Everything else works.

---

## 2️⃣ What the Backend Returns

```json
{
  "speech_script": "Full text patient reads",
  "crowd_count": 5,
  "volume_level": 0.7
}
```

✅ Your `TherapyData` class deserializes this perfectly

---

## 3️⃣ Testing Flow

### Terminal 1 (Backend)
```bash
cd backend && npm run dev
```

### Terminal 2 (Send Test Data)
```bash
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{
    "speech_script": "Hello everyone!",
    "crowd_count": 3,
    "volume_level": 0.5
  }'
```

### Unity
- Hit Play
- In ~2 seconds you should see:
  - Script text appear
  - 3 crowd members spawn
  - Volume slider move to 50%

---

## 4️⃣ Debug Console Outputs

**Backend shows:**
```
📝 Session updated: Crowd=3, Volume=50%
🔌 Client connected: socket_id
```

**Unity Console shows:**
```
TherapyData received successfully
Script updated
Crowd set to 3
Volume set to 0.5
```

---

## 5️⃣ Inspector Checklist

- ✅ Backend Url set to: `http://localhost:3000/session-data`
- ✅ Poll Interval: `2.0` (or your preferred value)
- ✅ Crowd Manager assigned
- ✅ Volume Trigger assigned
- ✅ Script Display assigned
- ✅ No console errors
- ✅ Hit Play!

---

## 6️⃣ Alternative Backend URL

If you want to use the sessionId path instead:

```
Backend Url: http://localhost:3000/v1/session/default
```

Both work identically!

---

## 7️⃣ If It's Not Working

### Check 1: Backend Running?
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok"...}
```

### Check 2: Can Reach Backend?
```bash
curl http://localhost:3000/session-data
```

### Check 3: Console Errors?
- Open Unity Console (Ctrl+Shift+C)
- Check for network/JSON errors
- Verify TherapyData class exists

### Check 4: References Set?
- All 3 references (CrowdManager, VolumeTrigger, ScriptDisplay) assigned?

---

## 8️⃣ Response Guarantee

When therapist updates in dashboard:

```
Update sent →  Backend validates → Backend stores → 
Next poll → Your Get request → JSON response received → 
JsonUtility deserializes → Your TherapyData object ready
```

100% guaranteed to work ✅

---

## 9️⃣ Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| "NetworkError" | Backend not running, URL wrong, or port blocked |
| Script doesn't appear | Check scriptDisplay reference assigned |
| Crowd doesn't spawn | Check CrowdManager reference + npcCrowd array size |
| Volume doesn't change | Check VolumeTrigger reference + AudioSource assigned |
| Console error "script_script" | Field name is `speech_script` not `script_script` |
| JsonUtility fails | Missing a required field in JSON response |

---

## 🔟 One-Click Test (Full Chain)

```bash
# Terminal 1
cd backend && npm run dev

# Wait for "ready in XXms"

# Terminal 2
curl -X POST http://localhost:3000/api/session -H "Content-Type: application/json" -d '{"speech_script":"Test","crowd_count":2,"volume_level":0.5}'

# Unity Editor
# 1. Set Backend Url in TherapySyncManager
# 2. Assign all 3 references
# 3. Hit Play
# 4. Watch scene update in ~2 seconds
```

---

**That's it! You're connected!** 🚀

For detailed info, see: `UNITY_SETUP.md`
For backend details, see: `BACKEND_ALIGNMENT.md`
