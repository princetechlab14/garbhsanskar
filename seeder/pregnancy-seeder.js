const { LangModel, PregnancyModel } = require("../models");
const { slugify: translitSlugify } = require('transliteration');


const pregnancy = async () => {
    try {
        // Step 1: Get all language slugs and their IDs
        const langs = await LangModel.findAll({ attributes: ['id', 'slug'] });
        const langMap = {};
        langs.forEach(lang => {
            langMap[lang.slug] = lang.id;
        });

        const rawRecords = [
            { "lang_id": langMap['en'], "name": "Fertility issues and options", "image": "1.jpg", "insert_date": "2023-09-29 16:22:00" },
            { "lang_id": langMap['en'], "name": "Health concerns", "image": "2.jpg", "insert_date": "2023-09-29 16:22:00" },
            { "lang_id": langMap['en'], "name": "Keeping healthy during pregnancy", "image": "3.jpg", "insert_date": "2023-09-29 17:31:31" },
            { "lang_id": langMap['en'], "name": "Pregnancy and birth basics", "image": "4.jpg", "insert_date": "2023-09-29 17:31:31" },
            { "lang_id": langMap['en'], "name": "Preparing for birth", "image": "5.jpg", "insert_date": "2023-09-29 17:31:31" },
            { "lang_id": langMap['en'], "name": "Stages of pregnancy", "image": "6.jpg", "insert_date": "2023-09-29 17:31:31" },
            { "lang_id": langMap['hi'], "name": "प्रजनन संबंधी मुद्दे और विकल्प", "image": "1.jpg", "insert_date": "2023-09-29 16:22:00" },
            { "lang_id": langMap['hi'], "name": "स्वास्थ्य संबंधी समस्याएं", "image": "2.jpg", "insert_date": "2023-09-29 16:22:00" },
            { "lang_id": langMap['hi'], "name": "गर्भावस्था के दौरान स्वस्थ रहना", "image": "3.jpg", "insert_date": "2023-09-29 17:31:31" },
            { "lang_id": langMap['hi'], "name": "गर्भावस्था और जन्म की मूल बातें", "image": "4.jpg", "insert_date": "2023-09-29 17:31:31" },
            { "lang_id": langMap['hi'], "name": "जन्म की तैयारी", "image": "5.jpg", "insert_date": "2023-09-29 17:31:31" },
            { "lang_id": langMap['hi'], "name": "गर्भावस्था के चरण", "image": "6.jpg", "insert_date": "2023-09-29 17:31:31" },
            { "lang_id": langMap['gj'], "name": "પ્રજનન સમસ્યાઓ અને વિકલ્પો", "image": "1.jpg", "insert_date": "2023-09-29 16:22:00" },
            { "lang_id": langMap['gj'], "name": "સ્વાસ્થ્યની ચિંતા", "image": "2.jpg", "insert_date": "2023-09-29 16:22:00" },
            { "lang_id": langMap['gj'], "name": "ગર્ભાવસ્થા દરમિયાન સ્વસ્થ રહેવું", "image": "3.jpg", "insert_date": "2023-09-29 17:31:31" },
            { "lang_id": langMap['gj'], "name": "ગર્ભાવસ્થા અને જન્મની મૂળભૂત બાબતો", "image": "4.jpg", "insert_date": "2023-09-29 17:31:31" },
            { "lang_id": langMap['gj'], "name": "જન્મ માટે તૈયારી", "image": "5.jpg", "insert_date": "2023-09-29 17:31:31" },
            { "lang_id": langMap['gj'], "name": "ગર્ભાવસ્થાના તબક્કાઓ", "image": "6.jpg", "insert_date": "2023-09-29 17:31:31" },
            { "lang_id": langMap['es'], "name": "Problemas y opciones de fertilidad", "image": "1.jpg", "insert_date": "2023-09-29 16:22:00" },
            { "lang_id": langMap['es'], "name": "Preocupaciones de salud", "image": "2.jpg", "insert_date": "2023-09-29 16:22:00" },
            { "lang_id": langMap['es'], "name": "Mantenerse saludable durante el embarazo", "image": "3.jpg", "insert_date": "2023-09-29 17:31:31" },
            { "lang_id": langMap['es'], "name": "Conceptos básicos del embarazo y el parto.", "image": "4.jpg", "insert_date": "2023-09-29 17:31:31" },
            { "lang_id": langMap['es'], "name": "Preparándose para el nacimiento", "image": "5.jpg", "insert_date": "2023-09-29 17:31:31" },
            { "lang_id": langMap['es'], "name": "Etapas del embarazo", "image": "6.jpg", "insert_date": "2023-09-29 17:31:31" }
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

        await PregnancyModel.bulkCreate(insertRecords);
    } catch (error) {
        console.error("pregnancy seeder:", error);
    }
};
module.exports = { pregnancy };