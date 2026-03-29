# ⚡ Unity Integration - Exact Setup Guide

## Quick Alignment Check ✅

The backend now **perfectly aligns** with your Unity scripts:

### TherapySyncManager.cs receives:
```json
{
  "speech_script": "string",
  "crowd_count": 0-8,
  "volume_level": 0.0-1.0
}
```

### Backend endpoints that serve this:
- ✅ `GET /v1/session/default` - Full session path
- ✅ `GET /session-data` - Simple path

Both return the exact JSON format your `TherapyData` class expects.

---

## Setup Instructions for Unity Developer

### Step 1: Locate TherapySyncManager in Scene
1. Find the GameObject with `TherapySyncManager` script
2. In the Inspector, find the "Backend Settings" section

### Step 2: Set the Backend URL

**Local Testing:**
```
Backend Url: http://localhost:3000/session-data
```

**Remote Server:**
```
Backend Url: http://your-server-ip:3000/session-data
```

**OR use the v1 path with sessionId:**
```
Backend Url: http://localhost:3000/v1/session/default
```

### Step 3: Verify References
The script needs these references set in Inspector:
- ✅ **Crowd Manager** - Drag the CrowdManager script here
- ✅ **Volume Trigger** - Drag the VolumeTrigger script here  
- ✅ **Script Display** - Drag the TextMeshProUGUI here

### Step 4: Adjust Poll Interval (Optional)
- Default: 2.0 seconds
- Faster: 1.0 seconds (more responsive, more requests)
- Slower: 3.0 seconds (fewer requests, slight delay)

**Recommended: 1.5-2.0 seconds**

### Step 5: Test

**Simulate in Browser:**
```bash
# Backend must be running first!
cd backend && npm run dev

# In another terminal, send test data
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{
    "speech_script": "Hello everyone, welcome to the presentation!",
    "crowd_count": 3,
    "volume_level": 0.6
  }'

# Then in Unity, hit Play
# You should see:
# 1. Script displayed in TextMeshProUGUI
# 2. 3 crowd members appear
# 3. Volume slider moves to 60%
```

---

## Data Flow (Visual)

```
Therapist Dashboard                    Backend Server                  Unity Game
─────────────────────                  ──────────────                  ──────────

Moves crowd slider to 5 ────────→ POST /api/session ──────────→ 
                                  
                                  Stores: crowd_count=5

                                                         ←──── GET /session-data
                                                                (every 2 seconds)
                                                         
                                                         Response: 
                                                         {crowd_count: 5}
                                                         
                                                         ────→ TherapySyncManager
                                                                receives data
                                                                
                                                                ↓
                                                         
                                                         crowdManager.SetCrowdTo(5)
                                                         volumeTrigger.SetVolume()
                                                         scriptDisplay.text = ...
```

---

## Perfect Alignment Guarantee ✅

### Your C# Class:
```csharp
[System.Serializable]
public class TherapyData
{
    public string speech_script;
    public int crowd_count;
    public float volume_level;
}
```

### Backend Response:
```json
{
  "speech_script": "...",
  "crowd_count": 5,
  "volume_level": 0.7
}
```

### What JsonUtility.FromJson Does:
✅ Deserializes these 3 fields perfectly
✅ No missing fields - all present
✅ No type mismatches - types align exactly
✅ No errors - works out of the box

---

## JSON Serialization Example

When therapist clicks "Send to VR":

### Frontend sends:
```json
{
  "speech_script": "Good morning. My name is John...",
  "crowd_count": 4,
  "volume_level": 0.75
}
```

### Backend receives:
```
POST /api/session
↓
Validate: crowd_count in 0-8? ✓ (4 is valid)
Validate: volume_level in 0.0-1.0? ✓ (0.75 is valid)
Store in memory
↓
When Unity polls:
GET /session-data
↓
Return EXACT same values:
{
  "speech_script": "Good morning. My name is John...",
  "crowd_count": 4,
  "volume_level": 0.75
}
```

---

## Debugging Tips

### If script doesn't update:
```csharp
// Add this to TherapySyncManager.ProcessData():
Debug.Log("Received: " + data.speech_script);
Debug.Log("Crowd: " + data.crowd_count);
Debug.Log("Volume: " + data.volume_level);
```

### If crowd doesn't change:
1. Verify CrowdManager reference is set
2. Check that NPC array has 8+ members
3. Check CrowdManager.SetCrowdTo(target) is being called
4. Verify activeCount matches target

### If volume doesn't change:
1. Verify VolumeTrigger reference is set
2. Check AudioSource is assigned
3. Verify volumeSlider exists
4. Check VolumeTrigger.SetVolume() is being called

### If nothing updates:
1. Check backend is running: `curl http://localhost:3000/health`
2. Check backend URL is correct in TherapySyncManager
3. Check browser console/network tab for 404/500 errors
4. Check Unity console for network errors
5. Verify firewall allows port 3000

---

## Example Editor Setup

**TherapySyncManager Inspector:**
```
[Backend Settings]
Backend Url: http://localhost:3000/session-data
Poll Interval: 2.0

[References]
Crowd Manager: (Drag CrowdManager here)
Volume Trigger: (Drag VolumeTrigger here)
Script Display: (Drag TextMeshProUGUI here)
```

---

## API Contract (For Reference)

Your code depends on these endpoints working:

### Therapist Dashboard sends:
```
POST http://backend:3000/api/session
Content-Type: application/json

{
  "speech_script": "string (any length)",
  "crowd_count": integer (0-8),
  "volume_level": float (0.0-1.0)
}

Response: 200 OK
{
  "success": true,
  "message": "Session updated",
  "data": {...}
}

Or: 400 Bad Request
{
  "error": "crowd_count must be between 0 and 8"
}
```

### Unity polls:
```
GET http://backend:3000/session-data
Accept: application/json

Response: 200 OK
{
  "speech_script": "...",
  "crowd_count": 5,
  "volume_level": 0.7
}
```

---

## Database Considerations

**Currently:** Data stored in-memory (lost on server restart)

**For production, consider adding:**
- MongoDB/PostgreSQL for persistence
- Session IDs for multi-patient support
- Timestamps for session history
- User authentication

For now, in-memory works perfectly for development!

---

## Validation Rules (Backend enforces)

| Field | Type | Range | Error Message |
|-------|------|-------|---------------|
| `speech_script` | string | Any length | None (always valid) |
| `crowd_count` | integer | 0-8 | "Must be between 0 and 8" |
| `volume_level` | float | 0.0-1.0 | "Must be between 0.0 and 1.0" |

---

## Complete Working Example

**Start backend:**
```bash
cd backend && npm run dev
```

**Start frontend (optional, for testing):**
```bash
cd frontend && npm run dev
```

**In Unity:**
1. Set Backend Url to: `http://localhost:3000/session-data`
2. Assign CrowdManager, VolumeTrigger, ScriptDisplay in Inspector
3. Hit Play

**Test from terminal:**
```bash
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{
    "speech_script": "Welcome to the presentation",
    "crowd_count": 5,
    "volume_level": 0.8
  }'
```

**Expected Unity behavior:**
- ✅ Script text appears
- ✅ 5 crowd members instantiate
- ✅ Volume goes to 80%

---

**Status:** Backend 100% aligned with your C# scripts ✅  
**No changes needed to your Unity code** ✅  
**Ready to integrate** ✅
