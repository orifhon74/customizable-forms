// middleware/i18nMiddleware.js
const messages = {
    en: {
        unauthorized: 'Unauthorized',
        admin_only: 'Admin access only',
        // ... add any other translations
    },
    uz: {
        unauthorized: 'Ruxsatsiz',
        admin_only: 'Faqat admin uchun',
        // ...
    },
};

function i18nMiddleware(req, res, next) {
    let lang = 'en'; // default

    // If user is logged in and has a language set:
    if (req.user && req.user.language) {
        lang = req.user.language;
    } else if (req.headers['accept-language']?.startsWith('uz')) {
        lang = 'uz';
    }

    req.t = (key) => {
        return messages[lang]?.[key] || messages['en']?.[key] || key;
    };

    next();
}

module.exports = i18nMiddleware;