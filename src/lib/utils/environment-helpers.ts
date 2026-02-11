
export function isReadOnlyFileSystem(): boolean {
  
  if (process.env.READ_ONLY_FILE_SYSTEM === 'true') {
    return true;
  }
  if (process.env.READ_ONLY_FILE_SYSTEM === 'false') {
    return false;
  }
  
  if (
    process.env.VERCEL ||
    process.env.VERCEL_ENV ||
    process.env.VERCEL_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL
  ) {
    return true;
  }
  

  if (process.env.NETLIFY || process.env.NETLIFY_ENV) {
    return true;
  }
  
 
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return true;
  }
  
  
  if (process.env.LAMBDA_RUNTIME_DIR || process.env.FUNCTION_TARGET) {
    return true;
  }
  
  
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.includes('localhost')) {
    return true;
  }
  
  
  return false;
}


export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}


export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function getEnvironmentInfo() {
  return {
    nodeEnv: process.env.NODE_ENV,
    isReadOnly: isReadOnlyFileSystem(),
    isDev: isDevelopment(),
    isProd: isProduction(),
    platform: {
      vercel: !!(process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL),
      netlify: !!process.env.NETLIFY,
      lambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
    },
    envVars: {
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
      NODE_ENV: process.env.NODE_ENV,
      READ_ONLY_FILE_SYSTEM: process.env.READ_ONLY_FILE_SYSTEM,
    }
  };
}
