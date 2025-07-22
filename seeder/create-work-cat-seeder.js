const { WorkCategoryModel, LangModel } = require("../models");

const WorkCategory = async () => {
    try {
        // Step 1: Get all language slugs and their IDs
        const langs = await LangModel.findAll({ attributes: ['id', 'slug'] });
        const langMap = {};
        langs.forEach(lang => {
            langMap[lang.slug] = lang.id;
        });

        const insertRecords = [
            { "lang_id": langMap['en'], "name": "Artistic and Creative Activities", "image": "https:\/\/i.pinimg.com\/originals\/c1\/d0\/87\/c1d087ccee41b6287d7537180fcaa6f1.jpg", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['en'], "name": "Mindful and Relaxation Activities", "image": "https:\/\/i0.wp.com\/picjumbo.com\/wp-content\/uploads\/buddha-wallpaper-free-photo.jpg?w=2210&quality=70", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['en'], "name": "Preparation and Planning Activities", "image": "https:\/\/images.bauerhosting.com\/affiliates\/sites\/12\/motherandbaby\/2021\/09\/GettyImages-1163509647.jpg?ar=16%3A9&fit=crop&crop=top&auto=format&w=1440&q=80", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['en'], "name": "Connecting with Loved Ones", "image": "https:\/\/health.sunnybrook.ca\/wp-content\/uploads\/2020\/10\/thanksgiving-webcam.jpg", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['en'], "name": "Educational and Knowledge-Enhancing Activities", "image": "https:\/\/s29814.pcdn.co\/wp-content\/uploads\/2022\/12\/shutterstock_1847661151.jpg.optimal.jpg", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['en'], "name": "Physical and Health-Related Activities", "image": "https:\/\/www.kidrovia.com\/wp-content\/uploads\/2023\/04\/Kidrovia-6-1155x770.jpeg", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['gj'], "name": "કલાત્મક અને સર્જનાત્મક પ્રવૃત્તિઓ", "image": "https:\/\/i.pinimg.com\/originals\/c1\/d0\/87\/c1d087ccee41b6287d7537180fcaa6f1.jpg", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['gj'], "name": "માઇન્ડફુલ અને રિલેક્સેશન એક્ટિવિટીઝ", "image": "https:\/\/i0.wp.com\/picjumbo.com\/wp-content\/uploads\/buddha-wallpaper-free-photo.jpg?w=2210&quality=70", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['gj'], "name": "તૈયારી અને આયોજન પ્રવૃત્તિઓ", "image": "https:\/\/images.bauerhosting.com\/affiliates\/sites\/12\/motherandbaby\/2021\/09\/GettyImages-1163509647.jpg?ar=16%3A9&fit=crop&crop=top&auto=format&w=1440&q=80", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['gj'], "name": "પ્રિયજનો સાથે જોડાણ", "image": "https:\/\/health.sunnybrook.ca\/wp-content\/uploads\/2020\/10\/thanksgiving-webcam.jpg", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['gj'], "name": "શૈક્ષણિક અને જ્ઞાન વધારતી પ્રવૃત્તિઓ", "image": "https:\/\/s29814.pcdn.co\/wp-content\/uploads\/2022\/12\/shutterstock_1847661151.jpg.optimal.jpg", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['gj'], "name": "શારીરિક અને આરોગ્ય-સંબંધિત પ્રવૃત્તિઓ", "image": "https:\/\/www.kidrovia.com\/wp-content\/uploads\/2023\/04\/Kidrovia-6-1155x770.jpeg", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['hi'], "name": "कलात्मक एवं रचनात्मक गतिविधियाँ", "image": "https:\/\/i.pinimg.com\/originals\/c1\/d0\/87\/c1d087ccee41b6287d7537180fcaa6f1.jpg", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['hi'], "name": "दिमागी और विश्राम गतिविधियाँ", "image": "https:\/\/i0.wp.com\/picjumbo.com\/wp-content\/uploads\/buddha-wallpaper-free-photo.jpg?w=2210&quality=70", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['hi'], "name": "तैयारी और योजना गतिविधियाँ", "image": "https:\/\/images.bauerhosting.com\/affiliates\/sites\/12\/motherandbaby\/2021\/09\/GettyImages-1163509647.jpg?ar=16%3A9&fit=crop&crop=top&auto=format&w=1440&q=80", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['hi'], "name": "प्रियजनों से जुड़ना", "image": "https:\/\/health.sunnybrook.ca\/wp-content\/uploads\/2020\/10\/thanksgiving-webcam.jpg", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['hi'], "name": "शैक्षणिक एवं ज्ञानवर्धक गतिविधियाँ", "image": "https:\/\/s29814.pcdn.co\/wp-content\/uploads\/2022\/12\/shutterstock_1847661151.jpg.optimal.jpg", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['hi'], "name": "शारीरिक और स्वास्थ्य संबंधी गतिविधियाँ", "image": "https:\/\/www.kidrovia.com\/wp-content\/uploads\/2023\/04\/Kidrovia-6-1155x770.jpeg", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['es'], "name": "Actividades Artísticas y Creativas", "image": "https:\/\/i.pinimg.com\/originals\/c1\/d0\/87\/c1d087ccee41b6287d7537180fcaa6f1.jpg", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['es'], "name": "Actividades conscientes y de relajación", "image": "https:\/\/i0.wp.com\/picjumbo.com\/wp-content\/uploads\/buddha-wallpaper-free-photo.jpg?w=2210&quality=70", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['es'], "name": "Actividades de preparación y planificación", "image": "https:\/\/images.bauerhosting.com\/affiliates\/sites\/12\/motherandbaby\/2021\/09\/GettyImages-1163509647.jpg?ar=16%3A9&fit=crop&crop=top&auto=format&w=1440&q=80", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['es'], "name": "Conectando con sus seres queridos", "image": "https:\/\/health.sunnybrook.ca\/wp-content\/uploads\/2020\/10\/thanksgiving-webcam.jpg", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['es'], "name": "Actividades educativas y de mejora del conocimiento", "image": "https:\/\/s29814.pcdn.co\/wp-content\/uploads\/2022\/12\/shutterstock_1847661151.jpg.optimal.jpg", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "lang_id": langMap['es'], "name": "Actividades físicas y relacionadas con la salud", "image": "https:\/\/www.kidrovia.com\/wp-content\/uploads\/2023\/04\/Kidrovia-6-1155x770.jpeg", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null }
        ];
        await WorkCategoryModel.bulkCreate(insertRecords);
    } catch (error) {
        console.error("WorkCategory seeder:", error);
    }
};
module.exports = { WorkCategory };
