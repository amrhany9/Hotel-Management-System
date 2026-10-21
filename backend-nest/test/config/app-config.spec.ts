import { ConfigurationError, loadAppConfig } from '../../src/config/app.config';
import { DEVELOPMENT_JWT_KEY } from '../../src/config/env.schema';

const PRODUCTION_SECRETS = {
  NODE_ENV: 'production',
  JWT_KEY: 'a_real_production_secret_with_more_than_32_bytes',
  CORS_ALLOWED_ORIGINS: 'https://hotel.example.com',
  DB_PASSWORD: 'Str0ng!Passw0rd',
};

describe('AppConfigTests', () => {
  it('Development_UsesSafeLocalDefaults', () => {
    const config = loadAppConfig({ NODE_ENV: 'development' });

    expect(config).toMatchObject({
      env: 'development',
      isProduction: false,
      port: 5001,
      corsAllowedOrigins: ['http://localhost:4200'],
      swagger: { enabled: true },
      logging: { level: 'debug', json: false },
      jwt: { key: DEVELOPMENT_JWT_KEY },
    });
    expect(config.database).toMatchObject({ encrypt: false, trustServerCertificate: true });
  });

  it('MissingNodeEnv_DefaultsToProduction', () => {
    expect(() => loadAppConfig({})).toThrow(ConfigurationError);
    expect(loadAppConfig({ ...PRODUCTION_SECRETS, NODE_ENV: undefined }).env).toBe('production');
  });

  it('Production_UsesSecureDefaults', () => {
    const config = loadAppConfig(PRODUCTION_SECRETS);

    expect(config).toMatchObject({
      isProduction: true,
      swagger: { enabled: false },
      logging: { level: 'log', json: true },
      corsAllowedOrigins: ['https://hotel.example.com'],
    });
    expect(config.database).toMatchObject({ encrypt: true, trustServerCertificate: false });
  });

  it('Production_RefusesToStartWithoutSecrets', () => {
    let message = '';
    try {
      loadAppConfig({ NODE_ENV: 'production' });
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toContain('JWT_KEY');
    expect(message).toContain('CORS_ALLOWED_ORIGINS');
    expect(message).toContain('DB_PASSWORD');
  });

  it('Production_RejectsThePublicDevelopmentJwtKey', () => {
    expect(() => loadAppConfig({ ...PRODUCTION_SECRETS, JWT_KEY: DEVELOPMENT_JWT_KEY })).toThrow(
      /must not be the public development key/,
    );
  });

  it('InvalidValues_AreReportedWithTheVariableName', () => {
    expect(() => loadAppConfig({ NODE_ENV: 'development', PORT: 'eighty' })).toThrow(/PORT/);
    expect(() => loadAppConfig({ NODE_ENV: 'development', DB_TYPE: 'oracle' })).toThrow(/DB_TYPE/);
    expect(() => loadAppConfig({ NODE_ENV: 'development', JWT_KEY: 'short' })).toThrow(/at least 32 bytes/);
  });

  it('ExplicitSettings_OverrideEnvironmentDefaults', () => {
    const config = loadAppConfig({ ...PRODUCTION_SECRETS, SWAGGER_ENABLED: 'true', LOG_FORMAT: 'pretty', DB_ENCRYPT: 'false' });

    expect(config.swagger.enabled).toBe(true);
    expect(config.logging.json).toBe(false);
    expect(config.database.encrypt).toBe(false);
  });

  it('EmptyValues_AreTreatedAsNotSet', () => {
    const config = loadAppConfig({ NODE_ENV: 'development', DB_INSTANCE: '', PORT: '  ' });

    expect(config.database.instanceName).toBeUndefined();
    expect(config.port).toBe(5001);
  });
});
