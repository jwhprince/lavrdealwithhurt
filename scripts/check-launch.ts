import { loadEnvConfig } from '@next/env';
import { launchErrors } from '../src/lib/launch';
loadEnvConfig(process.cwd());
const errors = launchErrors(process.env, true);
if (errors.length) { console.error('Публикация ещё не готова:\n' + errors.map(error => `- ${error}`).join('\n')); process.exitCode = 1; }
else console.log('Конфигурация готова. Перед запуском проверьте доставку письма, документы и домен.');
