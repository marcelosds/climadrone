// Demo script to test core functionality
const { assessFlightConditions } = require('./src/utils/flightAssessment.js');
const { DRONE_MODELS } = require('./src/constants/index.js');

// Mock weather data for testing
const testWeatherData = {
  windSpeed: 15, // km/h
  windGust: 20,  // km/h
  windDirection: 45,
  visibility: 10, // km
  clouds: 25,
  weather: { main: 'Clear', description: 'Céu limpo' },
  temperature: 22
};

const testSettings = {
  maxWindSpeed: 35,
  maxGustSpeed: 45,
  minVisibility: 3
};

console.log('🎯 Testando Avaliação de Condições de Voo\n');

// Test 1: Boas condições
console.log('Teste 1: Boas condições');
const goodConditions = assessFlightConditions(testWeatherData, testSettings, 'DJI Mini 4K');
console.log(`Condição: ${goodConditions.message}`);
console.log(`Ícone: ${goodConditions.icon}`);
console.log(`Problemas: ${goodConditions.issues.length === 0 ? 'Nenhum' : goodConditions.issues.join(', ')}
`);

// Test 2: Condições com atenção (vento elevado)
console.log('Teste 2: Condições com atenção');
const cautionWeather = {
  ...testWeatherData,
  windSpeed: 30, // 85% do limite
  windGust: 38
};
const cautionConditions = assessFlightConditions(cautionWeather, testSettings, 'DJI Mini 4K');
console.log(`Condição: ${cautionConditions.message}`);
console.log(`Ícone: ${cautionConditions.icon}`);
console.log(`Problemas: ${cautionConditions.issues.join(', ')}
`);

// Test 3: Condições não recomendadas (vento perigoso)
console.log('Teste 3: Condições não recomendadas');
const dangerousWeather = {
  ...testWeatherData,
  windSpeed: 40, // Acima do limite
  windGust: 50   // Acima do limite de rajadas
};
const dangerousConditions = assessFlightConditions(dangerousWeather, testSettings, 'DJI Mini 4K');
console.log(`Condição: ${dangerousConditions.message}`);
console.log(`Ícone: ${dangerousConditions.icon}`);
console.log(`Problemas: ${dangerousConditions.issues.join(', ')}
`);

// Test 4: Baixa visibilidade
console.log('Teste 4: Baixa visibilidade');
const lowVisibilityWeather = {
  ...testWeatherData,
  visibility: 2 // Abaixo do mínimo
};
const lowVisibilityConditions = assessFlightConditions(lowVisibilityWeather, testSettings, 'DJI Mini 4K');
console.log(`Condição: ${lowVisibilityConditions.message}`);
console.log(`Ícone: ${lowVisibilityConditions.icon}`);
console.log(`Problemas: ${lowVisibilityConditions.issues.join(', ')}
`);

// Test 5: Chuva
console.log('Teste 5: Condições de chuva');
const rainyWeather = {
  ...testWeatherData,
  weather: { main: 'Rain', description: 'Chuva leve' }
};
const rainyConditions = assessFlightConditions(rainyWeather, testSettings, 'DJI Mini 4K');
console.log(`Condição: ${rainyConditions.message}`);
console.log(`Ícone: ${rainyConditions.icon}`);
console.log(`Problemas: ${rainyConditions.issues.join(', ')}
`);

console.log('✅ Testes concluídos!');
console.log('\n📱 O aplicativo está pronto para uso!');
console.log('🔄 Configure sua chave de API do OpenWeatherMap em src/constants/index.js');
console.log('📍 Conceda permissões de localização quando solicitado');
console.log('🌤️ Avalie as condições de voo com segurança!');