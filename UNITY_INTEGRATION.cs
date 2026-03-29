// ============================================
// Unity VR Integration Guide
// Xposure Therapist Backend Integration
// ============================================

/*
  This guide explains how to integrate the Xposure backend
  with your Unity VR application for real-time patient monitoring
  and environmental control.
*/

// ============================================
// PART 1: Setup RestClient in Unity
// ============================================

/*
  1. In Unity, install RestClient package:
     - Window > TextMesh Pro > Import TMP Essential Resources
     - Download UnityWebRequest (built-in with Unity)
  
  2. Or use external library:
     - Import "Best HTTP" or "UnityWebRequest"
*/

using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Collections.Generic;

// ============================================
// PART 2: Session Manager Script
// ============================================

/*
  Create a new C# script called "SessionManager.cs"
  Attach it to an empty GameObject in your VR scene.
  
  This script:
  - Polls the backend every 1-2 seconds for session config
  - Updates the VR environment (crowd, noise, script)
  - Connects to real-time BPM via WebSocket (optional)
*/

public class SessionManager : MonoBehaviour
{
    [System.Serializable]
    public class SessionData
    {
        public string sessionId;
        public string speech_script;
        public int crowd_count;
        public float volume_level;
        public string timestamp;
    }

    // Backend configuration
    private string backendUrl = "http://127.0.0.1:3000";
    private string sessionId = "default";
    private float pollInterval = 1.5f; // Poll every 1.5 seconds
    private float lastPollTime = 0f;

    // Current session state
    private SessionData currentSession;
    private SessionData previousSession;

    // VR Scene References
    [SerializeField] private CrowdManager crowdManager;        // Script to manage crowd
    [SerializeField] private AudioSourceManager audioManager;  // Script to manage ambience
    [SerializeField] private TextMesh scriptDisplay;           // 3D text object showing script
    [SerializeField] private Canvas uiCanvas;                  // UI for debug info

    // Debug logging
    public bool enableDebugLogging = true;

    // ============================================
    // INITIALIZATION
    // ============================================

    void Start()
    {
        Debug.Log("🎮 SessionManager initialized");
        
        // Initialize previous session to avoid false updates
        currentSession = new SessionData();
        previousSession = new SessionData();
        
        // Optional: Set custom backend URL from environment
        if (!string.IsNullOrEmpty(System.Environment.GetEnvironmentVariable("BACKEND_URL")))
        {
            backendUrl = System.Environment.GetEnvironmentVariable("BACKEND_URL");
        }
        
        Debug.Log($"📍 Backend URL: {backendUrl}");
    }

    // ============================================
    // MAIN UPDATE LOOP
    // ============================================

    void Update()
    {
        // Poll backend at regular intervals
        if (Time.time - lastPollTime > pollInterval)
        {
            lastPollTime = Time.time;
            StartCoroutine(PollSessionConfig());
        }
    }

    // ============================================
    // POLL BACKEND FOR SESSION CONFIG
    // ============================================

