# ClimaDrone - App para Pilotos de Drone

Um aplicativo móvel multiplataforma desenvolvido com React Native + Expo para ajudar pilotos de drone a avaliar condições climáticas e operacionais para voo seguro.

## 🎯 Funcionalidades Principais

### 1. Bússola do Vento
- Interface visual com bússola circular e marcações em graus (0° a 360°)
- Indicação textual da direção do vento (ex: "Vento soprando para 39° NE")
- Seta indicando direção do vento
- Exibição de velocidade do vento e rajadas (km/h)
- Atualização automática dos dados

### 2. Mapa Interativo
- Mapa com react-native-maps (Google Maps)
- Localização atual do usuário
- Área circular de operação do drone (500m raio)
- Setor direcional do vento
- Zonas de aviso aeronáutico:
  - Aeroportos (zona laranja)
  - Áreas restritas (zona vermelha)
- Controles de zoom e centralização

### 3. Condições de Voo
- Card principal de status com três níveis:
  - 🟢 Boas condições para voo
  - 🟡 Voo com atenção
  - 🔴 Voo não recomendado
- Avaliação automática baseada em:
  - Velocidade do vento
  - Rajadas
  - Visibilidade
  - Precipitação
  - Cobertura de nuvens
- Informações detalhadas: temperatura, umidade, pressão, visibilidade, horários do sol

### 4. Configurações
- **Limites personalizáveis:**
  - Limite máximo de vento
  - Limite máximo de rajada
  - Limite mínimo de visibilidade
- **Unidades configuráveis:**
  - Vento: km/h ou m/s
  - Temperatura: °C ou °F
  - Visibilidade: km ou milhas
- **Modelo do Drone:**
  - Seleção de modelo (DJI Mini 4K, Mini 3, Air 2S, Mavic 3)
  - Ajuste automático dos limites conforme o drone
- Botão "Restaurar Padrões"

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React Native + Expo (JavaScript)
- **Navegação:** @react-navigation/bottom-tabs
- **Mapas:** react-native-maps
- **Localização:** expo-location
- **Armazenamento:** @react-native-async-storage/async-storage
- **APIs:** OpenWeatherMap API
- **Estado Global:** Context API

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 20.19.4 ou superior (SDK 54)
- Expo (npx expo)
- EAS CLI (npx eas)
- Conta no OpenWeatherMap (para obter chave de API)

### Passos de Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd ClimaDrone
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure a chave de API do OpenWeatherMap (seguro, via ambiente)**
   - Crie o arquivo `.env.local` na raiz do projeto
   - Adicione sua chave:
```env
OPENWEATHER_API_KEY=SEU_VALOR_AQUI
```
   - A chave é lida automaticamente por `app.config.js` e exposta em `expo.extra.openWeatherApiKey`
   - Em produção (EAS Build), crie o segredo:
```bash
npx eas secret:create --name OPENWEATHER_API_KEY --value SEU_VALOR_AQUI
```
### Padronização de variáveis de ambiente

- Em runtime, o app lê configurações apenas de `expo.extra` via `expo-constants` (Constants.expoConfig.extra).
- Fallbacks para `process.env` no código foram removidos; use `EXPO_PUBLIC_*` apenas para valores não sensíveis que precisam ser inlinados no bundle.
- O arquivo `app.config.js` mapeia variáveis de ambiente para `expo.extra` e para chaves nativas quando necessário:
  - `expo.extra.openWeatherApiKey` — OpenWeatherMap
  - `expo.extra.googleMapsApiKey` — Google Maps (geocoding HTTP e nativo Android/iOS)
  - `expo.extra.openAipApiKey` — OpenAIP
  - `expo.extra.firebase` — Configuração Firebase (apiKey, authDomain, projectId, etc.)
  - `expo.extra.googleOAuth` — Client IDs do Google OAuth
- Em produção (EAS Build), crie secrets correspondentes no EAS:
```bash
npx eas secret:create --name GOOGLE_MAPS_API_KEY --value SEU_VALOR
npx eas secret:create --name OPENAIP_API_KEY --value SEU_VALOR
npx eas secret:create --name FIREBASE_API_KEY --value SEU_VALOR
npx eas secret:create --name FIREBASE_AUTH_DOMAIN --value SEU_VALOR
npx eas secret:create --name FIREBASE_PROJECT_ID --value SEU_VALOR
npx eas secret:create --name FIREBASE_STORAGE_BUCKET --value SEU_VALOR
npx eas secret:create --name FIREBASE_MESSAGING_SENDER_ID --value SEU_VALOR
npx eas secret:create --name FIREBASE_APP_ID --value SEU_VALOR
npx eas secret:create --name GOOGLE_OAUTH_ANDROID_CLIENT_ID --value SEU_VALOR
npx eas secret:create --name GOOGLE_OAUTH_IOS_CLIENT_ID --value SEU_VALOR
npx eas secret:create --name GOOGLE_OAUTH_WEB_CLIENT_ID --value SEU_VALOR
```
- Observações:
  - Chaves nativas do Google Maps exigem rebuild para surtir efeito.
  - Evite usar `EXPO_PUBLIC_*` para segredos; prefira secrets no EAS e `expo.extra`.

