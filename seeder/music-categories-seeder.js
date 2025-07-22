const { LangModel, MusicCategoryModel } = require("../models");
const { slugify: translitSlugify } = require('transliteration');


const MusicCategory = async () => {
    try {
        // Step 1: Get all language slugs and their IDs
        const langs = await LangModel.findAll({ attributes: ['id', 'slug'] });
        const langMap = {};
        langs.forEach(lang => {
            langMap[lang.slug] = lang.id;
        });

        const rawRecords = [
            { "lang_id": langMap['en'], "name": "Pregnancy" },
            { "lang_id": langMap['en'], "name": "Lullaby" },
            { "lang_id": langMap['en'], "name": "Children Songs" },
            { "lang_id": langMap['en'], "name": "Garbh-Samwaad" },
            { "lang_id": langMap['en'], "name": "Meditation & Instrumental" },
            { "lang_id": langMap['en'], "name": "Prathana" },
            { "lang_id": langMap['en'], "name": "Shree-Krishna Bhajan" },
            { "lang_id": langMap['en'], "name": "Strotra & Mantras" },
            { "lang_id": langMap['en'], "name": "Vedas" },
            { "lang_id": langMap['gj'], "name": "ગર્ભાવસ્થા" },
            { "lang_id": langMap['gj'], "name": "લોરી" },
            { "lang_id": langMap['gj'], "name": "બાળકોના ગીતો" },
            { "lang_id": langMap['gj'], "name": "ગર્ભ-સંવાદ" },
            { "lang_id": langMap['gj'], "name": "ધ્યાન અને ઇન્સ્ટ્રુમેન્ટલ" },
            { "lang_id": langMap['gj'], "name": "પ્રાથના" },
            { "lang_id": langMap['gj'], "name": "શ્રી-કૃષ્ણ ભજન" },
            { "lang_id": langMap['gj'], "name": "સ્ત્રોત્ર અને મંત્રો" },
            { "lang_id": langMap['gj'], "name": "વેદ" },
            { "lang_id": langMap['hi'], "name": "गर्भावस्था" },
            { "lang_id": langMap['hi'], "name": "लोरी" },
            { "lang_id": langMap['hi'], "name": "बच्चों के गाने" },
            { "lang_id": langMap['hi'], "name": "गर्भ-संवाद" },
            { "lang_id": langMap['hi'], "name": "ध्यान एवं वाद्य" },
            { "lang_id": langMap['hi'], "name": "प्रार्थना" },
            { "lang_id": langMap['hi'], "name": "श्री कृष्ण भजन" },
            { "lang_id": langMap['hi'], "name": "स्तोत्र एवं मंत्र" },
            { "lang_id": langMap['hi'], "name": "वेदों" },
            { "lang_id": langMap['es'], "name": "El embarazo" },
            { "lang_id": langMap['es'], "name": "Canción de cuna" },
            { "lang_id": langMap['es'], "name": "Canciones infantiles" },
            { "lang_id": langMap['es'], "name": "Garbh-Samwaad" },
            { "lang_id": langMap['es'], "name": "Meditación e Instrumental" },
            { "lang_id": langMap['es'], "name": "Pratana" },
            { "lang_id": langMap['es'], "name": "Shree-Krishna Bhajan" },
            { "lang_id": langMap['es'], "name": "Estrotras y mantras" },
            { "lang_id": langMap['es'], "name": "Vedas", }
        ];

        // Step 3: Map to add slug and timestamps
        const insertRecords = rawRecords.map(record => {
            let rawName = record.name || '';
            let slug = translitSlugify(rawName, { lowercase: true });

            if (!slug || slug.trim() === '') {
                slug = `no-valid-slug-${Date.now()}`;
            }

            return {
                ...record,
                slug,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            };
        });

        await MusicCategoryModel.bulkCreate(insertRecords);
    } catch (error) {
        console.error("MusicCategoryModel seeder:", error);
    }
};
module.exports = { MusicCategory };