    IEnumerator PollSessionConfig()
    {
        string url = $"{backendUrl}/v1/session/{sessionId}";
        
        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            request.SetRequestHeader("Accept", "application/json");
            
            // Timeout after 5 seconds
            request.timeout = 5;
            
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                try
                {
                    string jsonResponse = request.downloadHandler.text;
                    previousSession = currentSession;
                    currentSession = JsonUtility.FromJson<SessionData>(jsonResponse);
                    
                    if (enableDebugLogging)
                        Debug.Log($"✓ Fetched session config: {currentSession.speech_script.Substring(0, 30)}...");
                    
                    // Check if config changed and apply updates
                    ApplySessionUpdates();
                }
                catch (System.Exception ex)
                {
                    Debug.LogError($"❌ Failed to parse session JSON: {ex.Message}");
                }
            }
            else
            {
                Debug.LogWarning($"⚠️ Backend request failed: {request.error}");
                // Handle offline mode or fallback
            }
        }
    }

    // ============================================
    // APPLY UPDATES TO VR SCENE
    // ============================================

    void ApplySessionUpdates()
    {
        // Update script if changed
        if (currentSession.speech_script != previousSession.speech_script)
        {
            UpdateScriptDisplay(currentSession.speech_script);
        }

        // Update crowd if changed (0-8)
        if (currentSession.crowd_count != previousSession.crowd_count)
        {
            UpdateCrowdDensity(currentSession.crowd_count);
        }

        // Update ambient noise if changed (0.0-1.0)
        if (currentSession.volume_level != previousSession.volume_level)
        {
            UpdateAmbientNoise(currentSession.volume_level);
        }
    }

    // ============================================
    // VR ENVIRONMENT UPDATES
    // ============================================

    void UpdateScriptDisplay(string script)
    {
        if (scriptDisplay != null)
        {
            scriptDisplay.text = script;
            Debug.Log("📝 Script updated in VR scene");
        }
        else
        {
            Debug.LogWarning("⚠️ scriptDisplay reference not set!");
        }
    }

    void UpdateCrowdDensity(int crowdCount)
    {
        // Clamp to valid range (0-8)
        crowdCount = Mathf.Clamp(crowdCount, 0, 8);
        
        if (crowdManager != null)
        {
            crowdManager.SetCrowdCount(crowdCount);
            Debug.Log($"👥 Crowd updated to {crowdCount} members");
        }
        else
        {
            Debug.LogWarning("⚠️ crowdManager reference not set!");
        }
    }

    void UpdateAmbientNoise(float volumeLevel)
    {
        // Clamp to valid range (0.0-1.0)
        volumeLevel = Mathf.Clamp01(volumeLevel);
        
        if (audioManager != null)
        {
            audioManager.SetAmbientVolume(volumeLevel);
            Debug.Log($"🔊 Ambient noise updated to {(volumeLevel * 100):F0}%");
        }
        else
        {
            Debug.LogWarning("⚠️ audioManager reference not set!");
        }
    }

    // ============================================
    // DEBUG UTILITIES
    // ============================================

    public void LogCurrentSession()
    {
        Debug.Log($"Current Session Data:");
        Debug.Log($"  Script: {currentSession.speech_script}");
        Debug.Log($"  Crowd: {currentSession.crowd_count}");
        Debug.Log($"  Volume: {currentSession.volume_level}");
        Debug.Log($"  Timestamp: {currentSession.timestamp}");
    }

    public SessionData GetCurrentSession() => currentSession;
}

// ============================================
// PART 3: Crowd Manager Script
// ============================================

/*
  Create a script called "CrowdManager.cs"
  This handles instantiating/destroying crowd members
*/

public class CrowdManager : MonoBehaviour
{
    [SerializeField] private GameObject[] crowdPrefabs = new GameObject[9]; // 0-8
    [SerializeField] private Transform crowdParent;
    
    private int currentCrowdCount = 0;
    private List<GameObject> activeCrowd = new List<GameObject>();

    public void SetCrowdCount(int count)
    {
        count = Mathf.Clamp(count, 0, 8);
        
        if (count > currentCrowdCount)
        {
            // Add more crowd members
            for (int i = currentCrowdCount; i < count; i++)
            {
                GameObject crowdMember = Instantiate(
                    crowdPrefabs[i],
                    crowdParent.position,
                    crowdParent.rotation,
                    crowdParent
                );
                activeCrowd.Add(crowdMember);
            }
        }
        else if (count < currentCrowdCount)
        {
            // Remove crowd members
            for (int i = count; i < currentCrowdCount; i++)
            {
                if (i < activeCrowd.Count)
                {
                    Destroy(activeCrowd[i]);
                }
            }
            activeCrowd.RemoveRange(count, currentCrowdCount - count);
        }
        
        currentCrowdCount = count;
        Debug.Log($"👥 Crowd set to {count} members");
    }

    public int GetCrowdCount() => currentCrowdCount;
}

// ============================================
// PART 4: Audio Manager Script
// ============================================

/*
  Create a script called "AudioSourceManager.cs"
  This handles ambient sound level
*/

public class AudioSourceManager : MonoBehaviour
{
    [SerializeField] private AudioSource ambientAudio;
    
    public void SetAmbientVolume(float volumeLevel)
    {
        // volumeLevel: 0.0 - 1.0
        if (ambientAudio != null)
        {
            ambientAudio.volume = volumeLevel;
            Debug.Log($"🔊 Audio volume: {(volumeLevel * 100):F0}%");
        }
    }

    public float GetAmbientVolume()
    {
        return ambientAudio != null ? ambientAudio.volume : 0f;
    }
}

// ============================================
// PART 5: SETUP IN UNITY EDITOR
// ============================================

