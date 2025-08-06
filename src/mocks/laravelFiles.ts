export const mockLaravelFiles = {
    models: [
        {
            file: "api_docs.php",
            model: true,
            table: true,
            alias: false,
            view: false
        },
        // ...just few examples to keep it short
        {
            file: "m_customers.php",
            model: true,
            table: true,
            alias: false,
            view: false
        },
        {
            file: "v_stock_item.php",
            model: true,
            table: true,
            alias: false,
            view: true
        }
    ],
    js: [
        "api_docs.js",
        "m_customer.js",
        "dashboard.js"
    ],
    blades: [
        "api_docs.blade.php",
        "dashboard.blade.php",
        "login.blade.php"
    ],
    cores: [
        "Approval.php",
        "Bootstrap.php",
        "Frontend.php"
    ],
    role: "owner",
    realfk: 0
};
