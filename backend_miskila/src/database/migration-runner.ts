import { AppDataSource } from './data-source.js';

AppDataSource.initialize()
  .then(() => AppDataSource.runMigrations())
  .then(() => AppDataSource.destroy())
  .catch(async (error) => {
    console.error(error);
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
    process.exitCode = 1;
  });
