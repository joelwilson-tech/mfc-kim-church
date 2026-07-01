// ==========================================================================
// MFC KIM - Default & Fallback Mock Data
// Pure structure template with clean offline SVG placeholders and songbook.
// ==========================================================================

// Warm styled offline SVG placeholder
export const IMAGE_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='100%' height='100%' fill='%23F4EFE6'/><rect x='20' y='20' width='560' height='360' fill='none' stroke='%23C5A059' stroke-width='2' stroke-dasharray='6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='24' fill='%232C1E14'>✝ MFC KIM Sanctuary</text></svg>";
export const AVATAR_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'><rect width='100%' height='100%' fill='%23F4EFE6'/><circle cx='150' cy='110' r='50' fill='%23C5A059'/><path d='M70 240c0-40 40-70 80-70s80 30 80 70' fill='%23C5A059'/><circle cx='150' cy='150' r='130' fill='none' stroke='%232C1E14' stroke-width='3'/></svg>";

// Helper to generate a beautiful offline viewable HTML lyric sheet
export const makeLyricsHtmlUrl = (title, lyrics) => {
    const html = `<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - MFC KIM Songbook</title>
    <style>
        body {
            background: #FCFBF7;
            color: #2C1E14;
            font-family: 'Playfair Display', serif;
            padding: 40px 20px;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.8;
            border: 2px solid #C5A059;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #C5A059;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        .cross {
            font-size: 28px;
            color: #7A2828;
            margin-bottom: 8px;
        }
        h1 {
            color: #2C1E14;
            font-size: 26px;
            margin: 0;
            letter-spacing: 0.5px;
        }
        .sub-header {
            font-size: 14px;
            color: #C5A059;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 5px;
        }
        pre {
            white-space: pre-wrap;
            font-size: 18px;
            font-family: inherit;
            text-align: center;
            color: #333;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #888;
            margin-top: 40px;
            border-top: 1px solid #F4EFE6;
            padding-top: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="cross">✝</div>
        <h1>${title}</h1>
        <div class="sub-header">MFC KIM Sanctuary Songbook</div>
    </div>
    <pre>${lyrics}</pre>
    <div class="footer">
        © MFC KIM Church • Sanctuary Lyric Library
    </div>
</body>
</html>`;
    return "data:text/html;charset=utf-8," + encodeURIComponent(html);
};

