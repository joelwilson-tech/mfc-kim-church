// ==========================================================================
// MFC KIM - Unified Data Service Layer
// Bridges live Firebase Firestore with local Mock Data fallback.
// ==========================================================================
import { db, isFirebaseConfigured } from "./firebase-config.js";
import { MOCK_DATA, FALLBACK_VERSES } from "./mock-data.js";
import { collection, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/**
 * Fetch all documents from a specified collection.
 */
export async function getCollectionData(colName) {
    if (isFirebaseConfigured && db) {
        try {
            const colRef = collection(db, colName);
            const snapshot = await getDocs(colRef);
            if (!snapshot.empty) {
                const results = [];
                snapshot.forEach(docSnap => {
                    results.push({ id: docSnap.id, ...docSnap.data() });
                });
                return results;
            }
        } catch (error) {
            console.warn(`Error reading ${colName} from Firestore, falling back to mock data:`, error);
        }
    }
    // Fallback to local mock data
    return MOCK_DATA[colName] || [];
}

/**
 * Fetch the site settings document ("settings/site").
 */
export async function getSiteSettings() {
    if (isFirebaseConfigured && db) {
        try {
            const docRef = doc(db, "settings", "site");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            }
        } catch (error) {
            console.warn("Error reading site settings from Firestore, falling back to mock data:", error);
        }
    }
    return MOCK_DATA.settings.site;
}

/**
 * Fetch Daily Bible Verse (from bible-api.com) with caching in Firestore / LocalStorage.
 */
export async function fetchVerseOfTheDay() {
    const todayStr = new Date().toISOString().split('T')[0];
    let settings = await getSiteSettings();

    // Check if today's verse is already cached
    if (settings.cachedVerseDate === todayStr && settings.cachedVerse) {
        return {
            text: settings.cachedVerse,
            ref: settings.cachedVerseRef || "Daily Scripture"
        };
    }

    // Pick reference based on day of year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const fallbackItem = FALLBACK_VERSES[dayOfYear % FALLBACK_VERSES.length];

    try {
        const queryRef = encodeURIComponent(fallbackItem.ref);
        const res = await fetch(`https://bible-api.com/${queryRef}`);
        if (res.ok) {
            const data = await res.json();
            const verseText = data.text.trim();
            const verseRef = data.reference;

            // Save to Firestore if configured
            if (isFirebaseConfigured && db) {
                try {
                    const docRef = doc(db, "settings", "site");
                    await setDoc(docRef, {
                        ...settings,
                        cachedVerse: verseText,
                        cachedVerseRef: verseRef,
                        cachedVerseDate: todayStr
                    }, { merge: true });
                } catch (e) {
                    console.error("Failed to update cached verse in Firestore:", e);
                }
            } else {
                // Save to local storage for demo continuity
                localStorage.setItem("mfckim_cached_verse", JSON.stringify({
                    text: verseText,
                    ref: verseRef,
                    date: todayStr
                }));
            }

            return { text: verseText, ref: verseRef };
        }
    } catch (e) {
        console.warn("bible-api.com fetch error, using local scriptural calendar:", e);
    }

    // Local Storage check for demo mode
    const localCached = localStorage.getItem("mfckim_cached_verse");
    if (localCached) {
        try {
            const parsed = JSON.parse(localCached);
            if (parsed.date === todayStr) return { text: parsed.text, ref: parsed.ref };
        } catch(e) {}
    }

    return {
        text: fallbackItem.text,
        ref: fallbackItem.ref
    };
}

/**
 * Submit contact form inquiry to Firestore "messages" collection.
 */
export async function submitContactMessage(msgData) {
    const newMsg = {
        name: msgData.name || "Anonymous",
        email: msgData.email || "",
        phone: msgData.phone || "",
        subject: msgData.subject || "General Inquiry",
        message: msgData.message || "",
        createdAt: new Date().toISOString(),
        read: false
    };

    if (isFirebaseConfigured && db) {
        try {
            const colRef = collection(db, "messages");
            const docRef = await addDoc(colRef, newMsg);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error("Error saving message to Firestore:", error);
            return { success: false, error: error.message };
        }
    } else {
        // Fallback: append to local storage array for demo testing
        const existing = JSON.parse(localStorage.getItem("mfckim_mock_messages") || "[]");
        newMsg.id = "msg-" + Date.now();
        existing.unshift(newMsg);
        localStorage.setItem("mfckim_mock_messages", JSON.stringify(existing));
        console.log("💬 Message saved locally in demo mode:", newMsg);
        return { success: true, id: newMsg.id, demo: true };
    }
}