4. **Configure as permissões no app.json**
As permissões já estão configuradas no arquivo `app.json`:
```json
"android": {
  "permissions": [
    "ACCESS_FINE_LOCATION",
    "ACCESS_COARSE_LOCATION",
    "INTERNET"
  ]
}
```

5. **Execute o aplicativo**
```bash
# Para Android
npm run android

# Para iOS (requer macOS)
npm run ios

# Para web
npm run web
```

### Desenvolvimento com Dev Client (opcional)
- Gerar build de desenvolvimento (APK interno):
```bash
npm run eas:build:android:dev
```
- Instale o APK no dispositivo e inicie o servidor:
```bash
npm run start:dev
```

## 🚀 Build com EAS

- Preview (APK interno para testes):
```bash
npm run eas:build:android:preview
```
- Produção (Android AAB para Play Store):
```bash
npm run eas:build:android
```
- Produção (iOS):
```bash
npm run eas:build:ios
```
- Submissão:
```bash
npm run eas:submit:android
npm run eas:submit:ios
```

### Notas de Configuração
- Project ID do EAS está definido em `expo.extra.eas.projectId`
- URI scheme configurado: `climadrone` (deep linking para dev client)
- Perfis de build configurados em `eas.json` (development, preview, production)
- DEBUG: habilitado por padrão via `expo.extra.debug`. Para desativar em build, defina `APP_DEBUG=false` no ambiente antes de construir.

## 🧠 Regras de Negócio

### Avaliação de Condições de Voo
- **Sistema de pontuação:**
  - Rajadas têm peso maior na decisão (4 pontos negativos se acima do limite)
  - Vento acima do limite: 3 pontos negativos
  - Visibilidade baixa: 2 pontos negativos
  - Precipitação: 2-4 pontos negativos dependendo do tipo
  - Cobertura de nuvens muito alta: 1 ponto negativo

### Classificação Final
- **🟢 Boas condições:** Pontuação >= 0
- **🟡 Voo com atenção:** Pontuação entre -1 e -3
- **🔴 Voo não recomendado:** Pontuação <= -4

## 📱 Arquitetura do App

```
src/
├── components/          # Componentes reutilizáveis
│   ├── WindCompass.js
│   ├── FlightConditionCard.js
│   └── FlightMap.js
├── screens/             # Telas principais
│   ├── WindCompassScreen.js
│   ├── MapScreen.js
│   ├── FlightConditionsScreen.js
│   └── SettingsScreen.js
├── services/            # Serviços de API
│   ├── weatherService.js
│   └── locationService.js
├── hooks/               # Hooks personalizados
│   └── useWeather.js
├── contexts/            # Context API
│   └── AppContext.js
├── utils/               # Utilitários
│   ├── flightAssessment.js
│   └── storage.js
├── constants/           # Constantes e configurações
│   └── index.js
└── navigation/          # Navegação
    └── AppNavigator.js
```

## 🔧 Personalização

### Adicionar Novos Modelos de Drone
Edite `src/constants/index.js` e adicione ao objeto `DRONE_MODELS`:

```javascript
'Novo Modelo': {
  maxWindSpeed: 50,
  maxGustSpeed: 60,
  minVisibility: 2,
  name: 'Novo Modelo'
}
```

### Modificar Cores
As cores principais estão definidas em `src/constants/index.js`:

```javascript
export const COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  // ... outras cores
};
```

## 🚨 Tratamento de Erros

O aplicativo inclui tratamento de erros para:
- Falhas na API de clima
- Permissões de localização negadas
- Conexão de internet indisponível
- Dados offline (cache local)

## 📊 Funcionalidades Offline

- Cache local com AsyncStorage
- Últimos dados salvos disponíveis offline
- Configurações persistentes

## 🧪 Testes

Para testar o aplicativo:
1. Conceda permissões de localização quando solicitado
2. Verifique se a chave de API está configurada corretamente
3. Teste em diferentes condições de clima
4. Verifique a navegação entre telas
5. Teste as configurações e personalizações

## 📄 Licença

Este projeto está licenciado sob a licença MIT.

## 🤝 Contribuições

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

## 📞 Suporte

Para suporte, entre em contato através das issues do GitHub.