export const MOCK_DATA = {
    settings: {
        site: {
            pastorMessage: "Welcome to MFC KIM! Our prayer is that as you walk through our doors or explore our online home, you will experience the undeniable presence of God and the warmth of genuine family. We are a community rooted in faith, dedicated to service, and passionate about spreading Christ's love to our city and beyond. Whether you are seeking spiritual nourishment, meaningful fellowship, or a place to serve, there is a special home for you here at MFC KIM. May God bless you abundantly this week!",
            pastorPhoto: AVATAR_PLACEHOLDER,
            aboutContent: "Founded on the enduring pillars of faith, prayer, and community stewardship, MFC KIM has been a beacon of hope and spiritual heritage for generations. We believe in discipling believers of all ages and extending compassionate outreach. Our worship combines traditional hymnody with heartfelt praise in an atmosphere of grace.",
            churchAddress: "1244 Heritage Sanctuary Road, Community District, Central City",
            contactEmail: "info@mfckim.org",
            contactPhone: "+1 (555) 384-9200",
            cachedVerse: "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.",
            cachedVerseDate: new Date().toISOString().split('T')[0]
        }
    },
    
    serviceSchedule: [
        { id: "srv-1", icon: "🙏", title: "Sunday Morning Worship", time: "9:00 AM & 11:00 AM", description: "Traditional liturgy, choir worship, and expositional preaching.", order: 1 },
        { id: "srv-2", icon: "📖", title: "Wednesday Prayer & Bible Study", time: "7:00 PM", description: "Midweek spiritual renewal and interactive scriptural study.", order: 2 }
    ],
    
    blogs: [],
    activities: [],
    gallery: [],
    members: [],
    
    // Seeded with actual church songs extracted from the PDF songbook
    songs: [
        {
            id: "song-1",
            title: "राजाधिराजा महिमा के साथ",
            category: "Worship",
            uploadedAt: "2026-07-01",
            fileUrl: makeLyricsHtmlUrl("राजाधिराजा महिमा के साथ", `राजाधिराजा महिमा के साथ
बादलों पर जल्द आनेवाला है

1. एक घर बनाया है मेरे प्रभु ने
ले जायेगा फिर संग वास करने को (2)

2. क्लेश और मुसीबत खत्म हो जायेंगे
प्रभु यीशु ने वायदा किया है (2)

3. महिमा के साथ मेरे प्रभु को
देखूंगा मैं वह आ रहा है (2)

4. समय निकट है मेरे भाई बहनों
दीवट जलाये आत्मा से भरे (2)

5. युगानुयुग मैं रहूंगा मगन से
प्रभु यीशु और संत जनों के साथ

6. तुरही फूँकेंगे मध्याकाश में
दूल्हा आयेगा मुझे ले जायेगा (2)`)
        },
        {
            id: "song-2",
            title: "स्तुति करना आराधना करना",
            category: "Worship",
            uploadedAt: "2026-07-01",
            fileUrl: makeLyricsHtmlUrl("स्तुति करना आराधना करना", `स्तुति करना आराधना करना,
मुझे आनंद है ...... (2)
प्रार्थना और वचन मनन करना
मुझे आनंद है ........ (2)

मेरे दिलमें यीशु मसीह आया,
मुझे आनंद है ...... (2)
ये दुनिया न दे सका वैसा आनंद,
मुझे आनंद है ........ (2)

पापों से उसने मुझे छुड़ाया
मुझे आनंद है ... .... (2)
अपने लहू से धोकर मुझे शुद्ध किया
मुझे आनंद है ..... ... (2)

उद्धार का मार्ग मुझे बताया
मुझे आनंद है .... .... (2)
स्वर्ग राज्य का वारिस मुझे बनाया
मुझे आनंद है ........ (2)`)
        },
        {
            id: "song-3",
            title: "हे स्वर्गीय पिता हो धन्यवाद",
            category: "Hymn",
            uploadedAt: "2026-07-01",
            fileUrl: makeLyricsHtmlUrl("हे स्वर्गीय पिता हो धन्यवाद", `हे स्वर्गीय पिता हो धन्यवाद,
हो तेरी स्तुति आराधना
करता समर्पण आत्मा और जीवन
तेरी आराधना में तन मन धन

मेरे मसीहा हो धन्यवाद
हो तेरी स्तुति आराधना
करता समर्पण आत्मा और जीवन
तेरी आराधना में तन मन धन

पवित्र आत्मा हो धन्यवाद
हो तेरी स्तुति आराधना
करता समर्पण आत्मा और जीवन
तेरी आराधना में तन मन धन`)
        },
        {
            id: "song-4",
            title: "स्वर्ग देश में तुझे देखने",
            category: "Hymn",
            uploadedAt: "2026-07-01",
            fileUrl: makeLyricsHtmlUrl("स्वर्ग देश में तुझे देखने", `स्वर्ग देश में तुझे देखने
स्वर्ग सिय्योन जाने को
मेरे परमेश्वर तेरे साथ रहना
मेरे मन की आशा है।

इस धरती की मेरी यात्रा में
रोज दुःख मुसीबत है
जब तू आयेगा मुझे लेने को
तब होगा पूरा उद्धार

मरुभूमि के अंधकार से
न डरूंगा मैं कभी भी
क्योंकि तू मेरे साथ रहता है
कोई हानी न होगी

सच्चा चरवाहा मेरा रक्षक तु
तेरे पीछे हो लूंगा मैं
हरी चराईयों में मुझे बैठाता
जल के पास ले चलता है

तुरही फूंकने का दिन नजदीक है
हो तैयार उससे मिलने को
मेरी आशा तो बढ़ती रोज बरोज
तु जल्दी आ मसीह`)
        },
        {
            id: "song-5",
            title: "यीशु तेरा नाम मेरा शरणस्थान",
            category: "Worship",
            uploadedAt: "2026-07-01",
            fileUrl: makeLyricsHtmlUrl("यीशु तेरा नाम मेरा शरणस्थान", `यीशु तेरा नाम, मेरा शरणस्थान,
तेरी मैं स्तुति करूंगा (2)
स्तुति करूंगा, सदा स्तुति करूंगा (2)

1. यहोवा यिरे सब कुछ संभालेगा (2)
घबराएंगे नहीं घबराएंगे (2)
यीशु तेरा नाम मेरा शरणस्थान,
तेरी मैं स्तुति करूंगा (2)`)
        },
        {
            id: "song-6",
            title: "यीशु राजा मुक्ति दाता",
            category: "Worship",
            uploadedAt: "2026-07-01",
            fileUrl: makeLyricsHtmlUrl("यीशु राजा मुक्ति दाता", `यीशु राजा मुक्ति दाता,
जीवन की आशा
पास आओ, मुक्ति पाओ
वो सबको है बुलाता

1. हम है निर्बल प्राणी लेकिन
वो ही हमारा बल है (2)
वो ही हमारा उद्धारकर्ता
वो ही जीवन जल है ...... यीशु राजा ...

2. भूखों की वो भूख मिटाता
प्यासों की प्यास बुझाता (2)
भटके हुओं को राह दिखाता
नया जीवन वो देता .... यीशु राजा ...

3. छोड़ दिया उसने स्वर्ग अपना
धरती पर वो आया (2)
मेरे उद्धार के लिये उसने
अपना लहू बहाया। .... यीशु राजा ...`)
        },
        {
            id: "song-7",
            title: "आनंद ही आनंद है",
            category: "Worship",
            uploadedAt: "2026-07-01",
            fileUrl: makeLyricsHtmlUrl("आनंद ही आनंद है", `आनंद ही आनंद है
मेरे यीशु के चरणों में
पाप मेरा क्षमा हुआ
श्राप मेरा निकल गया
यीशु के रक्त द्वारा (2)
नया जीवन यीशु में,
कृपा जीवन यीशु में
पवित्र आत्मा द्वारा (2)

1. बाजे के शब्द से, दूतों की सेना में
आयेगा यीशु राजा (2)
क्षण मात्र में हम रूपांतर होकर,
महिमा में जायेंगे (2)
आनंद .... मेरे ....

2. सर्वशक्ति यीशु, विजय का दाता
जय देनेवाला है (2)
एक कंठ से हम होसन्ना गा कर
सबको बतायेंगे (2)
आनंद .... मेरे .......`)
        },
        {
            id: "song-8",
            title: "आखरी नरसिंगा",
            category: "Hymn",
            uploadedAt: "2026-07-01",
            fileUrl: makeLyricsHtmlUrl("आखरी नरसिंगा", `आखरी नरसिंगा फूंका जानेवाला है
तेरा मेरा सबका यीशु आनेवाला है
तू कहां होगा तू कहां होगा ..... (2)

1. पहले जो मसीह में मुर्दे जी उठेंगे,
बाकी जो हम जिंदा है बदल जायेंगे (2)
पल भर में यह देखो सबकुछ होनेवाला है 2
तू कहां होगा तू कहां होगा ..... (2)

2. तेरे दिल के सारे गम बढ़ते जायेंगे
बीत गये जो लम्हे तेरे पास न आयेंगे (2)
दुनिया में तू तन्हा ही रह जानेवाला है (2)
तू कहां होगा तू कहां होगा ..... (2)

3. तेरी दौलत तेरी शोहरत काम न आयेगी
यह सब चीजें प्यारे तेरे साथ न जायेगी (2)
सब चीजों का खात्मा जल्दी होनेवाला है (2)
तू कहां होगा तू कहां होगा ..... (2)`)
        },
        {
            id: "song-9",
            title: "आनंद मनाये आओ",
            category: "Worship",
            uploadedAt: "2026-07-01",
            fileUrl: makeLyricsHtmlUrl("आनंद मनाये आओ", `आनंद मनाये आओ आनंद मनाये
यीशु राजा मेरा हो गया (2)
इस सृष्टि का पालन हारा,
मेरे हृदय का राजा हुआ (2)

आ ...... आनंद है परम आनंद है
क्या यह मेरा सौभाग्य है (2)
इस सृष्टि का पालन हारा
मेरे हृदय का राजा हुआ (2)

1. मेरे बालकपन से उसने मुझे चुन लिया
मैं था भटका और दूर हो गया (2)
उसकी करुणा ने फिर भी नहीं छोड़ा
नया जीवन मुझे दे दिया (2)
आ ... आनंद है

2. मैं बना रहूंगा प्रेम में अपने प्रभु के
चाहे कोई भी बाधा पड़े (2)
उसकी आज्ञा को नहीं भूलूंगा
जब तक उसका आना न हो (2)
आ .... आनंद है

3. प्यारा प्रभु आयेगा संग में मुझे ले लेगा
ताकि उसके साथ मैं रहूं (2)
मैं मगन रहूंगा उसकी संगति में
वहां आनंद ही आनंद है (2)
आ .... आनंद है`)
        },
        {
            id: "song-10",
            title: "अब तक मुझे चलाया",
            category: "Hymn",
            uploadedAt: "2026-07-01",
            fileUrl: makeLyricsHtmlUrl("अब तक मुझे चलाया", `अब तक मुझे चलाया
अब तक मुझे संभाला
मेरा यीशु कितना अच्छा है
वो हमेशा के लिये काफी है

मेरी जरूरतों को जानकर
आसमान के झरोखे खोलकर
सबकुछ भरपूरी से वो देगा
मेरा यीशु अच्छा चरवाहा है

कभी भी न छोड़ेगा
कभी भी न त्यागेगा
कभी भी न भूलेगा
मेरा यीशु कितना भला है

मेरा यीशु अच्छा वैद्य है
वो मेरा सहारा है
कड़ी धूप में वो मेरी छाया है
मेरा यीशु कितना भला है`)
        }
    ],
    
    files: [],
    messages: []
};

// 365-Day Scriptural Calendar Fallback for Verse of the Day
export const FALLBACK_VERSES = [
    { ref: "John 3:16", text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
    { ref: "Philippians 4:6-7", text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus." },
    { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths." },
    { ref: "Jeremiah 29:11", text: "For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end." },
    { ref: "Isaiah 40:31", text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint." },
    { ref: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want." },
    { ref: "Matthew 11:28", text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest." },
    { ref: "Romans 8:28", text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose." },
    { ref: "Joshua 1:9", text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest." },
    { ref: "2 Corinthians 5:17", text: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new." }
];
