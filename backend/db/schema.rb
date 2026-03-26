# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_03_26_021703) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  # Custom types defined in this database.
  # Note that some types may not work with other database engines. Be careful if changing database.
  create_enum "player_role", ["hard_carry", "mid_laner", "offlaner", "support_4", "support_5", "coach"]
  create_enum "scrim_status", ["scheduled", "completed", "cancelled"]
  create_enum "server_host", ["weu", "br", "arg"]
  create_enum "time_slot_status", ["available", "booked", "cancelled"]
  create_enum "user_role", ["admin", "manager"]

  create_table "players", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "mmr", null: false
    t.string "nickname", null: false
    t.enum "role", null: false, enum_type: "player_role"
    t.bigint "team_id", null: false
    t.datetime "updated_at", null: false
    t.index ["team_id", "role"], name: "index_players_on_team_id_and_role", unique: true
    t.index ["team_id"], name: "index_players_on_team_id"
  end

  create_table "scrims", force: :cascade do |t|
    t.text "cancellation_reason"
    t.timestamptz "cancelled_at"
    t.bigint "challenger_team_id", null: false
    t.datetime "created_at", null: false
    t.string "lobby_name"
    t.string "lobby_password"
    t.text "notes"
    t.enum "server_host", enum_type: "server_host"
    t.enum "status", default: "scheduled", null: false, enum_type: "scrim_status"
    t.bigint "time_slot_id", null: false
    t.datetime "updated_at", null: false
    t.index ["challenger_team_id"], name: "index_scrims_on_challenger_team_id"
    t.index ["status"], name: "index_scrims_on_status"
    t.index ["time_slot_id"], name: "index_scrims_on_time_slot_id", unique: true
  end

  create_table "teams", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "manager_email", null: false
    t.bigint "manager_id", null: false
    t.string "manager_name", null: false
    t.string "name", null: false
    t.string "timezone", limit: 50, null: false
    t.datetime "updated_at", null: false
    t.index ["manager_email"], name: "index_teams_on_manager_email"
    t.index ["manager_id"], name: "index_teams_on_manager_id"
    t.index ["name"], name: "index_teams_on_name"
  end

  create_table "time_slots", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "created_by_id", null: false
    t.timestamptz "ends_at", null: false
    t.timestamptz "starts_at", null: false
    t.enum "status", default: "available", null: false, enum_type: "time_slot_status"
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_time_slots_on_created_by_id"
    t.index ["starts_at"], name: "index_time_slots_on_starts_at", unique: true
    t.index ["status"], name: "index_time_slots_on_status"
    t.check_constraint "ends_at > starts_at", name: "check_ends_at_after_starts_at"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "jti", null: false
    t.enum "role", default: "manager", null: false, enum_type: "user_role"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
  end

  add_foreign_key "players", "teams", on_delete: :cascade
  add_foreign_key "scrims", "teams", column: "challenger_team_id", on_delete: :restrict
  add_foreign_key "scrims", "time_slots", on_delete: :restrict
  add_foreign_key "teams", "users", column: "manager_id", on_delete: :cascade
  add_foreign_key "time_slots", "users", column: "created_by_id", on_delete: :restrict
end
