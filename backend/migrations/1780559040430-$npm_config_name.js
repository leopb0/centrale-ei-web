/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export default class  $npmConfigName1780559040430 {
    name = ' $npmConfigName1780559040430'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
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
    }
}
