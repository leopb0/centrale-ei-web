/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export default class  $npmConfigName1780562044324 {
    name = ' $npmConfigName1780562044324'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "email" varchar NOT NULL,
                "firstname" varchar NOT NULL,
                "lastname" varchar NOT NULL,
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "movie" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "name" varchar NOT NULL,
                "actors" text,
                "director" varchar,
                "releaseYear" integer,
                "duration" integer,
                "synopsis" varchar,
                "rating" float,
                "imageUrl" varchar,
                "genre" varchar,
                "popularity" float NOT NULL DEFAULT (0),
                "minAge" integer NOT NULL DEFAULT (0),
                "languages" text,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                "updatedAt" datetime NOT NULL DEFAULT (datetime('now'))
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "like" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "isLike" boolean NOT NULL,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                "userId" integer,
                "movieId" integer
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_like" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "isLike" boolean NOT NULL,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                "userId" integer,
                "movieId" integer,
                CONSTRAINT "FK_e8fb739f08d47955a39850fac23" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_fd72fd2d7c017a2ee03592829ae" FOREIGN KEY ("movieId") REFERENCES "movie" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_like"("id", "isLike", "createdAt", "userId", "movieId")
            SELECT "id",
                "isLike",
                "createdAt",
                "userId",
                "movieId"
            FROM "like"
        `);
        await queryRunner.query(`
            DROP TABLE "like"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_like"
                RENAME TO "like"
        `);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "like"
                RENAME TO "temporary_like"
        `);
        await queryRunner.query(`
            CREATE TABLE "like" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "isLike" boolean NOT NULL,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                "userId" integer,
                "movieId" integer
            )
        `);
        await queryRunner.query(`
            INSERT INTO "like"("id", "isLike", "createdAt", "userId", "movieId")
            SELECT "id",
                "isLike",
                "createdAt",
                "userId",
                "movieId"
            FROM "temporary_like"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_like"
        `);
        await queryRunner.query(`
            DROP TABLE "like"
        `);
        await queryRunner.query(`
            DROP TABLE "movie"
        `);
        await queryRunner.query(`
            DROP TABLE "user"
        `);
    }
}
