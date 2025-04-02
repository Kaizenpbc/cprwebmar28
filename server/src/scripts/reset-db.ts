import knex from '../config/db';

async function logStep(step: string, fn: () => Promise<any>) {
    const startTime = Date.now();
    process.stdout.write(`\n[${new Date().toISOString()}] ${step}...`);
    try {
        const result = await fn();
        const duration = Date.now() - startTime;
        process.stdout.write(`\n✓ Done (${duration}ms)\n`);
        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        process.stdout.write(`\n✗ Failed (${duration}ms)\n`);
        console.error('Error:', error);
        throw error;
    }
}

async function resetDatabase() {
    try {
        console.log('\n=== Starting Database Reset ===');
        console.log('Time:', new Date().toISOString());
        console.log('Current directory:', process.cwd());

        // Drop all tables and types
        await logStep('Dropping all tables and types', async () => {
            // Drop all tables
            await knex.raw(`
                DO $$ DECLARE
                    r RECORD;
                BEGIN
                    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                    END LOOP;
                END $$;
            `);

            // Drop all enum types
            await knex.raw(`
                DO $$ DECLARE
                    r RECORD;
                BEGIN
                    FOR r IN (
                        SELECT t.typname
                        FROM pg_type t
                        JOIN pg_namespace n ON t.typnamespace = n.oid
                        WHERE n.nspname = 'public'
                        AND t.typtype = 'e'
                    ) LOOP
                        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
                    END LOOP;
                END $$;
            `);
        });

        console.log('\n=== Database Reset Complete ===');
        console.log('Time:', new Date().toISOString());
        console.log('\nNow you can run migrations to recreate the tables.');
        process.exit(0);
    } catch (error) {
        console.error('\n=== Database Reset Failed ===');
        console.error('Error details:', error);
        process.exit(1);
    }
}

resetDatabase(); 