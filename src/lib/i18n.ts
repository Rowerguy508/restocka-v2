// Translation strings for Restocka
export const translations = {
  en: {
    // Onboarding
    welcome: "Welcome to Restocka",
    setup_subtitle: "Let's get you set up with your restaurant inventory management.",
    restaurant_name: "Restaurant Name *",
    restaurant_placeholder: "My Restaurant",
    location_optional: "Location (optional)",
    location_placeholder: "Main Branch",
    use_device_location: "Use Device Location",
    getting_location: "Getting location...",
    share_location: "Share Location",
    location_permission: "Share your device location to automatically set up your restaurant's coordinates.",
    get_started: "Get Started",
    creating: "Creating...",
    error_restaurant_required: "Please enter your restaurant name",
    error_auth: "Error: User not authenticated",
    error_creating: "Error creating organization",
    coordinates: "", // Will be filled dynamically
    
    // Login Page
    login: "Sign In",
    login_description: "Enter your email and password",
    signup: "Create Account",
    signup_description: "Enter your details to register",
    email: "Email address",
    email_placeholder: "your@restaurant.com",
    password: "Password",
    password_placeholder: "••••••••",
    confirm_password: "Confirm Password",
    creating_account: "Creating account...",
    signing_in: "Signing in...",
    sending_link: "Sending...",
    forgot_password: "Forgot your password?",
    no_account: "Don't have an account? Sign up",
    have_account: "Already have an account? Sign in",
    reset_password: "Reset Password",
    reset_description: "We'll send you a link to reset your password",
    reset_sent: "Email Sent!",
    check_email: `Check your email`,
    back_to_login: "Back to sign in",
    problems: "Problems signing in? Contact your administrator.",
    
    // Validation
    invalid_email: "Please enter a valid email",
    password_min: "Password must be at least 6 characters",
    passwords_not_match: "Passwords do not match",
    
    // Toast messages
    account_created: "Account created!",
    can_now_login: "You can now sign in.",
    
    // Dashboard
    dashboard: "Dashboard",
    loading: "Loading...",
    verifying: "Verifying permissions...",
    access_error: "Access Error",
    no_account_verification: "We couldn't verify your account.",
    
    // Navigation
    products: "Products",
    usage: "Usage",
    suppliers: "Suppliers",
    rules: "Rules",
    orders: "Orders",
    integrations: "Integrations",
    locations: "Locations",
    settings: "Settings",
    manager_dashboard: "Manager Dashboard",
  },
  es: {
    // Onboarding
    welcome: "Bienvenido a Restocka",
    setup_subtitle: "Configuremos tu sistema de inventario para restaurantes.",
    restaurant_name: "Nombre del Restaurante *",
    restaurant_placeholder: "Mi Restaurante",
    location_optional: "Ubicación (opcional)",
    location_placeholder: "Sucursal Principal",
    use_device_location: "Usar ubicación del dispositivo",
    getting_location: "Obteniendo ubicación...",
    share_location: "Compartir Ubicación",
    location_permission: "Comparte la ubicación de tu dispositivo para configurar las coordenadas de tu restaurante automáticamente.",
    get_started: "Comenzar",
    creating: "Creando...",
    error_restaurant_required: "Por favor ingresa el nombre de tu restaurante",
    error_auth: "Error: Usuario no autenticado",
    error_creating: "Error al crear la organización",
    coordinates: "",
    
    // Login Page
    login: "Iniciar Sesión",
    login_description: "Ingresa tu correo y contraseña",
    signup: "Crear Cuenta",
    signup_description: "Ingresa tus datos para registrarte",
    email: "Correo electrónico",
    email_placeholder: "tu@restaurante.com",
    password: "Contraseña",
    password_placeholder: "••••••••",
    confirm_password: "Confirmar Contraseña",
    creating_account: "Creando cuenta...",
    signing_in: "Entrando...",
    sending_link: "Enviando...",
    forgot_password: "¿Olvidaste tu contraseña?",
    no_account: "¿No tienes cuenta? Regístrate",
    have_account: "¿Ya tienes cuenta? Inicia sesión",
    reset_password: "Recuperar Contraseña",
    reset_description: "Te enviaremos un enlace para restablecer tu contraseña",
    reset_sent: "¡Correo Enviado!",
    check_email: `Revisa tu correo`,
    back_to_login: "Volver a iniciar sesión",
    problems: "¿Problemas para entrar? Contacta a tu administrador.",
    
    // Validation
    invalid_email: "Por favor ingresa un correo válido",
    password_min: "La contraseña debe tener al menos 6 caracteres",
    passwords_not_match: "Las contraseñas no coinciden",
    
    // Toast messages
    account_created: "¡Cuenta creada!",
    can_now_login: "Ya puedes iniciar sesión.",
    
    // Dashboard
    dashboard: "Panel de Control",
    loading: "Cargando...",
    verifying: "Verificando permisos...",
    access_error: "Error de Acceso",
    no_account_verification: "No pudimos verificar tu cuenta.",
    
    // Navigation
    products: "Productos",
    usage: "Uso",
    suppliers: "Proveedores",
    rules: "Reglas",
    orders: "Pedidos",
    integrations: "Integraciones",
    locations: "Ubicaciones",
    settings: "Configuración",
    manager_dashboard: "Panel del Gerente",
  }
};

// Get current locale
export const getLocale = (): string => {
  // Check localStorage first
  const saved = localStorage.getItem('restocka_locale');
  if (saved) return saved;
  
  // Check browser
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  if (browserLang.startsWith('es') || browserLang.startsWith('sp')) {
    return 'es';
  }
  return 'en';
};

// Translation helper
export const t = (key: string): string => {
  const locale = getLocale();
  const trans = translations[locale as keyof typeof translations] || translations.en;
  return (trans as Record<string, string>)[key] || translations.en[key] || key;
};

// Format coordinates for display
export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};
