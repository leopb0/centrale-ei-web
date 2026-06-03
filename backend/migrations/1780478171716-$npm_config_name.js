/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export default class  $npmConfigName1780478171716 {
    name = ' $npmConfigName1780478171716'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "temporary_movie" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "name" varchar NOT NULL,
                "director" varchar,
                "releaseYear" integer,
                "duration" integer,
                "synopsis" varchar,
                "rating" float,
                "imageUrl" varchar,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
                "genre" varchar,
                "popularity" float NOT NULL DEFAULT (0),
                "minAge" integer NOT NULL DEFAULT (0),
                "languages" text
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_movie"(
                    "id",
                    "name",
                    "director",
                    "releaseYear",
                    "duration",
                    "synopsis",
                    "rating",
                    "imageUrl",
                    "createdAt",
                    "updatedAt"
                )
            SELECT "id",
                "name",
                "director",
                "releaseYear",
                "duration",
                "synopsis",
                "rating",
                "imageUrl",
                "createdAt",
                "updatedAt"
            FROM "movie"
        `);
        await queryRunner.query(`
            DROP TABLE "movie"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_movie"
                RENAME TO "movie"
        `);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "movie"
                RENAME TO "temporary_movie"
        `);
        await queryRunner.query(`
            CREATE TABLE "movie" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "name" varchar NOT NULL,
                "director" varchar,
                "releaseYear" integer,
                "duration" integer,
                "synopsis" varchar,
                "rating" float,
                "imageUrl" varchar,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                "updatedAt" datetime NOT NULL DEFAULT (datetime('now'))
            )
        `);
        await queryRunner.query(`
            INSERT INTO "movie"(
                    "id",
                    "name",
                    "director",
                    "releaseYear",
                    "duration",
                    "synopsis",
                    "rating",
                    "imageUrl",
                    "createdAt",
                    "updatedAt"
                )
            SELECT "id",
                "name",
                "director",
                "releaseYear",
                "duration",
                "synopsis",
                "rating",
                "imageUrl",
                "createdAt",
                "updatedAt"
            FROM "temporary_movie"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_movie"
        `);
    }
}
