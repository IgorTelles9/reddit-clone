"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20230309201110 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20230309201110 extends migrations_1.Migration {
    async up() {
        this.addSql('create table "post" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" text not null);');
    }
    async down() {
        this.addSql('drop table if exists "post" cascade;');
    }
}
exports.Migration20230309201110 = Migration20230309201110;
//# sourceMappingURL=Migration20230309201110.js.map