/*
1. Create empty GameObject: "SessionManager"
2. Attach SessionManager.cs script to it
3. Create empty GameObject: "CrowdManager"
4. Attach CrowdManager.cs script to it
5. Create empty GameObject: "AudioManager"
6. Attach AudioSourceManager.cs script to it
7. Create 3D Text object for the script display
8. In SessionManager inspector:
   - Drag CrowdManager to "Crowd Manager" field
   - Drag AudioManager to "Audio Manager" field
   - Drag TextMesh to "Script Display" field
   - Check "Enable Debug Logging" for testing
9. Hit Play!
*/

// ============================================
// PART 6: TESTING
// ============================================

/*
Test the integration:

1. Start backend:
   cd backend && npm run dev

2. Start frontend (optional, for therapist control):
   cd frontend && npm run dev

3. Open Unity and start the game
   - You should see console messages like:
     "✓ Fetched session config..."
     "📝 Script updated in VR scene"
     "👥 Crowd updated to 5 members"
     "🔊 Ambient noise updated to 70%"

4. In browser/frontend, adjust sliders:
   - Move crowd density slider
   - Move ambient noise slider
   - Add/change script
   - Click "Send to VR"

5. In Unity, you should immediately (within 1-2 seconds) see:
   - Script text changes
   - Crowd members appear/disappear
   - Audio volume changes

*/

// ============================================
// PART 7: ADVANCED - REAL-TIME BPM MONITORING
// ============================================

/*
  Optional: Connect to backend WebSocket for real-time BPM
  instead of polling.
  
  For this, you'd need WebSocket for Unity:
  - Asset Store: "WebSocket" or "Socket.IO for Unity"
  - Or use: https://github.com/endel/NativeWebSocket
  
  Usage:
  
    var socket = new WebSocket("ws://127.0.0.1:3000");
    socket.OnMessage += (byte[] data) => {
        string json = System.Text.Encoding.UTF8.GetString(data);
        BPMUpdate bpm = JsonUtility.FromJson<BPMUpdate>(json);
        Debug.Log("BPM: " + bpm.bpm);
    };
    socket.Connect();
*/

// ============================================
// PART 8: TROUBLESHOOTING
// ============================================

/*
Problem: "Backend connection failed"
Solution:
  - Check backend is running: npm run dev
  - Verify URL is correct
  - Check firewall allows port 3000
  - On same LAN? Use: http://192.168.x.x:3000

Problem: "Script not updating"
Solution:
  - Check scriptDisplay reference is set
  - Verify script text is valid JSON
  - Check console for parsing errors

Problem: "Crowd not appearing"
Solution:
  - Check CrowdManager reference is set
  - Verify crowd prefabs are assigned (0-8)
  - Check Scene has enough space
  - Verify crowdCount is 0-8 range

Problem: "Audio volume not changing"
Solution:
  - Check AudioSourceManager reference is set
  - Verify AudioSource component exists
  - Check volume_level is between 0.0-1.0
  - Test manually with AudioSource.volume = 0.5
*/

// ============================================
// OFFICIAL ENDPOINT
// ============================================

/*
The main endpoint Unity should poll:
  GET /v1/session/{sessionId}
  
Example URL:
  http://127.0.0.1:3000/v1/session/default
  
Response format:
  {
    "sessionId": "default",
    "speech_script": "Hello everyone...",
    "crowd_count": 5,
    "volume_level": 0.7,
    "timestamp": "2024-03-29T10:35:00.456Z"
  }

Polling frequency:
  Recommended: 1-2 seconds
  Minimum: 0.5 seconds (to avoid overload)
  Maximum: 5 seconds (slower response time)
  
  Current code: 1.5 seconds (good balance)
*/

// ============================================
// SUMMARY
// ============================================

/*
Key Integration Points:
1. ✅ SessionManager polls /v1/session/{sessionId} every 1-2 seconds
2. ✅ Receives: speech_script, crowd_count (0-8), volume_level (0.0-1.0)
3. ✅ CrowdManager spawns/removes crowd members based on count
4. ✅ AudioSourceManager updates ambient volume
5. ✅ TextMesh displays the speech script
6. ✅ Console logs show real-time updates
7. ✅ Works with therapist dashboard in real-time

That's it! Your VR application is now synchronized with 
the Xposure therapist backend!
*/
