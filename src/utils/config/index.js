const env = process.env.NEXT_PUBLIC_APP_ENV;
console.log("🚀 ~ env:", env)

const urls = {
    production: {
        FRONT_BASE_URL: process.env.NEXT_PUBLIC_LIVE_FRONT_BASE_URL,
        BASE_URL: process.env.NEXT_PUBLIC_LIVE_BASE_URL,
        S3_URL: process.env.NEXT_PUBLIC_LIVE_S3_URL,
    },
    development: {
        FRONT_BASE_URL: process.env.NEXT_PUBLIC_DEV_FRONT_BASE_URL,
        BASE_URL: process.env.NEXT_PUBLIC_DEV_BASE_URL,
        S3_URL: process.env.NEXT_PUBLIC_DEVELOPMENT_S3_URL,
    },
    local: {
        FRONT_BASE_URL: process.env.NEXT_PUBLIC_LOCAL_FRONT_BASE_URL,
        BASE_URL: process.env.NEXT_PUBLIC_LOCAL_BASE_URL,
        S3_URL: process.env.NEXT_PUBLIC_LOCAL_S3_URL,
    },
};

const config = {
    FRONT_BASE_URL: urls[env]?.FRONT_BASE_URL || '',
    BASE_URL: urls[env]?.BASE_URL || '',
};
console.log("🚀 ~ config:", config)

export default config;

