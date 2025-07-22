const { LangModel } = require("../models");

const language = async () => {
    try {
        
        const insertRecords = [
            { "name": "Hi", "slug": "hi", "image": null, "shorting": 500, "status": "Active", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "name": "GJ", "slug": "gj", "image": null, "shorting": 500, "status": "Active", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "name": "En", "slug": "en", "image": null, "shorting": 500, "status": "Active", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
            { "name": "Es", "slug": "es", "image": null, "shorting": 500, "status": "Active", "created_at": new Date(), "updated_at": new Date(), "deleted_at": null },
        ];
        await LangModel.bulkCreate(insertRecords);
    } catch (error) {
        console.error("Lang seeder:", error);
    }
};
module.exports = { language };
